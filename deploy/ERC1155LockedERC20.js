const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC1155LockedERC20';
const uuid = 'dbb44a74-3dd1-11eb-acfd-3b7be55515a1';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
