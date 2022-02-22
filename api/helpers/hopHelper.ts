import { Chain, Hop } from "@hop-protocol/sdk";
import { BigNumber } from "ethers";
import { consoleLogger, hydraLogger } from "./hydraLogger";
import { getNetworkName, getProvider } from "./web3";

export const getHopAmountOut = async (
  chainFromId: number,
  chainFromName: string,
  token: string,
  hopChainFrom: Chain,
  hopChainTo: Chain,
  amount: BigNumber
): Promise<string> => {
  try {
    const networkName = getNetworkName(chainFromName);
    const hop = new Hop(networkName, getProvider(chainFromId, networkName));
    const bridge = hop.bridge(token);
    const amountOut = await bridge.getSendData(
      amount,
      hopChainFrom,
      hopChainTo
    );
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
