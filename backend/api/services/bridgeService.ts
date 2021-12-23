import {
  ApiResponseDto,
  BuildTxRequestDto,
  BuildTxResponseDto,
  QuoteRequestDto,
  QuoteResponseDto,
  RouteDto,
  ServiceResponseDto,
} from "../common/dtos";
import { Asset, BridgeId } from "../common/enums";
import { encodeParameter } from "../helpers/web3";
import { Interface } from "@ethersproject/abi";
import { BigNumber, ethers } from "ethers";
import { hydraBridge } from "./contractInterfaces/contractInterfaces";
import { getTimestamp } from "../helpers/time";
import { parseUnits } from "ethers/lib/utils";
import { isNotEmpty } from "../helpers/stringHelper";
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
    !isNotEmpty(dto.fromAsset) &&
    !isNotEmpty(dto.fromChainId) &&
    !isNotEmpty(dto.toAsset) &&
    !isNotEmpty(dto.toChainId) &&
    !isNotEmpty(dto.amount)
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
      // return NotFound();
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
      const routeDto = mapRouteToDto(
        route,
        ETH_CONTRACT,
        bridge,
        mapTokenToDto(token, chainFrom.id),
        chainFrom.id,
        chainTo.id,
        dto.amount,
        dto.amount
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
    data: null,
  };

  try {
    if (
      !isNotEmpty(dto.fromAsset) &&
      !isNotEmpty(dto.fromChainId) &&
      !isNotEmpty(dto.toAsset) &&
      !isNotEmpty(dto.toChainId) &&
      !isNotEmpty(dto.amount) &&
      !isNotEmpty(dto.recipient)
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
      return NotFound();
    }

    if (
      route.bridge.name === "polygon-bridge" ||
      route.bridge.name === "polygon-bridge-goerli"
    ) {
      buildResp.result = await getPolygonRoute(dto);
      response.data = buildResp;
      return response;
    }

    if (
      route.bridge.name === "hop-bridge" ||
      route.bridge.name === "hop-bridge-goerli"
    ) {
      buildResp.result = await getHopRoute(dto);
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
  dto: BuildTxRequestDto
): Promise<BuildTxResponseDto> => {
  const token = await prisma.token.findFirst({
    where: {
      id: Number.parseInt(dto.fromAsset),
    },
  });
  if (token.symbol.toLowerCase() === Asset[Asset.usdc]) {
    const units = token.symbol.toLowerCase() === Asset[Asset.usdc] ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const depositData = encodeParameter("uint256", bigAmountIn);
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [dto.recipient, token.address, bigAmountIn, depositData]
    );
 
    return {
      data: sendToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient
    };;
  }

  if (token.symbol.toLowerCase() === Asset[Asset.usdc]) {
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
  dto: BuildTxRequestDto
): Promise<BuildTxResponseDto> => {
  const token = await prisma.token.findFirst({
    where: {
      id: Number.parseInt(dto.fromAsset),
    },
  });
  const chain = await prisma.chain.findFirst({
    where: {
      id: Number.parseInt(dto.toChainId),
    },
  });
  if (token.symbol.toLowerCase() === Asset[Asset.usdc]) {
    const units = token.symbol.toLowerCase() === Asset[Asset.usdc] ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToL2Hop",
      [
        token.address,
        dto.recipient,
        chain.chainId,
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
      from: dto.recipient
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
