const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC20OverERC1155';

module.exports = myDeploy(contractName);
module.exports.tags = [contractName];
