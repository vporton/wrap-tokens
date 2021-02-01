const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC1155LockedERC721';
const uuid = 'c09bb374-6434-11eb-99c7-bf87c95fa77e';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
