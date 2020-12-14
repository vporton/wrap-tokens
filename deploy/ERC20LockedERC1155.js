const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC20LockedERC1155';
const uuid = 'ef754770-3dd1-11eb-bcaf-cf9f6068b160';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
