import { ethers } from "ethers";
import Web3 from "web3";
import { BuildTxResponseDto } from "../common/dtos";

require("dotenv").config();
const { REACT_APP_ETH_INFURA_ID, REACT_APP_ETH_NETWORK } = process.env;

export const getProviderUrl = () =>
  `https://${REACT_APP_ETH_NETWORK}.infura.io/v3/${REACT_APP_ETH_INFURA_ID}`;

export const calculateTransactionCost = async (
  params: BuildTxResponseDto
): Promise<string> => {
  const web3 = new Web3(getProviderUrl());
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await web3.eth.estimateGas(params);
  var transactionFee = Number.parseInt(gasPrice) * gasLimit;
  return ethers.utils.formatEther(transactionFee);
};
