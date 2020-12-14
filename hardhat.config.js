require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers");
require("hardhat-deploy");
// require("@symfoni/hardhat-react");
// require("hardhat-typechain");
// require("typechain-target-ethers-v5");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

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
  solidity: "0.7.5",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', // 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1', // 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c', // 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913', // 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d
          balance: '0xf0000000000000000',
        },
      ]
    },
    ganache: {
      url: "http://localhost:8545",
      accounts: [
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', // 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
        '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1', // 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
        '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c', // 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
        '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913', // 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d
      ]
    },
    bsc: {
      url: "https://bsc-dataseed4.ninicoin.io:443",
      accounts: process.env.MAINNET_PRIVATE_KEY ? [ process.env.MAINNET_PRIVATE_KEY ] : [],
    },
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: process.env.TESTNET_PRIVATE_KEY ? [ process.env.TESTNET_PRIVATE_KEY ] : [],
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
};

