require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers");
require("hardhat-deploy");
require("@symfoni/hardhat-react");
require("hardhat-typechain");
require("typechain-target-ethers-v5");

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
          privateKey: '0x0e206566a53a138f9500dd3ffaf12bbf3c773a34a0e78e6710b0726b82951e6d', // 0xfd95BF6727416050008dB2551c94C86D21bA3b77
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0x3d258b188e1e2bd69821990cc143830ce2be03dc24774c787090de8ef6bca214', // 0x4948C09461d37946Ea13b98d2C3f2D3C185fde2f
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0xdfe891177936f97142e0b8c6eefb7042d051536984a2bf2c46def1f01d37bf87', // 0x5530B1eC2bCD7B2fbDF780Ab5e7A4dE40541F3A8
          balance: '0xf0000000000000000',
        },
        {
          privateKey: '0xc37ae67042d02207a663c52522dc805089c3effb4aaf8e70195782e18b7c919a', // 0x2E8a38DA64876002DFF88B0f2855f7eE6A2B0aaD
          balance: '0xf0000000000000000',
        },
      ]
    },
    ganache: {
      url: "http://localhost:8545",
      accounts: [
        '0x0e206566a53a138f9500dd3ffaf12bbf3c773a34a0e78e6710b0726b82951e6d', // 0xfd95BF6727416050008dB2551c94C86D21bA3b77
        '0x3d258b188e1e2bd69821990cc143830ce2be03dc24774c787090de8ef6bca214', // 0x4948C09461d37946Ea13b98d2C3f2D3C185fde2f
        '0xdfe891177936f97142e0b8c6eefb7042d051536984a2bf2c46def1f01d37bf87', // 0x5530B1eC2bCD7B2fbDF780Ab5e7A4dE40541F3A8
        '0xc37ae67042d02207a663c52522dc805089c3effb4aaf8e70195782e18b7c919a', // 0x2E8a38DA64876002DFF88B0f2855f7eE6A2B0aaD
      ]
    },
  },
};

