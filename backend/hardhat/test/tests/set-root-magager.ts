import { expect } from "chai";
import {
  polygonRootChainManager,
} from "../shared/constants";

export async function shouldSetRootManager(_hydraBridge) {
  const setRootManagerTx = await _hydraBridge.setRootManager(
    polygonRootChainManager
  );

  // wait until the transaction is mined
  await setRootManagerTx.wait();
  const rootChainManager = await _hydraBridge._polygonRootChainManager();
  expect(rootChainManager).to.equal(polygonRootChainManager);
}
