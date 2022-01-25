import { ethers } from "hardhat";

export async function deployRootManager() {
  const RootManager = await ethers.getContractFactory("RootManager");
  const rootManager = await RootManager.deploy();
  await rootManager.deployed();

  return rootManager;
}

export async function deployHopBridge() {
  const HopBridge = await ethers.getContractFactory("HopBridge");
  const hopBridge = await HopBridge.deploy();
  await hopBridge.deployed();

  return hopBridge;
}

export async function deployErc20() {
  const ERC20 = await ethers.getContractFactory("ERC20");
  const erc20 = await ERC20.deploy("USD token", "USDC");
  await erc20.deployed();

  return erc20;
}

export async function deployHydraBridge(
  rootManagerAddress: string,
  erc20Address: string,
  hopBridgeAddress: string
) {
  const HydraBridge = await ethers.getContractFactory("HydraBridge");
  const hydraBridge = await HydraBridge.deploy(
    rootManagerAddress,
    erc20Address,
    hopBridgeAddress
  );

  await hydraBridge.deployed();

  return hydraBridge;
}
