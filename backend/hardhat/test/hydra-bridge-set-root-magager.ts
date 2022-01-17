import { expect } from "chai";
import { ethers } from "hardhat";
import {
  erc20Predicate,
  hopBridge,
  polygonRootChainManager,
} from "./shared/constants";

describe("HydraBridge", function () {
  it("Should set root manager", async () => {
    await Promise.resolve();
    const HydraBridge = await ethers.getContractFactory("HydraBridge");

    const hydraBridge = await HydraBridge.deploy(
      hopBridge,
      erc20Predicate,
      hopBridge
    );

    await hydraBridge.deployed();

    const setRootManagerTx = await hydraBridge.setRootManager(
      polygonRootChainManager
    );

    // wait until the transaction is mined
    await setRootManagerTx.wait();
    const rootChainManager = await hydraBridge._polygonRootChainManager();
    expect(rootChainManager).to.equal(
      polygonRootChainManager
    );
  });
});
