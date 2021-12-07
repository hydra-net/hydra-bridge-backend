import { Asset, ChainId, Route } from "./enums";

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

export interface QuoteRequestDto {
  fromAsset: Asset;
  fromChainId: string;
  toAsset: Asset;
  toChainId: string;
  amount: string;
}

export interface BuildTxRequestDto {
  recipient: string;
  fromAsset: Asset;
  fromChainId: ChainId;
  toAsset: Asset;
  toChainId: ChainId;
  amount: string;
}

export interface PolygonBridgeDto {
  data: string;
  to: string;
  from: string;
  value?: any;
}
