import { expect } from "chai";
import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

export async function shouldRescueFunds() {
  const SEND_AMOUNT = 200;
  const [receiver] = await ethers.getSigners();
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  await myToken.deployed();

  const RootManager = await ethers.getContractFactory("RootManager");
  const rootManager = await RootManager.deploy();
  await rootManager.deployed();

  const HopBridge = await ethers.getContractFactory("HopBridge");
  const hopBridge = await HopBridge.deploy();
  await hopBridge.deployed();

  const HydraBridge = await ethers.getContractFactory("HydraBridge");
  const hydraBridge = await HydraBridge.deploy(
    rootManager.address,
    myToken.address,
    hopBridge.address
  );

  await hydraBridge.deployed();
 await myToken.transfer(hydraBridge.address, SEND_AMOUNT);

  await expect(() =>
    hydraBridge.functions.rescueFunds(
      myToken.address,
      receiver.address,
      SEND_AMOUNT
    )
  ).to.changeTokenBalance(myToken, hydraBridge, -SEND_AMOUNT);
}
