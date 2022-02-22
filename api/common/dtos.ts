import { BigNumber } from "ethers";
import { Query } from "express-serve-static-core";

export interface ServiceResponseDto<T> {
  status: number;
  message?: string;
  data?: T;
}

export interface AllowanceRequestDto extends Query {
  chainId: string;
  owner: string;
  tokenAddress: string;
}

export interface AllowanceResponseDto {
  value: string;
  tokenAddress: string;
}

export interface BuildAllowanceRequestDto extends Query {
  chainId: string;
  owner: string;
  tokenAddress: string;
  amount: string;
}

export interface BuildAllowanceResponseDto {
  data: string;
  to: string;
  from: string;
}

export interface BuildBridgeTxRequestDto extends Query {
  recipient: string;
  fromAsset: string;
  fromChainId: string;
  toAsset: string;
  toChainId: string;
  amount: string;
  routeId: string;
}

export interface GetBridgeTxRequestDto {
  recipient: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  decimals?: number;
}

export interface QuoteRequestDto extends Query {
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
  routes: RouteResponseDto[];
  amount: string;
  isApproved: boolean;
}

export interface TokenResponseDto {
  id: number;
  name: string;
  address: string;
  chainId: number;
  chainName: string;
  decimals: number;
  symbol: string;
}

export interface RouteResponseDto {
  id: number;
  allowanceTarget: string;
  bridgeRoute: BridgeRouteResponseDto;
  buildTx: BuildBridgeTxResponseDto;
  transactionCoastUsd: number;
}

export interface BridgeRouteResponseDto {
  bridgeName: string;
  bridgeId: number;
  bridgeInfo: BridgeInfoResponseDto;
  fromAsset: TokenResponseDto;
  fromChainId: number;
  toAsset: TokenResponseDto;
  toChainId: number;
  amountIn: string;
  amountOut: string;
}

export interface BridgeInfoResponseDto {
  serviceTime: number;
  displayName: string;
  isTestnet: boolean;
}

export interface BuildBridgeTxResponseDto {
  data: string;
  to: string;
  from: string;
  value?: string;
}

export interface ChainResponseDto {
  chainId: number;
  name: string;
  isLayer1: boolean;
  isTestnet: boolean;
  isSendingEnabled: boolean;
  isReceivingEnabled: boolean;
  currency: TokenResponseDto;
  explorers: string[];
}

export interface TokenBalanceRequest extends Query {
  address: string;
  chainId: string;
}

export interface TokenBalanceResponseDto {
  tokenId: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  amount: string;
  currency: string;
}

export interface TokenPriceResponseDto {
  symbol: string;
  price: number;
}

export interface IsApprovedDto {
  tokenAddress: string;
  amount: string;
  recipient: string;
  decimals: number;
}

export interface BridgeTokenRequestDto extends Query {
  chainId: string;
}

export interface AllowanceAmountsDto {
  amountToSpend: BigNumber;
  amountAllowed: BigNumber;
}
