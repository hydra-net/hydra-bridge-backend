import { ethers } from "ethers";
import Web3 from "web3";
require("dotenv").config();
const { ETH_INFURA_ID, ETH_NETWORK, ETH_CHAIN_ID } = process.env;

export const getProviderUrl = () => {
  let provider = `https://${ETH_NETWORK}.infura.io/v3/${ETH_INFURA_ID}`;

  if (ETH_CHAIN_ID === "1337") {
    provider = "http://localhost:8545";
  }
  return provider;
};

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
  type: string,
  amount: string | number | undefined
) => {
  const web3 = new Web3(getProviderUrl());
  return amount ? web3.eth.abi.encodeParameter("uint256", amount) : undefined;
};