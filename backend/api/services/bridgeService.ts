import {
  ApiResponseDto,
  BuildTxRequestDto,
  BuildTxResponseDto,
  GetTxRequestDto,
  QuoteRequestDto,
  QuoteResponseDto,
  RouteDto,
  ServiceResponseDto,
} from "../common/dtos";
import { Asset } from "../common/enums";
import { Interface } from "@ethersproject/abi";
import { BigNumber, ethers } from "ethers";
import { hydraBridge } from "./contractInterfaces/contractInterfaces";
import { getTimestamp } from "../helpers/time";
import { parseUnits } from "ethers/lib/utils";
import { isEmpty } from "../helpers/stringHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../helpers/serviceErrorHelper";
import prisma from "../helpers/db";
import { mapRouteToDto, mapTokenToDto } from "../helpers/mappers/mapperDto";

require("dotenv").config();
const { ETH_CONTRACT, HOP_RELAYER, HOP_RELAYER_FEE } = process.env;
var environment = process.env.NODE_ENV || "dev";

const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);

export const getQuote = async (
  dto: QuoteRequestDto
): Promise<ServiceResponseDto> => {
  let quoteResp: ApiResponseDto = {
    success: true,
    result: null,
  };

  let response: ServiceResponseDto = {
    status: 200,
    data: null,
  };

  if (
    isEmpty(dto.recipient) ||
    isEmpty(dto.fromAsset) ||
    isEmpty(dto.fromChainId) ||
    isEmpty(dto.toAsset) ||
    isEmpty(dto.toChainId) ||
    isEmpty(dto.amount)
  ) {
    return BadRequest();
  }

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

    if (chainFrom.id === chainTo.id) {
      return BadRequest("Pick different chains");
    }

    const bridges = await prisma.bridge.findMany({
      where: {
        is_testnet: environment === "dev" ? true : false,
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

    const routes: RouteDto[] = [];
    for (const route of dbRoutes) {
      const bridge = bridges.find((br) => br.id === route.bridge_id);
      let txDto: BuildTxResponseDto = {
        data: "",
        to: "",
        from: "",
      };
      if (
        bridge.name === "polygon-bridge" ||
        bridge.name === "polygon-bridge-goerli"
      ) {
        txDto = await getPolygonRoute({
          recipient: dto.recipient,
          tokenSymbol: token.symbol,
          tokenAddress: token.address,
          amount: dto.amount,
        });
      }

      if (bridge.name === "hop-bridge" || bridge.name === "hop-bridge-goerli") {
        txDto = await getHopRoute(
          {
            recipient: dto.recipient,
            tokenSymbol: token.symbol,
            tokenAddress: token.address,
            amount: dto.amount,
          },
          chainTo.chainId
        );
      }
      const routeDto = mapRouteToDto(
        route,
        ETH_CONTRACT,
        bridge,
        mapTokenToDto(token, chainFrom.id),
        chainFrom.id,
        chainTo.id,
        dto.amount,
        dto.amount,
        txDto
      );

      routes.push(routeDto);
    }
    const quoteResponse: QuoteResponseDto = {
      fromAsset: mapTokenToDto(token, chainFrom.id),
      fromChainId: chainFrom.id,
      toAsset: mapTokenToDto(token, chainTo.id),
      toChainId: chainTo.id,
      routes: routes,
      amount: dto.amount,
    };

    quoteResp.result = quoteResponse;
    response.data = quoteResp;
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

export const buildTx = async (
  dto: BuildTxRequestDto
): Promise<ServiceResponseDto> => {
  let buildResp: ApiResponseDto = {
    success: true,
    result: { data: "", to: "", from: "" },
  };

  let response: ServiceResponseDto = {
    status: 200,
    data: buildResp,
  };

  try {
    if (
      isEmpty(dto.fromAsset) ||
      isEmpty(dto.fromChainId) ||
      isEmpty(dto.toAsset) ||
      isEmpty(dto.toChainId) ||
      isEmpty(dto.amount) ||
      isEmpty(dto.recipient)
    ) {
      return BadRequest();
    }
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

    if (
      route.bridge.name === "polygon-bridge" ||
      route.bridge.name === "polygon-bridge-goerli"
    ) {
      buildResp.result = await getPolygonRoute({
        recipient: dto.recipient,
        amount: dto.amount,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
      });
      response.data = buildResp;
      return response;
    }

    if (
      route.bridge.name === "hop-bridge" ||
      route.bridge.name === "hop-bridge-goerli"
    ) {
      buildResp.result = await getHopRoute(
        {
          recipient: dto.recipient,
          amount: dto.amount,
          tokenAddress: token.address,
          tokenSymbol: token.symbol,
        },
        chainTo.chainId
      );
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
  dto: GetTxRequestDto
): Promise<BuildTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() === Asset[Asset.usdc]) {
    const units = dto.tokenSymbol.toLowerCase() === Asset[Asset.usdc] ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [dto.recipient, dto.tokenAddress, bigAmountIn]
    );
    const resp = {
      data: sendToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
    };

    return resp;
  }

  if (dto.tokenSymbol.toLowerCase() === Asset[Asset.eth]) {
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
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};

const getHopRoute = async (
  dto: GetTxRequestDto,
  chainToId
): Promise<BuildTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() === Asset[Asset.usdc]) {
    const units = dto.tokenSymbol.toLowerCase() === Asset[Asset.usdc] ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToL2Hop",
      [
        dto.tokenAddress,
        dto.recipient,
        chainToId,
        bigAmountIn,
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
