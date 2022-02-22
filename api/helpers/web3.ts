import { BigNumber, ethers } from "ethers";
import Web3 from "web3";
import { BuildBridgeTxResponseDto } from "../common/dtos";
import "dotenv/config";
import { consoleLogger, hydraLogger } from "./hydraLogger";
import { ETHEREUM_NAME, ETHEREUM_NETWORK_NAME } from "../common/constants";

const { ETH_INFURA_ID } = process.env;

export const getProviderUrl = (networkName: string) => {
  return `https://${getNetworkName(networkName)}.infura.io/v3/${ETH_INFURA_ID}`;
};

export const getWeb3Initialised = (networkName: string) =>
  new Web3(getProviderUrl(networkName));

export const getProvider = (chainId: number, networkName: string) => {
  return new ethers.providers.JsonRpcProvider(getProviderUrl(networkName), {
    chainId: chainId,
    name: networkName.toLowerCase(),
  });
};

export const encodeParameter = (
  paramType: string = "uint256",
  amount: string | number | undefined,
  networkName: string
) => {
  const web3Initialised = getWeb3Initialised(networkName);

  return amount
    ? web3Initialised.eth.abi.encodeParameter(paramType, amount)
    : undefined;
};

export const decodeParameter = (
  type: string = "uint256",
  data: string,
  networkName: string
) => {
  const web3Initialised = getWeb3Initialised(networkName);
  return data ? web3Initialised.eth.abi.decodeParameter(type, data) : undefined;
};

export const getCalculateTransactionCost = async (
  params: BuildBridgeTxResponseDto,
  networkName: string
): Promise<string> => {
  try {
    const web3Initialised = getWeb3Initialised(networkName);
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

export const getEthWalletBalance = async (
  networkName: string,
  address: string
): Promise<string> => {
  try {
    const web3 = new Web3(getProviderUrl(getNetworkName(networkName)));
    return await web3.eth.getBalance(address);
  } catch (e) {
    consoleLogger.error("Error getting eth wallet balance", e);
    hydraLogger.error("Error getting eth wallet balance", e);
  }
};

export const getNetworkName = (name: string) => {
  const lowerCaseName = name.toLowerCase();
  return lowerCaseName === ETHEREUM_NAME
    ? ETHEREUM_NETWORK_NAME
    : lowerCaseName;
};
