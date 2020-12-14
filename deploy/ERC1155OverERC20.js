const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC1155OverERC20';
const uuid = '183db4f2-3dce-11eb-92a8-0b35ea444c93';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
