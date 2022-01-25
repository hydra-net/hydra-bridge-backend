import {
  ApiResponseDto,
  BuildBridgeTxRequestDto,
  BuildBridgeTxResponseDto,
  GetBridgeTxRequestDto,
  QuoteRequestDto,
  QuoteResponseDto,
  RouteResponseDto,
  ServiceResponseDto,
} from "../common/dtos";
import { Asset } from "../common/enums";
import { ethers } from "ethers";
import { getTimestamp } from "../helpers/time";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../helpers/serviceErrorHelper";
import prisma from "../helpers/db";
import { mapRouteToDto, mapTokenToDto } from "../helpers/mappers/mapperDto";
import { calculateTransactionCost, getIsApproved } from "../helpers/web3";
import { fetchEthUsdPrice } from "./coingeckoService";
import { getHopAmountOut, getHopChain } from "../helpers/hopHelper";
import { parseUnits } from "ethers/lib/utils";
import { HYDRA_BRIDGE_INTERFACE, isTestnet } from "../common/constants";
import "dotenv/config";

const { ETH_CONTRACT, HOP_RELAYER, HOP_RELAYER_FEE, ETH_NETWORK } = process.env;

export const getQuote = async (
  dto: QuoteRequestDto
): Promise<ServiceResponseDto<QuoteResponseDto>> => {
  const quoteResp: ApiResponseDto<QuoteResponseDto> = {
    success: true,
    result: null,
  };

  const response: ServiceResponseDto<QuoteResponseDto> = {
    status: 200,
    data: quoteResp,
  };

  try {
    const token = await prisma.token.findFirst({
      where: {
        id: Number.parseInt(dto.fromAsset),
      },
    });

    const chainFrom = await prisma.chain.findFirst({
      where: {
        chainId: Number.parseInt(dto.fromChainId),
      },
    });

    const chainTo = await prisma.chain.findFirst({
      where: {
        chainId: Number.parseInt(dto.toChainId),
      },
    });

    if (!token || !chainFrom || !chainTo) {
      response.data = quoteResp;
      return response;
    }

    if (!chainFrom.is_sending_enabled && !chainTo.is_receiving_enabled) {
      return BadRequest("Transfer between chains not supported");
    }

    if (chainFrom.id === chainTo.id) {
      return BadRequest("Pick different chains");
    }

    const ethPrice = await fetchEthUsdPrice();

    const bridges = await prisma.bridge.findMany({
      where: {
        is_testnet: isTestnet,
      },
    });

    const bridgeIds = bridges.map((bridge) => bridge.id);
    const dbRoutes = await prisma.route.findMany({
      where: {
        chain_from_id: chainFrom.id,
        chain_to_id: chainTo.id,
        bridge_id: { in: bridgeIds },
      },
    });

    const routes: RouteResponseDto[] = [];
    let isApproved = false;
    let amountOut: string = dto.amount;
    for (const route of dbRoutes) {
      const bridge = bridges.find((br) => br.id === route.bridge_id);
      let txDto: BuildBridgeTxResponseDto = {
        data: "",
        to: "",
        from: "",
      };
      const txRouteDto: GetBridgeTxRequestDto = {
        recipient: dto.recipient,
        amount: dto.amount,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        decimals: token.decimals,
      };
      if (
        bridge.name === "polygon-bridge" ||
        bridge.name === "polygon-bridge-goerli"
      ) {
        txDto = await getPolygonRoute(txRouteDto);
      }

      if (bridge.name === "hop-bridge" || bridge.name === "hop-bridge-goerli") {
        txDto = await getHopRoute(txRouteDto, chainTo.chainId);
      }
      const isEth = token.symbol === "ETH";

      if (!isEth) {
        isApproved = await getIsApproved({
          allowanceContractAddr: ETH_CONTRACT,
          amount: dto.amount,
          decimals: token.decimals,
          recipient: dto.recipient,
          tokenAddress: token.address,
        });

        amountOut = await getHopAmountOut(
          ETH_NETWORK,
          token.symbol,
          getHopChain(chainFrom.name),
          getHopChain(chainTo.name),
          parseUnits(dto.amount, token.decimals)
        );
      }

      const txCoast =
        isApproved || (isEth && txDto.data !== "")
          ? await calculateTransactionCost(txDto)
          : "0.0";

      const routeDto = mapRouteToDto(
        route,
        ETH_CONTRACT,
        bridge,
        mapTokenToDto(token, chainFrom.id),
        chainFrom.id,
        chainTo.id,
        dto.amount,
        amountOut,
        txDto,
        parseFloat(txCoast) * ethPrice
      );

      routes.push(routeDto);
      routes.sort((a, b) => a.transactionCoastUsd - b.transactionCoastUsd);
    }
    const quoteResponse: QuoteResponseDto = {
      fromAsset: mapTokenToDto(token, chainFrom.id),
      fromChainId: chainFrom.id,
      toAsset: mapTokenToDto(token, chainTo.id),
      toChainId: chainTo.id,
      routes: routes,
      amount: dto.amount,
      isApproved: isApproved,
    };

    quoteResp.result = quoteResponse;
    response.data = quoteResp;
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError(e.message);
  }
};

