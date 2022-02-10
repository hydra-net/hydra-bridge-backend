import { Interface } from "@ethersproject/abi";
import { BigNumber, Contract, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { erc20Abi } from "../common/abis/erc20Abi";
import {
  HOP_RELAYER,
  HOP_RELAYER_FEE,
  HYDRA_BRIDGE_INTERFACE,
} from "../common/constants";
import {
  AllowanceAmountsDto,
  GetBridgeTxRequestDto,
  IsApprovedDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "./hydraLogger";
import { getTimestamp } from "./time";
import { getProvider } from "./web3";

const { ETH_CONTRACT, ETH_CONTRACT_GOERLI } = process.env;

const ERC20_INTERFACE = new Interface(erc20Abi);

export const getHydraBridgeContractAddress = (chainId: number): string =>
  chainId === ethers.constants.One.toNumber()
    ? ETH_CONTRACT
    : ETH_CONTRACT_GOERLI;

export const getIsEnoughBalance = (
  amount: string,
  decimals: number,
  balance: string
): boolean => {
  try {
    const parsedAmountToSpend = parseUnits(amount, decimals);
    const amountInBig = ethers.BigNumber.from(parsedAmountToSpend);
    const balanceBig = ethers.BigNumber.from(balance);

    return balanceBig.gte(amountInBig);
  } catch (e) {
    consoleLogger.error("Error getting is enough balance", e);
    hydraLogger.error("Error getting is enough balance", e);
  }
};

export const getEncodedApproveFunction = (
  amount: BigNumber,
  chainId: number
): string => {
  try {
    const contractAddress = getHydraBridgeContractAddress(chainId);
    return ERC20_INTERFACE.encodeFunctionData("approve", [
      contractAddress,
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
  decimals: number,
  chainId: number,
  chainName: string
): Promise<AllowanceAmountsDto> => {
  try {
    const allowanceRes = await getErc20AllowanceAmount(
      tokenAddress,
      owner,
      chainId,
      chainName
    );

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
  owner: string,
  chainId: number,
  chainName: string
): Promise<BigNumber> => {
  try {
    const rootToken = getContract(tokenAddress, chainId, chainName);
    const hydraBridgeAddress = getHydraBridgeContractAddress(chainId);
    return await rootToken.functions.allowance(owner, hydraBridgeAddress);
  } catch (e) {
    consoleLogger.error("Error getting allowance", e);
    hydraLogger.error("Error getting allowance", e);
  }
};

export const getIsApproved = async (
  dto: IsApprovedDto,
  chainId: number,
  chainName: string
) => {
  try {
    const { recipient, tokenAddress, amount, decimals } = dto;
    const amountAllowedResult = await getErc20AllowanceAmount(
      tokenAddress,
      recipient,
      chainId,
      chainName
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
  owner: string,
  chainId: number,
  chainName: string
): Promise<BigNumber> => {
  try {
    const tokenContract = getContract(tokenAddress, chainId, chainName);
    return await tokenContract.functions.balanceOf(owner);
  } catch (e) {
    consoleLogger.error("Error getting is erc20 token balance", e);
    hydraLogger.error("Error getting is erc20 token balance", e);
  }
};

export const getContract = (
  address: string,
  chainId: number,
  chainName: string
): Contract => {
  return new ethers.Contract(
    address,
    erc20Abi,
    getProvider(chainId, chainName)
  );
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
