import { BridgeId } from "./enums";

export interface BaseListResponseDto<T> {
  success: boolean;
  result: T[];
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
  fromAsset: TokenResponseDto;
  fromChainId: number;
  toAsset: TokenResponseDto;
  toChainId: number;
  routes: RouteDto[]
  amount: string;
}

export interface RouteDto {
  id: number;
  allowanceTarget: string;
  isApprovalRequired: boolean;
  bridgeRoute: BridgeRouteDto
  fees: RouteFeeDto;
}

export interface BridgeRouteDto {
  bridgeName: string
  bridgeId: number
  bridgeInfo: BridgeInfoDto
  fromAsset: TokenResponseDto
  fromChainId: number
  toAsset: TokenResponseDto
  toChainId: number
  amountIn: string;
  amountOut: string;
}

export interface BridgeInfoDto {
  serviceTime: number;
  displayName: string
  isTestnet: boolean
}

export interface RouteFeeDto {
  gasLimit: GasLimitDto[]
}

export interface GasLimitDto {
 amount: string
 assetAddress: string
 chainId: number
}

export interface BuildTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: any;
  bridgeId?: BridgeId;
}

export interface TokenResponseDto {
  id: number;
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
