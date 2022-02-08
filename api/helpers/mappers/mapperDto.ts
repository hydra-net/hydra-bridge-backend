import {
  BuildBridgeTxResponseDto,
  ChainResponseDto,
  RouteResponseDto,
  TokenBalanceResponseDto,
  TokenResponseDto,
} from "../../common/dtos";
import { Token, Bridge, Route, Chain } from "@prisma/client";

export const mapTokenToDto = (
  token: Token,
  chainId: number
): TokenResponseDto => {
  return {
    id: token.id,
    name: token.name,
    chainId: chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
  };
};

export const mapRouteToDto = (
  route: Route,
  allowanceTarget: string,
  bridge: Bridge,
  token: TokenResponseDto,
  chainFromId: number,
  chainToId: number,
  amountIn: string,
  amountOut: string,
  buildTx: BuildBridgeTxResponseDto,
  transactionCoastUsd: number
): RouteResponseDto => {
  return {
    id: route.id,
    allowanceTarget: allowanceTarget,
    bridgeRoute: {
      bridgeName: bridge.name,
      bridgeId: bridge.id,
      bridgeInfo: {
        displayName: bridge.display_name,
        serviceTime: bridge.processing_time_seconds,
        isTestnet: bridge.is_testnet,
      },
      fromAsset: token,
      fromChainId: chainFromId,
      toAsset: token,
      toChainId: chainToId,
      amountIn: amountIn,
      amountOut: amountOut, //TODO: add function to calculate amountOut
    },
    buildTx: buildTx,
    transactionCoastUsd: transactionCoastUsd,
  };
};

export const mapTokenBalanceToDto = (
  token: TokenResponseDto,
  price: number,
  amount: string
): TokenBalanceResponseDto => {
  return {
    tokenId: token.id,
    chainId: token.chainId,
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    price: price,
    amount: amount,
    currency: "USD",
  };
};

export const mapToChainResponseDto = (
  chain: Chain,
  token: Token
): ChainResponseDto => {
  return {
    chainId: chain.chainId,
    name: chain.name,
    isLayer1: chain.is_layer1,
    isTestnet: chain.is_testnet,
    isReceivingEnabled: chain.is_receiving_enabled,
    isSendingEnabled: chain.is_sending_enabled,
    currency: {
      id: token.id,
      name: token.name,
      chainId: chain.chainId,
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol,
    },
    explorers: chain.explorers,
  };
};
