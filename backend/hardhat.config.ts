import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "dotenv/config";

const { ETH_NETWORK, ETH_INFURA_ID, ETH_MNEMONIC } = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  defaultNetwork: "hardhat",
  paths: {
    root: "./hardhat",
  },
  networks: {
    [ETH_NETWORK]: {
      url: `https://${ETH_NETWORK}.infura.io/v3/${ETH_INFURA_ID}`,
      accounts: {
        mnemonic: ETH_MNEMONIC,
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${ETH_INFURA_ID}`,
      chainId: 5,
      accounts: {
        mnemonic: ETH_MNEMONIC,
      },
    },
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      chainId: 1337,
      accounts: {
        mnemonic: ETH_MNEMONIC,
      },
    },
  },
};
