import { expect } from "chai";
import { hopBridge } from "../shared/constants";

export async function shouldSetHopBridge(hydraBridge: any) {
  const setHopBridge = await hydraBridge.setHopBridge(hopBridge);

  // wait until the transaction is mined
  await setHopBridge.wait();
  const _hopBridge = await hydraBridge._hopBridge();
  expect(_hopBridge).to.equal(hopBridge);
}
