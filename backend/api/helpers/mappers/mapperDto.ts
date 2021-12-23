import { RouteDto, TokenResponseDto } from "../../common/dtos";
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
  transactionCoast: number
): RouteDto => {
  return {
    id: route.id,
    allowanceTarget: allowanceTarget,
    isApprovalRequired: token.symbol !== Asset.eth.toString(),
    bridgeRoute: {
      bridgeName: bridge.name,
      bridgeId: bridge.id,
      bridgeInfo: {
        displayName: bridge.display_name,
        serviceTime: 0,
        isTestnet: bridge.is_testnet
      },
      fromAsset: token,
      fromChainId: chainFromId,
      toAsset: token,
      toChainId: chainToId,
      amountIn: amountIn,
      amountOut: amountOut, //TODO: add function to calculate amountOut
    },
    fees: {
      transactionCoastUsd : transactionCoast
    },
  };
};
