import { expect } from "chai";
import { Contract } from "ethers";
import { hopBridgeErc20 } from "../shared/constants";

export async function shouldSetHopBridgeErc20(hydraBridge: Contract) {
  await hydraBridge.setHopBridgeErc20(hopBridgeErc20);
  const _hopBridgeErc20 = await hydraBridge._hopBridgeErc20();
  expect(_hopBridgeErc20).to.equal(hopBridgeErc20);
}
