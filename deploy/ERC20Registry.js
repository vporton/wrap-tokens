const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC20Registry';

async function main({getNamedAccounts, deployments}) {
    const erc20OverErc1155 = await deployments.get('ERC20OverERC1155');
    const erc20LockedErc1155 = await deployments.get('ERC20LockedERC1155');
    await myDeploy(contractName, erc20OverErc1155.address, erc20LockedErc1155.address)({getNamedAccounts, deployments});
}

module.exports = main;
module.exports.tags = [contractName];
