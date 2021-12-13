import {
  BuildTxRequestDto,
  BuildTxResponseDto,
  QuoteRequestDto,
  QuoteResponseDto,
} from "../common/dtos";
import { Asset, BridgeId, ChainId, RouteId } from "../common/enums";
import { encodeParameter } from "../helpers/web3";
import { Interface } from "@ethersproject/abi";
import { getContractFromAsset } from "../helpers/assetHelper";
import { ethers } from "ethers";
import { hydraBridge } from "./contractInterfaces/contractInterfaces";
import { getTimestamp } from "../helpers/time";
import { getChainFromId } from "../helpers/chainHelper";

require("dotenv").config();
const { ETH_CONTRACT, HOP_RELAYER, HOP_RELAYER_FEE } = process.env;

const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);

export const getQuote = async (
  dto: QuoteRequestDto
): Promise<QuoteResponseDto[]> => {
  if (
    dto.fromAsset &&
    dto.fromChainId &&
    dto.toAsset &&
    dto.toChainId &&
    dto.amount
  ) {
    if (
      Asset[dto.fromAsset] === Asset[dto.toAsset] &&
      ChainId[dto.fromChainId] !== ChainId[dto.toChainId]
    ) {
      const isApprovalRequired =
        Asset[dto.fromAsset.toString()] !== Asset.eth ? true : false;
      const polygonRoute: QuoteResponseDto = {
        routeId: RouteId.polygon,
        amountIn: dto.amount,
        amountOut: dto.amount,
        isApprovalRequired: isApprovalRequired,
        allowanceTarget: getContractFromAsset(dto.fromAsset),
        fromAsset: Asset[dto.fromAsset],
        toAsset: Asset[dto.toAsset],
        fromChainId: ChainId[dto.fromChainId],
        toChainId: ChainId[dto.toChainId],
      };
      const hopRoute: QuoteResponseDto = {
        routeId: RouteId.hop,
        amountIn: dto.amount,
        amountOut: dto.amount,
        isApprovalRequired: isApprovalRequired,
        allowanceTarget: getContractFromAsset(dto.fromAsset),
        fromAsset: Asset[dto.fromAsset],
        toAsset: Asset[dto.toAsset],
        fromChainId: ChainId[dto.fromChainId],
        toChainId: ChainId[dto.toChainId],
      };
      return [polygonRoute, hopRoute];
    }
  }
  return [];
};

export const buildTx = async (
  dto: BuildTxRequestDto
): Promise<BuildTxResponseDto> => {
  try {
    if (
      dto.fromAsset &&
      dto.fromChainId &&
      dto.toAsset &&
      dto.toChainId &&
      dto.amount
    ) {
      if (
        Asset[dto.fromAsset] === Asset[dto.toAsset] &&
        ChainId[dto.fromChainId] !== ChainId[dto.toChainId]
      ) {
        if (RouteId[dto.routeId] === RouteId.polygon) {
          return getPolygonRoute(dto);
        }

        if (RouteId[dto.routeId] === RouteId.hop) {
          return getHopRoute(dto);
        }
      }
    }

    return {
      data: "",
      to: "",
      from: "",
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

const getPolygonRoute = (dto: BuildTxRequestDto): BuildTxResponseDto => {
  const depositData = encodeParameter("uint256", dto.amount);

  if (
    Asset[dto.fromAsset] === Asset.usdc &&
    Asset[dto.toAsset] === Asset.usdc &&
    depositData
  ) {
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [
        dto.recipient,
        getContractFromAsset(dto.fromAsset),
        dto.amount,
        depositData,
      ]
    );

    return {
      data: sendToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      bridgeId: BridgeId.polygon,
    };
  }

  if (Asset[dto.fromAsset] === Asset.eth && Asset[dto.toAsset] === Asset.eth) {
    const sendEthToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendEthToPolygon",
      [dto.recipient]
    );
    return {
      data: sendEthToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      value: ethers.utils
        .parseEther(ethers.utils.formatEther(dto.amount))
        .toHexString(),
      bridgeId: BridgeId.polygon,
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};

const getHopRoute = (dto: BuildTxRequestDto): BuildTxResponseDto => {
  const depositData = encodeParameter("uint256", dto.amount);

  if (
    Asset[dto.fromAsset] === Asset.usdc &&
    Asset[dto.toAsset] === Asset.usdc &&
    depositData
  ) {
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToL2Hop",
      [
        getContractFromAsset(dto.fromAsset),
        dto.recipient,
        getChainFromId(dto.toChainId),
        dto.amount,
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
      bridgeId: BridgeId.hop,
    };
  }

  if (Asset[dto.fromAsset] === Asset.eth && Asset[dto.toAsset] === Asset.eth) {
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendEthToL2Hop",
      [
        dto.recipient,
        getChainFromId(dto.toChainId),
        0,
        Date.now() + 30,
        HOP_RELAYER,
        0,
      ]
    );

    return {
      data: sendToL2HopData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      value: ethers.utils
        .parseEther(ethers.utils.formatEther(dto.amount))
        .toHexString(),
      bridgeId: BridgeId.hop,
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
