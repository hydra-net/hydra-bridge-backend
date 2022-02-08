import { BigNumber, ethers } from "ethers";
import Web3 from "web3";
import { BuildBridgeTxResponseDto } from "../common/dtos";
import "dotenv/config";
import { consoleLogger, hydraLogger } from "./hydraLogger";

const { ETH_INFURA_ID, ETH_NETWORK, ETH_CHAIN_ID } = process.env;

export const getProviderUrl = () => {
  let provider = `https://${ETH_NETWORK}.infura.io/v3/${ETH_INFURA_ID}`;

  if (ETH_CHAIN_ID === "1337") {
    provider = "http://localhost:8545";
  }
  return provider;
};

export const web3Initialised = new Web3(getProviderUrl());

export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(getProviderUrl(), {
    chainId: Number(ETH_CHAIN_ID),
    name: ETH_NETWORK,
  });
};

export const getSigner = () => {
  return getProvider().getSigner();
};

export const encodeParameter = (
  paramType: string = "uint256",
  amount: string | number | undefined
) => {
  return amount
    ? web3Initialised.eth.abi.encodeParameter(paramType, amount)
    : undefined;
};

export const decodeParameter = (type: string = "uint256", data: string) => {
  return data ? web3Initialised.eth.abi.decodeParameter(type, data) : undefined;
};

export const calculateTransactionCost = async (
  params: BuildBridgeTxResponseDto
): Promise<string> => {
  try {
    const gasPrice = await web3Initialised.eth.getGasPrice();
    const gasLimit = await web3Initialised.eth.estimateGas(params);
    const transactionFee = BigNumber.from(gasPrice).mul(
      BigNumber.from(gasLimit)
    );
    return ethers.utils.formatEther(transactionFee.toString());
  } catch (e) {
    consoleLogger.error("calculateTransactionCost error", e);
    hydraLogger.error("calculateTransactionCost error", e);
    return "0.0";
  }
};
