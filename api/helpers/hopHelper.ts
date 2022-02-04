import { Chain, Hop } from "@hop-protocol/sdk";
import { BigNumber } from "ethers";
import { consoleLogger, hydraLogger } from "./hydraLogger";
import { getProvider } from "./web3";

export const getHopAmountOut = async (
  networkName: string,
  token: string,
  chainFrom: Chain,
  chainTo: Chain,
  amount: BigNumber
): Promise<string> => {
  try {
    const hop = new Hop(networkName, getProvider());
    const bridge = hop.bridge(token);
    const amountOut = await bridge.getSendData(amount, chainFrom, chainTo);
    return parseFloat(amountOut.estimatedReceived.toString()) === 0.0
      ? amount.toString()
      : amountOut.estimatedReceived.toString();
  } catch (e) {
    consoleLogger.error("Error getting hop amount out", e);
    hydraLogger.error("Error getting hop amount out", e);
    return "0";
  }
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
