import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { consoleLogger, hydraLogger } from "../hydraLogger";
import { Bridge, Chain, Route, Token } from "@prisma/client";
import {
  BuildBridgeTxResponseDto,
  GetBridgeTxRequestDto,
  QuoteRequestDto,
  RouteResponseDto,
} from "../../common/dtos";
import { Asset } from "../../common/enums";
import { fetchEthUsdPrice } from "../../services/coingeckoService";
import { getRoutesByChainBridgeIds } from "../database/routesDbHelper";
import { getCalculateTransactionCost, getEthWalletBalance } from "../web3";
import { getHopAmountOut, getHopChain } from "../hopHelper";
import {
  mapRouteToDto,
  mapToGetBridgeTxRequestDto,
  mapTokenToDto,
} from "../mappers/mapperDto";
import { ethers } from "ethers";
import {
  getErc20TokenBalance,
  getHydraBridgeContractAddress,
  getIsEnoughBalance,
  getSendEthToL2HopEncodedFunction,
  getSendEthToPolygonEncodedFunction,
  getSendToL2HopEncodedFunction,
  getSendToPolygonEncodedFunction,
} from "../contractHelper";
import { getAllBridges } from "../database/bridgesDbHelper";

export const getQuoteRoutes = async (
  token: Token,
  chainFrom: Chain,
  chainTo: Chain,
  dto: QuoteRequestDto,
  isApproved: boolean,
  isEth: boolean
) => {
  try {
    const bridgesDb = await getAllBridges();

    const bridgeIds = bridgesDb.map((bridge) => bridge.id);

    const ethPrice = await fetchEthUsdPrice();
    const dbRoutes = await getRoutesByChainBridgeIds(
      chainFrom.id,
      chainTo.id,
      bridgeIds
    );
    const routes: RouteResponseDto[] = [];

    for (const route of dbRoutes) {
      const bridge = bridgesDb.find((br) => br.id === route.bridge_id);
      const routeDto = await getRouteDto(
        route,
        dto,
        token,
        bridge,
        chainFrom,
        chainTo,
        isApproved,
        isEth,
        ethPrice
      );

      routes.push(routeDto);
    }
    routes.sort((a, b) => a.transactionCoastUsd - b.transactionCoastUsd);
    return routes;
  } catch (e) {
    consoleLogger.error("Error getting quote routes", e);
    hydraLogger.error("Error getting quote routes", e);
  }
};

export const getRouteDto = async (
  route: Route,
  dto: QuoteRequestDto,
  token: Token,
  bridge: Bridge,
  chainFrom: Chain,
  chainTo: Chain,
  isApproved: boolean,
  isEth: boolean,
  ethPrice: number
) => {
  let txDto: BuildBridgeTxResponseDto = {
    data: "",
    to: "",
    from: "",
  };

  const txRouteDto = mapToGetBridgeTxRequestDto(dto, token);
  if (
    bridge.name === "polygon-bridge" ||
    bridge.name === "polygon-bridge-goerli"
  ) {
    txDto = await getPolygonRoute(txRouteDto, chainFrom.chainId);
  }

  if (bridge.name === "hop-bridge" || bridge.name === "hop-bridge-goerli") {
    txDto = await getHopRoute(
      txRouteDto,
      chainFrom.chainId,
      chainTo.chainId,
      bridge.is_testnet
    );
  }

  const transactonCoast = await getTransactionCoast(
    isEth,
    isApproved,
    dto,
    chainFrom,
    token,
    txDto
  );

  return mapRouteToDto(
    route,
    getHydraBridgeContractAddress(chainFrom.chainId),
    bridge,
    mapTokenToDto(token, chainFrom.chainId, chainFrom.name),
    chainFrom.chainId,
    chainTo.chainId,
    dto.amount,
    await getAmountOut(
      isApproved,
      isEth,
      dto.amount,
      bridge,
      chainFrom,
      chainTo,
      token
    ),
    txDto,
    parseFloat(transactonCoast) * ethPrice
  );
};

export const getTransactionCoast = async (
  isEth: boolean,
  isApproved: boolean,
  dto: QuoteRequestDto,
  chainFrom: Chain,
  token: Token,
  txDto: BuildBridgeTxResponseDto
) => {
  const balance = await getWalletBalance(
    isEth,
    chainFrom,
    token.address,
    dto.recipient
  );

  const isEnoughBalance = getIsEnoughBalance(
    dto.amount.toString(),
    token.decimals,
    balance
  );

  return isEnoughBalance && (isApproved || (isEth && txDto.data !== ""))
    ? await getCalculateTransactionCost(txDto, chainFrom.name)
    : "0.0";
};

export const getWalletBalance = async (
  isEth: boolean,
  chainFrom: Chain,
  tokenAddress: string,
  recipient: string
): Promise<string> => {
  const balance = isEth
    ? await getEthWalletBalance(chainFrom.name, recipient)
    : await getErc20TokenBalance(
        tokenAddress,
        recipient,
        chainFrom.chainId,
        chainFrom.name
      );

  return balance.toString();
};

export const getAmountOut = async (
  isApproved: boolean,
  isEth: boolean,
  amount: string,
  bridge: Bridge,
  chainFrom: Chain,
  chainTo: Chain,
  token: Token
): Promise<string> => {
  try {
    if (
      isApproved ||
      (isEth &&
        !bridge.is_testnet &&
        (bridge.name === "hop-bridge" || bridge.name === "hop-bridge-goerli"))
    ) {
      const amountOutRes = await getHopAmountOut(
        chainFrom.chainId,
        chainFrom.name,
        token.symbol,
        getHopChain(chainFrom.name),
        getHopChain(chainTo.name),
        parseUnits(amount, token.decimals)
      );
      return isEth
        ? formatEther(amountOutRes).toString()
        : formatUnits(amountOutRes, token.decimals);
    }

    return amount;
  } catch (e) {
    consoleLogger.error("Error getting amount out", e);
    hydraLogger.error("Errorgetting amount out", e);
  }
};

export const getPolygonRoute = async (
  dto: GetBridgeTxRequestDto,
  chainId: number
): Promise<BuildBridgeTxResponseDto> => {
  const hydraBridgeAddress = getHydraBridgeContractAddress(chainId);
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    return {
      data: getSendToPolygonEncodedFunction(dto),
      to: hydraBridgeAddress,
      from: dto.recipient,
    };
  }

  return {
    data: getSendEthToPolygonEncodedFunction(dto.recipient),
    to: hydraBridgeAddress,
    from: dto.recipient,
    value: ethers.utils.parseEther(dto.amount).toHexString(),
  };
};

export const getHopRoute = async (
  dto: GetBridgeTxRequestDto,
  chainFromId: number,
  chainToId: number,
  isTestnet: boolean
): Promise<BuildBridgeTxResponseDto> => {
  const hydraBridgeAddress = getHydraBridgeContractAddress(chainFromId);
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    return {
      data: getSendToL2HopEncodedFunction(dto, chainToId),
      to: hydraBridgeAddress,
      from: dto.recipient,
    };
  }

  if (!isTestnet && dto.tokenSymbol.toLowerCase() === Asset[Asset.eth]) {
    return {
      data: getSendEthToL2HopEncodedFunction(dto, chainToId),
      to: hydraBridgeAddress,
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
