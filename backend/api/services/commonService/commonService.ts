import { isTestnet } from "../../common/constants";
import {
  ApiResponseDto,
  ChainResponseDto,
  ServiceResponseDto,
  TokenResponseDto,
} from "../../common/dtos";
import prisma from "../../helpers/db";
import { consoleLogger, hydraLogger } from "../../helpers/hydraLogger";
import { ServerError } from "../../helpers/serviceErrorHelper";
import { getTokensByChainId } from "./commonServiceHelper";

export const getTokens = async (
  chainId: string
): Promise<ServiceResponseDto<TokenResponseDto[]>> => {
  const apiResponse: ApiResponseDto<TokenResponseDto[]> = {
    success: true,
    result: [],
  };

  const response: ServiceResponseDto<TokenResponseDto[]> = {
    status: 200,
    data: apiResponse,
  };

  try {
    const parsedChainId = parseInt(chainId);
    apiResponse.result = await getTokensByChainId(parsedChainId);
    response.data = apiResponse;
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

export const getChains = async (): Promise<
  ServiceResponseDto<ChainResponseDto[]>
> => {
  const apiResponse: ApiResponseDto<ChainResponseDto[]> = {
    success: true,
    result: [],
  };

  const response: ServiceResponseDto<ChainResponseDto[]> = {
    status: 200,
    data: apiResponse,
  };

  try {
    const chains = await prisma.chain.findMany({
      where: {
        is_testnet: isTestnet,
      },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            address: true,
            decimals: true,
            symbol: true,
          },
        },
      },
    });

    if (chains) {
      const chainsResponse: ChainResponseDto[] = [];
      for (let i = 0; i < chains.length; i++) {
        const item = chains[i];
        const dto: ChainResponseDto = {
          chainId: item.chainId,
          name: item.name,
          isLayer1: item.is_layer1,
          isTestnet: item.is_testnet,
          isReceivingEnabled: item.is_receiving_enabled,
          isSendingEnabled: item.is_sending_enabled,
          currency: {
            id: item.token.id,
            name: item.token.name,
            chainId: item.chainId,
            address: item.token.address,
            decimals: item.token.decimals,
            symbol: item.token.symbol,
          },
          explorers: item.explorers,
        };
        chainsResponse.push(dto);
      }
      apiResponse.result = chainsResponse;
      response.data = apiResponse;
    }

    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};
