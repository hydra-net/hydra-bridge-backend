export interface ServiceResponseDto {
  status: number;
  message?: any;
  data?: any;
}

export interface ApiResponseDto {
  success: boolean;
  result: any;
}

export interface AllowanceRequestDto {
  chainId: string;
  owner: string;
  spender: string;
  tokenAddress: string;
}

export interface AllowanceResponseDto {
  value: number;
  tokenAddress: string;
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

export interface GetTxRequestDto {
  recipient: string
  tokenSymbol: string
  tokenAddress: string
  amount: string;
}

export interface QuoteRequestDto {
  recipient: string;
  fromAsset: string;
  fromChainId: string;
  toAsset: string;
  toChainId: string;
  amount: string;
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
  transactionCoastUsd: number
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
  bridgeId?: number;
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
  currency : TokenResponseDto
  explorers: string[]
}


