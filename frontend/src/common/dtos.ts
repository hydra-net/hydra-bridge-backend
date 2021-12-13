import { Asset, BridgeId, ChainId, RouteId } from "./enums";

export interface CheckAllowanceDto {
  chainId: string;
  owner: string;
  spender: string;
  tokenAddress: string;
}

export interface BuildAllowanceRequestDto {
  chainId: string;
  owner: string;
  spender: string;
  tokenAddress: string;
  amount: string;
}

export interface BuildAllowanceResponseDto {
  data: string;
  to: string;
  from: string;
}

export interface BuildTxRequestDto {
  recipient: string;
  fromAsset: string;
  fromChainId: string;
  toAsset: string;
  toChainId: string;
  amount: string;
  routeId: string
}

export interface QuoteRequestDto {
  fromAsset: number;
  fromChainId: number;
  toAsset: number;
  toChainId: number;
  amount: number;
}

export interface QuoteResponseDto {
  fromAsset: string;
  fromChainId: string;
  toAsset: string;
  toChainId: string;
  amountIn: string;
  amountOut: string
  allowanceTarget: string;
  isApprovalRequired: boolean;
  routeId: string
}

export interface BuildTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: any;
  bridgeId?: BridgeId
}
