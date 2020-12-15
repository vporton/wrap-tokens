// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');

function exportContract(name) {
    const text = fs.readFileSync(`tmp/${name}.json`);
    const json = JSON.parse(text);
    fs.writeFileSync(`frontend/public/bytecode/${name}.bytecode`, json.bytecode);
    fs.writeFileSync(`frontend/public/bytecode/${name}.abi`, JSON.stringify(json.abi));
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const contracts = [
    'ERC20OverERC1155',
    'ERC20LockedERC1155',
    'SmartWalletWithERC1155LockedERC20',
    'SmartWalletWithERC1155OverERC20',
    'SmartWalletWithERC20LockedERC1155',
    'SmartWalletWithERC20OverERC1155'
  ];
  for (let name of contracts) {
    exportContract(name);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
