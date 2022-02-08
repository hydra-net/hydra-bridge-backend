import { Interface } from "@ethersproject/abi";
import { BigNumber, Contract, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { erc20Abi } from "../common/abis/erc20Abi";
import { HYDRA_BRIDGE_INTERFACE } from "../common/constants";
import {
  AllowanceAmountsDto,
  GetBridgeTxRequestDto,
  IsApprovedDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "./hydraLogger";
import { getTimestamp } from "./time";
import { getProvider } from "./web3";

const { ETH_CONTRACT, HOP_RELAYER, HOP_RELAYER_FEE } = process.env;

const ERC20_INTERFACE = new Interface(erc20Abi);

export const getEncodedApproveFunction = (amount: BigNumber): string => {
  try {
    return ERC20_INTERFACE.encodeFunctionData("approve", [
      ETH_CONTRACT,
      ethers.utils.hexlify(amount),
    ]);
  } catch (e) {
    consoleLogger.error("Error encoding approve function erc20 contract", e);
    hydraLogger.error("Error encoding approve function erc20 contract", e);
  }
};

export const getAlowanceAmounts = async (
  tokenAddress: string,
  owner: string,
  amount: string,
  decimals: number
): Promise<AllowanceAmountsDto> => {
  try {
    const allowanceRes = await getErc20AllowanceAmount(tokenAddress, owner);

    return {
      amountToSpend: ethers.BigNumber.from(
        parseUnits(amount, decimals).toString()
      ),
      amountAllowed: ethers.BigNumber.from(allowanceRes.toString()),
    };
  } catch (e) {
    consoleLogger.error("Error getting allowance amounts", e);
    hydraLogger.error("Error getting allowance amounts", e);
  }
};

export const getErc20AllowanceAmount = async (
  tokenAddress: string,
  owner: string
): Promise<BigNumber> => {
  try {
    const rootToken = getContract(tokenAddress);
    return await rootToken.functions.allowance(owner, ETH_CONTRACT);
  } catch (e) {
    consoleLogger.error("Error getting allowance", e);
    hydraLogger.error("Error getting allowance", e);
  }
};

export const getIsApproved = async (dto: IsApprovedDto) => {
  try {
    const { recipient, tokenAddress, amount, decimals } = dto;
    const amountAllowedResult = await getErc20AllowanceAmount(
      tokenAddress,
      recipient
    );

    const amountToSpend = parseUnits(amount, decimals);
    const amountAllowed = ethers.BigNumber.from(amountAllowedResult.toString());
    return amountAllowed.gte(amountToSpend);
  } catch (e) {
    consoleLogger.error("Error getting is approved to transfer erc20", e);
    hydraLogger.error("Error getting is approved to transfer erc20", e);
  }
};

export const getErc20TokenBalance = async (
  tokenAddress: string,
  owner: string
): Promise<BigNumber> => {
  try {
    const tokenContract = getContract(tokenAddress);
    return await tokenContract.functions.balanceOf(owner);
  } catch (e) {
    consoleLogger.error("Error getting is approved to transfer erc20", e);
    hydraLogger.error("Error getting is approved to transfer erc20", e);
  }
};

export const getContract = (address: string): Contract => {
  return new ethers.Contract(address, erc20Abi, getProvider());
};

export const getSendToPolygonEncodedFunction = (
  dto: GetBridgeTxRequestDto
): string => {
  try {
    const { recipient, tokenAddress, amount, decimals } = dto;
    return HYDRA_BRIDGE_INTERFACE.encodeFunctionData("sendToPolygon", [
      recipient,
      tokenAddress,
      parseUnits(amount, decimals).toString(),
    ]);
  } catch (e) {
    consoleLogger.error(
      "Error getting encoded sendToPolygon hydraBridge contract function",
      e
    );
    hydraLogger.error(
      "Error getting encoded sendToPolygon hydraBridge contract function",
      e
    );
  }
};

export const getSendEthToPolygonEncodedFunction = (
  recipient: string
): string => {
  try {
    return HYDRA_BRIDGE_INTERFACE.encodeFunctionData("sendEthToPolygon", [
      recipient,
    ]);
  } catch (e) {
    consoleLogger.error(
      "Error getting encoded sendEthToPolygon hydraBridge contract function",
      e
    );
    hydraLogger.error(
      "Error getting encoded sendEthToPolygon hydraBridge contract function",
      e
    );
  }
};

export const getSendToL2HopEncodedFunction = (
  dto: GetBridgeTxRequestDto,
  chainToId: number
): string => {
  try {
    return HYDRA_BRIDGE_INTERFACE.encodeFunctionData("sendToL2Hop", [
      dto.tokenAddress,
      dto.recipient,
      chainToId,
      parseUnits(dto.amount, dto.decimals).toString(),
      0,
      getTimestamp(30),
      HOP_RELAYER,
      HOP_RELAYER_FEE,
    ]);
  } catch (e) {
    consoleLogger.error(
      "Error getting encoded sendToL2Hop hydraBridge contract function",
      e
    );
    hydraLogger.error(
      "Error getting encoded sendToL2Hop hydraBridge contract function",
      e
    );
  }
};

export const getSendEthToL2HopEncodedFunction = (
  dto: GetBridgeTxRequestDto,
  chainToId: number
): string => {
  try {
    return HYDRA_BRIDGE_INTERFACE.encodeFunctionData("sendEthToL2Hop", [
      dto.recipient,
      chainToId,
      0,
      getTimestamp(30),
      HOP_RELAYER,
      HOP_RELAYER_FEE,
    ]);
  } catch (e) {
    consoleLogger.error(
      "Error getting encoded sendEthToL2Hop hydraBridge contract function",
      e
    );
    hydraLogger.error(
      "Error getting encoded sendEthToL2Hop hydraBridge contract function",
      e
    );
  }
};
