import { Asset, BridgeId, ChainId, Route, RouteId } from "./enums";

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
  fromAsset: Asset;
  fromChainId: ChainId;
  toAsset: Asset;
  toChainId: ChainId;
  amount: string;
  routeId: RouteId
}

export interface QuoteRequestDto {
  recipient: string;
  fromAsset: Asset;
  fromChainId: ChainId;
  toAsset: Asset;
  toChainId: ChainId;
  amount: string;
}

export interface BuildTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: any;
  bridgeId?: BridgeId
}
