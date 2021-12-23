import {
  ApiResponseDto,
  ChainResponseDto,
  ServiceResponseDto,
  TokenResponseDto,
} from "../common/dtos";
import prisma from "../helpers/db";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { mapTokenToDto } from "../helpers/mappers/mapperDto";
import { ServerError } from "../helpers/serviceErrorHelper";
require("dotenv").config();


export const getTokens = async (chainId: string) : Promise<ServiceResponseDto> => {
  let response: ServiceResponseDto = {
    status: 200,
    data: null,
  };

  let apiResponse: ApiResponseDto = {
    success: true,
    result: [],
  };

  try {
    const parsedChainId = Number.parseInt(chainId);
    const chain = await prisma.chain.findFirst({
      where: {
        chainId: parsedChainId,
      },
    });

    if (chain) {
      const chainTokens = await prisma.chainsOnTokens.findMany({
        where: {
          chain_id: chain.id,
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
          chain: {
            select: {
              id: true,
              chainId: true,
            },
          },
        },
      });
      const tokens: TokenResponseDto[] = [];
      for (let i = 0; i < chainTokens.length; i++) {
        const item = chainTokens[i];
        const dto: TokenResponseDto = mapTokenToDto(item.token, item.chain.id);
        tokens.push(dto);
      }
      apiResponse.result = tokens;
      response.data = apiResponse;
      return response;
    }
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

export const getChains = async () : Promise<ServiceResponseDto> => {
  let response: ServiceResponseDto = {
    status: 200,
    data: null,
  };

  let apiResponse: ApiResponseDto = {
    success: true,
    result: [],
  };

  try {
    const chains = await prisma.chain.findMany({
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
          isL1: item.is_l1,
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
