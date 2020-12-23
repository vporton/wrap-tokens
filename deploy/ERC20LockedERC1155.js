const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC20LockedERC1155';

module.exports = myDeploy(contractName);
module.exports.tags = [contractName];
