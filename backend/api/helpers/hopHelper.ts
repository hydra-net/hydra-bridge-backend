import { Chain, Hop } from "@hop-protocol/sdk";
import { BigNumber } from "ethers";
import { getProvider } from "./web3";

export const getHopAmountOut = async (
  networkName: string,
  token: string,
  chainFrom: Chain,
  chainTo: Chain,
  amount: BigNumber
): Promise<string> => {
  const hop = new Hop(networkName, getProvider());
  const bridge = hop.bridge(token);
  const amountOut = await bridge.getAmountOut(amount, chainFrom, chainTo);
  return amountOut.toString();
};

export const getHopChain = (name: string) => {
  if (name === Chain.Arbitrum.toString()) {
    return Chain.Arbitrum;
  }

  if (name === Chain.Polygon.toString() || name === "Polygon Mumbai") {
    return Chain.Polygon;
  }
  if (name === Chain.Optimism.toString()) {
    return Chain.Optimism;
  }

  if (name === Chain.Gnosis.toString()) {
    return Chain.Gnosis;
  }

  return Chain.Ethereum;
};
