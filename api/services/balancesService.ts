import { ServiceResponseDto, TokenBalanceResponseDto } from "../common/dtos";
import { NotFound, ServerError } from "../helpers/serviceErrorHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { getEthWalletBalance } from "../helpers/web3";
import { getTokensByChainId } from "../helpers/database/commonServiceDbHelper";
import { mapTokenBalanceToDto } from "../helpers/mappers/mapperDto";
import { fetchAllTokenPrices } from "./coingeckoService";
import { Asset } from "../common/enums";
import { getErc20TokenBalance } from "../helpers/contractHelper";
import { getChainByChainId } from "../helpers/database/chainsDbHelper";

export const getWalletBalances = async (
  address: string,
  chainId: string
): Promise<ServiceResponseDto<TokenBalanceResponseDto[]>> => {
  try {
    const chain = await getChainByChainId(parseInt(chainId));

    if (!chain) {
      return NotFound("Chain not found!");
    }

    const tokens = await getTokensByChainId(chain.id);
    const tokenBalances: TokenBalanceResponseDto[] = [];
    const tokenPrices = await fetchAllTokenPrices();
    for (const token of tokens) {
      const tokenPrice = tokenPrices.find(
        (tokenPrice) => tokenPrice.symbol === token.symbol.toLowerCase()
      );

      if (token.symbol.toString().toLowerCase() === Asset[Asset.eth]) {
        const tokenBalance = mapTokenBalanceToDto(
          token,
          tokenPrice.price,
          await getEthWalletBalance(chain.name, address)
        );
        tokenBalances.push(tokenBalance);
      } else {
        const balance = await getErc20TokenBalance(
          token.address,
          address,
          chain.chainId,
          chain.name
        );
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