export const buildTx = async (
  dto: BuildBridgeTxRequestDto
): Promise<ServiceResponseDto<BuildBridgeTxResponseDto>> => {
  const buildResp: ApiResponseDto<BuildBridgeTxResponseDto> = {
    success: true,
    result: { data: "", to: "", from: "" },
  };

  const response: ServiceResponseDto<BuildBridgeTxResponseDto> = {
    status: 200,
    data: buildResp,
  };

  try {
    if (dto.fromAsset !== dto.toAsset && dto.fromChainId === dto.toChainId) {
      return BadRequest();
    }
    const token = await prisma.token.findFirst({
      where: {
        id: Number.parseInt(dto.fromAsset),
      },
    });

    const chainFrom = await prisma.chain.findFirst({
      where: {
        chainId: Number.parseInt(dto.fromChainId),
      },
    });

    const chainTo = await prisma.chain.findFirst({
      where: {
        chainId: Number.parseInt(dto.toChainId),
      },
    });

    if (!token || !chainFrom || !chainTo) {
      return NotFound();
    }

    const route = await prisma.route.findFirst({
      where: {
        id: Number.parseInt(dto.routeId),
        chain_from_id: chainFrom.id,
        chain_to_id: chainTo.id,
      },
      include: {
        bridge: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!route) {
      return response;
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
      buildResp.result = await getPolygonRoute(txRouteDto);
      response.data = buildResp;
      return response;
    }

    if (
      route.bridge.name === "hop-bridge" ||
      route.bridge.name === "hop-bridge-goerli"
    ) {
      buildResp.result = await getHopRoute(txRouteDto, chainTo.chainId);
      response.data = buildResp;
      return response;
    }
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

const getPolygonRoute = async (
  dto: GetBridgeTxRequestDto
): Promise<BuildBridgeTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [
        dto.recipient,
        dto.tokenAddress,
        parseUnits(dto.amount, dto.decimals).toString(),
      ]
    );
    return {
      data: sendToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
    };
  }

  const sendEthToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
    "sendEthToPolygon",
    [dto.recipient]
  );

  return {
    data: sendEthToPolygonData,
    to: ETH_CONTRACT,
    from: dto.recipient,
    value: ethers.utils.parseEther(dto.amount).toHexString(),
  };
};

const getHopRoute = async (
  dto: GetBridgeTxRequestDto,
  chainToId: number
): Promise<BuildBridgeTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToL2Hop",
      [
        dto.tokenAddress,
        dto.recipient,
        chainToId,
        parseUnits(dto.amount, dto.decimals).toString(),
        0,
        getTimestamp(30),
        HOP_RELAYER,
        HOP_RELAYER_FEE,
      ]
    );

    return {
      data: sendToL2HopData,
      to: ETH_CONTRACT,
      from: dto.recipient,
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
