import { ServiceResponseDto, TokenBalanceResponseDto } from "../common/dtos";
import { ServerError } from "../helpers/serviceErrorHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { getProviderUrl } from "../helpers/web3";
import { getTokensByChainId } from "../helpers/database/commonServiceDbHelper";
import { mapTokenBalanceToDto } from "../helpers/mappers/mapperDto";
import { fetchAllTokenPrices } from "./coingeckoService";
import Web3 from "web3";
import { Asset } from "../common/enums";
import { getErc20TokenBalance } from "../helpers/contractHelper";

export const getWalletBalances = async (
  address: string,
  chainId: string
): Promise<ServiceResponseDto<TokenBalanceResponseDto[]>> => {
  try {
    const parsedChainId = parseInt(chainId);

    const tokens = await getTokensByChainId(parsedChainId);
    const tokenBalances: TokenBalanceResponseDto[] = [];
    const tokenPrices = await fetchAllTokenPrices();

    for (const token of tokens) {
      const tokenPrice = tokenPrices.find(
        (tokenPrice) => tokenPrice.symbol === token.symbol.toLowerCase()
      );

      if (token.symbol.toString().toLowerCase() === Asset[Asset.eth]) {
        const web3 = new Web3(getProviderUrl());
        const balance = await web3.eth.getBalance(address);
        const tokenBalance = mapTokenBalanceToDto(
          token,
          tokenPrice.price,
          balance
        );
        tokenBalances.push(tokenBalance);
      } else {
        const balance = await getErc20TokenBalance(token.address, address);
        const tokenBalance = mapTokenBalanceToDto(
          token,
          tokenPrice.price,
          balance.toString()
        );

        tokenBalances.push(tokenBalance);
      }
    }

    return {
      status: 200,
      data: tokenBalances,
    };
  } catch (e) {
    consoleLogger.error("Error getting wallet balances", e);
    hydraLogger.error("Error getting wallet balances", e);
    return ServerError();
  }
};
