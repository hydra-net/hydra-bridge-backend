import {
  BuildTxResponseDto,
  RouteDto,
  TokenBalanceDto,
  TokenResponseDto,
} from "../../common/dtos";
import { Asset } from "../../common/enums";

export const mapTokenToDto = (
  token: any,
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
  route: any,
  allowanceTarget: string,
  bridge: any,
  token: TokenResponseDto,
  chainFromId: number,
  chainToId: number,
  amountIn: string,
  amountOut: string,
  buildTx: BuildTxResponseDto,
  transactionCoastUsd: number
): RouteDto => {
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
    fees: {
      transactionCoastUsd: transactionCoastUsd
    }
  };
};

export const mapTokenBalanceToDto = (
  token: TokenResponseDto,
  price: number,
  amount: string
): TokenBalanceDto => {
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
