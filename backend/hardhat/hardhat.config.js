require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const { ETH_NETWORK, ETH_INFURA_ID, PRIVATE_KEY } = process.env;

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
  solidity: "0.8.4",
  defaultNetwork: "goerli",
  networks: {
    [ETH_NETWORK]: {
      url: `https://${ETH_NETWORK}.infura.io/v3/${ETH_INFURA_ID}`,
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${ETH_INFURA_ID}`,
      chainId: 5,
      accounts: [PRIVATE_KEY],
    },
  },
};
