import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { isTestnet } from "../../common/constants";
import { consoleLogger, hydraLogger } from "../hydraLogger";
import { Chain, Token } from "@prisma/client";
import {
  BuildBridgeTxResponseDto,
  GetBridgeTxRequestDto,
  QuoteRequestDto,
  RouteResponseDto,
} from "../../common/dtos";
import { Asset } from "../../common/enums";
import { fetchEthUsdPrice } from "../../services/coingeckoService";
import { getRoutesByChainBridgeIds } from "../database/routesDbHelper";
import { calculateTransactionCost } from "../web3";
import { getHopAmountOut, getHopChain } from "../hopHelper";
import { mapRouteToDto, mapTokenToDto } from "../mappers/mapperDto";
import { ethers } from "ethers";
import {
  getSendEthToL2HopEncodedFunction,
  getSendEthToPolygonEncodedFunction,
  getSendToL2HopEncodedFunction,
  getSendToPolygonEncodedFunction,
} from "../contractHelper";
import { getAllBridges } from "../database/bridgesDbHelper";

const { ETH_CONTRACT, ETH_NETWORK } = process.env;

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

    let amountOut: string = dto.amount;
    for (const route of dbRoutes) {
      const bridge = bridgesDb.find((br) => br.id === route.bridge_id);
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

      if (
        isApproved ||
        (isEth &&
          !isTestnet &&
          (bridge.name === "hop-bridge" || bridge.name === "hop-bridge-goerli"))
      ) {
        const amountOutRes = await getHopAmountOut(
          ETH_NETWORK,
          token.symbol,
          getHopChain(chainFrom.name),
          getHopChain(chainTo.name),
          parseUnits(dto.amount, token.decimals)
        );
        amountOut = isEth
          ? formatEther(amountOutRes).toString()
          : formatUnits(amountOutRes, token.decimals);
      }

      const txCoast =
        isApproved || (isEth && txDto.data !== "")
          ? await calculateTransactionCost(txDto)
          : "0.0";

      const routeDto = mapRouteToDto(
        route,
        ETH_CONTRACT,
        bridge,
        mapTokenToDto(token, chainFrom.chainId),
        chainFrom.chainId,
        chainTo.chainId,
        dto.amount,
        amountOut,
        txDto,
        parseFloat(txCoast) * ethPrice
      );

      routes.push(routeDto);
      routes.sort((a, b) => a.transactionCoastUsd - b.transactionCoastUsd);
    }
    return routes;
  } catch (e) {
    consoleLogger.error("Error getting quote routes", e);
    hydraLogger.error("Error getting quote routes", e);
  }
};

export const getPolygonRoute = async (
  dto: GetBridgeTxRequestDto
): Promise<BuildBridgeTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    return {
      data: getSendToPolygonEncodedFunction(dto),
      to: ETH_CONTRACT,
      from: dto.recipient,
    };
  }

  return {
    data: getSendEthToPolygonEncodedFunction(dto.recipient),
    to: ETH_CONTRACT,
    from: dto.recipient,
    value: ethers.utils.parseEther(dto.amount).toHexString(),
  };
};

export const getHopRoute = async (
  dto: GetBridgeTxRequestDto,
  chainToId: number
): Promise<BuildBridgeTxResponseDto> => {
  if (dto.tokenSymbol.toLowerCase() !== Asset[Asset.eth]) {
    return {
      data: getSendToL2HopEncodedFunction(dto, chainToId),
      to: ETH_CONTRACT,
      from: dto.recipient,
    };
  }

  if (!isTestnet) {
    return {
      data: getSendEthToL2HopEncodedFunction(dto, chainToId),
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
