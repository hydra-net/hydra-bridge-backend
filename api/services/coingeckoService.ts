import axios from "axios";
import { TokenPriceResponseDto } from "../common/dtos";
import { getGeckoToTokenSymbol } from "../helpers/coingeckoHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";

export const fetchEthUsdPrice = async (): Promise<number> => {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    return res.data.ethereum.usd;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return Promise.reject("Can't get price coingecko");
  }
};

export const fetchAllTokenPrices = async (): Promise<
  TokenPriceResponseDto[]
> => {
  const tokenPrices: TokenPriceResponseDto[] = [];
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd`
    );

    for (const i in response.data) {
      const tokeySymbol = getGeckoToTokenSymbol(i);
      const tokenPriceEth: TokenPriceResponseDto = {
        symbol: tokeySymbol,
        price: response.data[i].usd,
      };
      tokenPrices.push(tokenPriceEth);
    }
    return tokenPrices;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return Promise.reject("Can't get price coingecko");
  }
};
