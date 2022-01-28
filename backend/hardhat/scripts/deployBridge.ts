// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hardhat from "hardhat";
import "dotenv/config";
import { Contract } from "ethers";

const {
  ETH_NETWORK,
  L1_HOP_BRIDGE_ADDRESS_GOERLI,
  ROOT_CHAIN_MANAGER_PROXY_GOERLI,
  ERC20_PREDICATE_PROXY_GOERLI,
  ROOT_CHAIN_MANAGER_PROXY_MAINNET,
  ERC20_PREDICATE_PROXY_MAINNET,
  L1_HOP_BRIDGE_ETH_ADDRESS_MAINNET,
  L1_HOP_BRIDGE_USDC_ADDRESS_MAINNET,
} = process.env;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  let hydraBridge: Contract;

  const { ethers } = hardhat;
  const [owner] = await ethers.getSigners();

  console.log(`Owner Account: ${owner.address}`);

  const HydraBridge = await ethers.getContractFactory("HydraBridge");

  if (ETH_NETWORK === "goerli") {
    hydraBridge = await HydraBridge.deploy(
      ROOT_CHAIN_MANAGER_PROXY_GOERLI,
      ERC20_PREDICATE_PROXY_GOERLI,
      L1_HOP_BRIDGE_ADDRESS_GOERLI,
      L1_HOP_BRIDGE_ADDRESS_GOERLI
    );
  }

  if (ETH_NETWORK === "mainnet") {
    hydraBridge = await HydraBridge.deploy(
      ROOT_CHAIN_MANAGER_PROXY_MAINNET,
      ERC20_PREDICATE_PROXY_MAINNET,
      L1_HOP_BRIDGE_ETH_ADDRESS_MAINNET,
      L1_HOP_BRIDGE_USDC_ADDRESS_MAINNET
    );
  }

  await hydraBridge.deployed();

  console.log("Hydra bridge deployed to:", hydraBridge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
