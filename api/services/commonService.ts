import {
  ChainResponseDto,
  ServiceResponseDto,
  TokenResponseDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import { NotFound, ServerError } from "../helpers/serviceErrorHelper";
import { getTokensByChainId } from "../helpers/database/commonServiceDbHelper";
import {
  getChainByChainId,
  getChainsWithToken,
} from "../helpers/database/chainsDbHelper";
import { mapToChainResponseDto } from "../helpers/mappers/mapperDto";
import { Token } from "@prisma/client";

export const getTokens = async (
  chainId: string
): Promise<ServiceResponseDto<TokenResponseDto[]>> => {
  try {
    const chain = await getChainByChainId(parseInt(chainId));

    if (!chain) {
      return NotFound("Chain not found!");
    }

    return {
      status: 200,
      data: await getTokensByChainId(chain.id),
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
    const chains = await getChainsWithToken();

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
