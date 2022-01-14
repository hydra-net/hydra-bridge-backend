import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import Web3 from "web3";
import { erc20Abi } from "../common/abis/erc20Abi";
import { BuildTxResponseDto, IsApprovedDto } from "../common/dtos";
require("dotenv").config();
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
  type: string = "uint256",
  amount: string | number | undefined
) => {
  return amount
    ? web3Initialised.eth.abi.encodeParameter(type, amount)
    : undefined;
};

export const decodeParameter = (type: string = "uint256", data: any) => {
  return data ? web3Initialised.eth.abi.decodeParameter(type, data) : undefined;
};

export const calculateTransactionCost = async (
  params: BuildTxResponseDto
): Promise<string> => {
  const gasPrice = await web3Initialised.eth.getGasPrice();
  const gasLimit = await web3Initialised.eth.estimateGas(params);
  var transactionFee = Number.parseInt(gasPrice) * gasLimit;
  return ethers.utils.formatEther(transactionFee);
};

export const getIsApproved = async (dto: IsApprovedDto) => {
  const { tokenAddress, recipient, allowanceContractAddr, amount, decimals } =
    dto;
  const rootToken = new ethers.Contract(tokenAddress, erc20Abi, getProvider());

  const res = await rootToken.functions.allowance(
    recipient,
    allowanceContractAddr
  );

  const amountToSpend = parseUnits(amount, decimals);
  const amountAllowed = ethers.BigNumber.from(res.toString());
  return amountAllowed.gte(amountToSpend);
};