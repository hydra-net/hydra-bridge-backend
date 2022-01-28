import { expect } from "chai";
import { polygonRootChainManager } from "../shared/constants";

export async function shouldSetRootManager(_hydraBridge) {
  await _hydraBridge.setRootManager(polygonRootChainManager);
  const rootChainManager = await _hydraBridge._polygonRootChainManager();
  expect(rootChainManager).to.equal(polygonRootChainManager);
}
