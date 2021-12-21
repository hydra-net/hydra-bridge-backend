import { Asset, BridgeId, ChainId, RouteId } from "./enums";

export interface BaseListResponseDto<T> {
  success: boolean;
  results: T[];
}

export interface BaseResponseDto<T> {
  success: boolean;
  results: T[];
}

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
  routeId: string;
}

export interface QuoteRequestDto {
  fromAsset: string;
  fromChainId: string;
  toAsset: string;
  toChainId: string;
  amount: string;
}

export interface QuoteResponseDto {
  fromAsset: Asset;
  fromChainId: ChainId;
  toAsset: Asset;
  toChainId: ChainId;
  amountIn: string;
  amountOut: string;
  allowanceTarget: string;
  isApprovalRequired: boolean;
  routeId: RouteId;
}

export interface BuildTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: any;
  bridgeId?: number;
}

export interface TokenResponseDto {
  name: string;
  address: string;
  chainId: number;
  decimals: number;
  symbol: string;
}

export interface ChainResponseDto {
  chainId: number;
  name: string;
  isL1: boolean;
  isTestnet: boolean;
  isSendingEnabled: boolean;
  isReceivingEnabled: boolean;
  currency : TokenResponseDto
  explorers: string[]
}


