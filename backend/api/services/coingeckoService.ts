import axios from "axios";
import { TokenPriceDto } from "../common/dtos";
import { getGeckoToTokenSymbol } from "../helpers/coingeckoHelper";

export const fetchEthUsdPrice = async (): Promise<number> => {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    return res.data.ethereum.usd;
  } catch (e) {
    console.log(e);
  }
};

export const fetchAllTokenPrices = async (): Promise<TokenPriceDto[]> => {
  const tokenPrices: TokenPriceDto[] = [];
  try {
    const response: any = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd`
    );
   
    for(const i in response.data)
    {
      const tokeySymbol = getGeckoToTokenSymbol(i);
      const tokenPriceEth: TokenPriceDto = {
        symbol: tokeySymbol,
        price: response.data[i].usd,
      };
      tokenPrices.push(tokenPriceEth);
    }
    return tokenPrices;
  } catch (e) {
    console.log(e);
    return []
  }
};
