import {
  BaseListResponseDto,
  BaseResponseDto,
  BuildTxRequestDto,
  BuildTxResponseDto,
  QuoteRequestDto,
  QuoteResponseDto,
} from "../common/dtos";
import { Asset, BridgeId, ChainId, RouteId } from "../common/enums";
import { encodeParameter } from "../helpers/web3";
import { Interface } from "@ethersproject/abi";
import { getContractFromAsset } from "../helpers/assetHelper";
import { BigNumber, ethers } from "ethers";
import { hydraBridge } from "./contractInterfaces/contractInterfaces";
import { getTimestamp } from "../helpers/time";
import { getChainFromId } from "../helpers/chainHelper";
import { parseUnits } from "ethers/lib/utils";
import { isNotEmpty } from "../helpers/stringHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";

require("dotenv").config();
const { ETH_CONTRACT, HOP_RELAYER, HOP_RELAYER_FEE } = process.env;

const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);

export const getQuote = async (
  dto: QuoteRequestDto
): Promise<BaseListResponseDto<QuoteResponseDto>> => {
  let response: BaseListResponseDto<QuoteResponseDto> = {
    success: true,
    results: [],
  };

  const quotes: QuoteResponseDto[] = [];
  if (
    isNotEmpty(dto.fromAsset) &&
    isNotEmpty(dto.fromChainId) &&
    isNotEmpty(dto.toAsset) &&
    isNotEmpty(dto.toChainId) &&
    isNotEmpty(dto.amount)
  ) {
    if (
      Asset[dto.fromAsset] === Asset[dto.toAsset] &&
      ChainId[dto.fromChainId] !== ChainId[dto.toChainId]
    ) {
      try {
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
        quotes.push(polygonRoute);

        if (dto.fromAsset.toString() !== Asset.eth.toString()) {
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
          quotes.push(hopRoute);
        }

        response.results = quotes;
      } catch (e) {
        consoleLogger.error(e);
        hydraLogger.error(e);
        return e;
      }
    }
  }
  return response;
};

export const buildTx = async (
  dto: BuildTxRequestDto
): Promise<BaseResponseDto<BuildTxResponseDto>> => {
  let response: BaseResponseDto<BuildTxResponseDto> = {
    success: true,
    result: { data: "", to: "", from: "" },
  };
  try {
    if (
      isNotEmpty(dto.fromAsset) &&
      isNotEmpty(dto.fromChainId) &&
      isNotEmpty(dto.toAsset) &&
      isNotEmpty(dto.toChainId) &&
      isNotEmpty(dto.amount) &&
      isNotEmpty(dto.recipient)
    ) {
      if (dto.fromAsset === dto.toAsset && dto.fromChainId !== dto.toChainId) {
        if (dto.routeId === RouteId.polygon.toString()) {
          response.result = getPolygonRoute(dto);
        }

        if (dto.routeId === RouteId.hop.toString()) {
          response.result = getHopRoute(dto);
        }
      }
    }

    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return e;
  }
};

const getPolygonRoute = (dto: BuildTxRequestDto): BuildTxResponseDto => {
  if (
    dto.fromAsset === Asset.usdc.toString() &&
    dto.toAsset === Asset.usdc.toString()
  ) {
    const units = dto.fromAsset === Asset.usdc.toString() ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const depositData = encodeParameter("uint256", bigAmountIn);
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [
        dto.recipient,
        getContractFromAsset(dto.fromAsset),
        bigAmountIn,
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

  if (
    dto.fromAsset === Asset.eth.toString() &&
    dto.toAsset === Asset.eth.toString()
  ) {
    const sendEthToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendEthToPolygon",
      [dto.recipient]
    );

    return {
      data: sendEthToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      value: ethers.utils.parseEther(dto.amount).toHexString(),
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
  if (
    dto.fromAsset === Asset.usdc.toString() &&
    dto.toAsset === Asset.usdc.toString()
  ) {
    const units = dto.fromAsset === Asset.usdc.toString() ? 6 : 18;
    const parsedAmount = parseUnits(dto.amount, units);
    const bigAmountIn = BigNumber.from(parsedAmount).toString();
    const sendToL2HopData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToL2Hop",
      [
        getContractFromAsset(dto.fromAsset),
        dto.recipient,
        getChainFromId(dto.toChainId),
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
      bridgeId: BridgeId.hop,
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
