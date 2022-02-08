import { isTestnet } from "../common/constants";
import {
  ChainResponseDto,
  ServiceResponseDto,
  TokenResponseDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { ServerError } from "../helpers/serviceErrorHelper";
import { getTokensByChainId } from "../helpers/database/commonServiceDbHelper";
import { getChainsWithToken } from "../helpers/database/chainsDbHelper";
import { mapToChainResponseDto } from "../helpers/mappers/mapperDto";
import { Token } from "@prisma/client";

export const getTokens = async (
  chainId: string
): Promise<ServiceResponseDto<TokenResponseDto[]>> => {
  try {
    return {
      status: 200,
      data: await getTokensByChainId(parseInt(chainId)),
    };
  } catch (e) {
    consoleLogger.error("Error getting tokens", e);
    hydraLogger.error("Error getting tokens", e);
    return ServerError();
  }
};

export const getChains = async (): Promise<
  ServiceResponseDto<ChainResponseDto[]>
> => {
  try {
    const chainsResponse: ChainResponseDto[] = [];
    const chains = await getChainsWithToken(isTestnet);

    if (chains) {
      for (const chain of chains) {
        const dto = mapToChainResponseDto(chain, chain.token as Token);
        chainsResponse.push(dto);
      }
    }

    return {
      status: 200,
      data: chainsResponse,
    };
  } catch (e) {
    consoleLogger.error("Error getting chains", e);
    hydraLogger.error("Error getting chains", e);
    return ServerError();
  }
};
