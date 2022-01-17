import { expect } from "chai";
import { ethers } from "hardhat";
import {
  erc20Predicate,
  hopBridge,
  polygonRootChainManager,
} from "./shared/constants";

describe("HydraBridge", function () {
  it("Should set erc20 predicate", async () => {
    await Promise.resolve();
    const HydraBridge = await ethers.getContractFactory("HydraBridge");

    const hydraBridge = await HydraBridge.deploy(
      polygonRootChainManager,
      erc20Predicate,
      erc20Predicate
    );

    await hydraBridge.deployed();

    const setHopBridge = await hydraBridge.setHopBridge(
        hopBridge
    );

    // wait until the transaction is mined
    await setHopBridge.wait();
    const _hopBridge = await hydraBridge._hopBridge();
    expect(_hopBridge).to.equal(
      hopBridge
    );
  });
});
