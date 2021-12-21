import { BridgeId } from "./enums";

export interface BaseListResponseDto<T> {
  success: boolean;
  results: any[];
}


export interface BaseResponseDto<T> {
  success: boolean;
  result: T;
}

export interface CheckAllowanceDto {
  chainId: string;
  owner: string;
  spender: string;
  tokenAddress: string;
}

export interface CheckAllowanceResponseDto {
  value: string;
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
  fromAsset: number;
  fromChainId: number;
  toAsset: number;
  toChainId: number;
  amount: number;
  routeId: number;
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
  amountOut: string;
  allowanceTarget: string;
  isApprovalRequired: boolean;
  routeId: string;
}

export interface BuildTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: any;
  bridgeId?: BridgeId;
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
  currency: TokenResponseDto;
  explorers: string[];
}
