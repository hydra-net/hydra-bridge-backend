import {
  BuildBridgeTxRequestDto,
  BuildBridgeTxResponseDto,
  GetBridgeTxRequestDto,
  QuoteRequestDto,
  QuoteResponseDto,
  ServiceResponseDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../helpers/serviceErrorHelper";
import { mapTokenToDto } from "../helpers/mappers/mapperDto";
import "dotenv/config";
import { getTokenById } from "../helpers/database/tokensDbHelper";
import { getChainByChainId } from "../helpers/database/chainsDbHelper";
import { getRouteWithBridges } from "../helpers/database/bridgeServiceDbHelper";
import {
  getHopRoute,
  getPolygonRoute,
  getQuoteRoutes,
} from "../helpers/serviceHelpers/bridgeServiceHelper";
import { getIsApproved } from "../helpers/contractHelper";
import { Asset } from "../common/enums";

export const getQuote = async (
  dto: QuoteRequestDto
): Promise<ServiceResponseDto<QuoteResponseDto>> => {
  try {
    const token = await getTokenById(Number.parseInt(dto.fromAsset));

    const chainFrom = await getChainByChainId(Number.parseInt(dto.fromChainId));

    const chainTo = await getChainByChainId(Number.parseInt(dto.toChainId));

    if (!token) {
      return NotFound("Asset not found!");
    }

    if (!chainFrom) {
      return BadRequest("Chain from not found!");
    }

    if (!chainTo) {
      return BadRequest("Chain to not found!");
    }

    if (!chainFrom.is_sending_enabled && !chainTo.is_receiving_enabled) {
      return BadRequest("Transfer between chains not supported");
    }

    if (chainFrom.id === chainTo.id) {
      return BadRequest("Pick different chains");
    }

    let isApproved = false;
    const isEth = token.symbol.toString().toLowerCase() === Asset[Asset.eth];

    if (!isEth) {
      isApproved = await getIsApproved(
        {
          amount: dto.amount,
          decimals: token.decimals,
          recipient: dto.recipient,
          tokenAddress: token.address,
        },
        chainFrom.chainId,
        chainFrom.name
      );
    }

    return {
      status: 200,
      data: {
        fromAsset: mapTokenToDto(token, chainFrom.chainId, chainFrom.name),
        fromChainId: chainFrom.chainId,
        toAsset: mapTokenToDto(token, chainTo.chainId, chainFrom.name),
        toChainId: chainTo.chainId,
        routes: await getQuoteRoutes(
          token,
          chainFrom,
          chainTo,
          dto,
          isApproved,
          isEth
        ),
        amount: dto.amount,
        isApproved: isApproved,
      },
    };
  } catch (e) {
    consoleLogger.error("Error getting quote", e);
    hydraLogger.error("Error getting quote", e);
    return ServerError(e.message);
  }
};

export const buildTx = async (
  dto: BuildBridgeTxRequestDto
): Promise<ServiceResponseDto<BuildBridgeTxResponseDto>> => {
  try {
    if (dto.fromAsset !== dto.toAsset && dto.fromChainId === dto.toChainId) {
      return BadRequest();
    }

    const token = await getTokenById(Number.parseInt(dto.fromAsset));
    if (!token) {
      return NotFound("Asset not found!");
    }

    const chainFrom = await getChainByChainId(Number.parseInt(dto.fromChainId));
    if (!chainFrom) {
      return BadRequest("Chain from not found!");
    }

    const chainTo = await getChainByChainId(Number.parseInt(dto.toChainId));
    if (!chainTo) {
      return BadRequest("Chain to not found!");
    }

    const route = await getRouteWithBridges(
      Number.parseInt(dto.routeId),
      chainFrom.id,
      chainTo.id
    );

    if (!route) {
      return NotFound("Route not found!");
    }

    const txRouteDto: GetBridgeTxRequestDto = {
      recipient: dto.recipient,
      amount: dto.amount,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      decimals: token.decimals,
    };

    if (
      route.bridge.name === "polygon-bridge" ||
      route.bridge.name === "polygon-bridge-goerli"
    ) {
      return {
        status: 200,
        data: await getPolygonRoute(txRouteDto, chainFrom.chainId),
      };
    }
    if (
      route.bridge.name === "hop-bridge" ||
      route.bridge.name === "hop-bridge-goerli"
    ) {
      return {
        status: 200,
        data: await getHopRoute(
          txRouteDto,
          chainFrom.chainId,
          chainTo.chainId,
          route.bridge.is_testnet
        ),
      };
    }
  } catch (e) {
    consoleLogger.error("Error building bridge transaction", e);
    hydraLogger.error("Error building bridge transaction", e);
    return ServerError();
  }
};
