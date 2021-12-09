import { BuildTxRequestDto, BuildTxResponseDto } from "../common/dtos";
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

export const buildTx = async (
  dto: BuildTxRequestDto
): Promise<BuildTxResponseDto> => {
  try {
    if (dto.routeId.toString() === RouteId.Polygon.toString()) {
      return getPolygonRoute(dto);
    }

    if (dto.routeId.toString() === RouteId.Hop.toString()) {
      return getHopRoute(dto);
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
    dto.fromAsset.toString() === Asset.Usdc.toString() &&
    dto.toAsset.toString() === Asset.Usdc.toString() &&
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
      bridgeId: BridgeId.Polygon,
    };
  }

  if (
    dto.fromAsset.toString() === Asset.Eth.toString() &&
    dto.toAsset.toString() === Asset.Eth.toString()
  ) {
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
      bridgeId: BridgeId.Polygon,
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
    dto.fromAsset.toString() === Asset.Usdc.toString() &&
    dto.toAsset.toString() === Asset.Usdc.toString() &&
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
      bridgeId: BridgeId.Hop,
    };
  }

  if (
    dto.fromAsset.toString() === Asset.Eth.toString() &&
    dto.toAsset.toString() === Asset.Eth.toString()
  ) {
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendEthToL2Hop",
      [dto.recipient, dto.toChainId, 0, Date.now() + 30, HOP_RELAYER, 0]
    );
    return {
      data: sendToL2HopData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      value: ethers.utils
        .parseEther(ethers.utils.formatEther(dto.amount))
        .toHexString(),
      bridgeId: BridgeId.Hop,
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
