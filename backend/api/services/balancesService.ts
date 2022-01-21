import {
  ApiResponseDto,
  ServiceResponseDto,
  TokenBalanceResponseDto,
} from "../common/dtos";
import { ServerError } from "../helpers/serviceErrorHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { getProvider, getProviderUrl } from "../helpers/web3";
import { getTokensByChainId } from "./commonService/commonServiceHelper";
import { mapTokenBalanceToDto } from "../helpers/mappers/mapperDto";
import { fetchAllTokenPrices } from "./coingeckoService";
import Web3 from "web3";

export const getWalletBalances = async (address: string, chainId: string) => {
  const balancesResponse: ApiResponseDto<TokenBalanceResponseDto[]> = {
    success: true,
    result: null,
  };
  const response: ServiceResponseDto<TokenBalanceResponseDto[]> = {
    status: 200,
    data: balancesResponse,
  };

  try {
    const parsedChainId = parseInt(chainId);
    const tokens = await getTokensByChainId(parsedChainId);
    const provider = getProvider();
    const tokenBalances: TokenBalanceResponseDto[] = [];
    const tokenPrices = await fetchAllTokenPrices();
    for (const token of tokens) {
      const tokenPrice = tokenPrices.find(
        (tokenPrice) => tokenPrice.symbol === token.symbol.toLowerCase()
      );
      2;

      if (token.symbol === "ETH") {
        const web3 = new Web3(getProviderUrl());
        const balance = await web3.eth.getBalance(address);
        const tokenBalance = mapTokenBalanceToDto(
          token,
          tokenPrice.price,
          balance
        );
        tokenBalances.push(tokenBalance);
      } else {
        const tokenContract = new ethers.Contract(
          token.address,
          erc20Abi,
          provider
        );

        const res = await tokenContract.functions.balanceOf(address);

        const tokenBalance = mapTokenBalanceToDto(
          token,
          tokenPrice.price,
          res.toString()
        );

        tokenBalances.push(tokenBalance);
      }
    }
    balancesResponse.result = tokenBalances;
    response.data = balancesResponse;
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};
