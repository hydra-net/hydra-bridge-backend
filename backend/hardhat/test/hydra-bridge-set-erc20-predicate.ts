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
      hopBridge,
      hopBridge
    );

    await hydraBridge.deployed();

    const setErc20Predicate = await hydraBridge.setErc20Predicate(
        erc20Predicate
    );

    // wait until the transaction is mined
    await setErc20Predicate.wait();
    const _erc20Predicate = await hydraBridge._erc20Predicate();
    expect(_erc20Predicate).to.equal(
      erc20Predicate
    );
  });
});
