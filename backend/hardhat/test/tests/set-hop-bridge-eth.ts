import { expect } from "chai";
import { Contract } from "ethers";
import { hopBridgeEth } from "../shared/constants";

export async function shouldSetHopBridgeEth(hydraBridge: Contract) {
  await hydraBridge.setHopBridgeEth(hopBridgeEth);
  const _hopBridgeEth = await hydraBridge._hopBridgeEth();
  expect(_hopBridgeEth).to.equal(hopBridgeEth);
}
