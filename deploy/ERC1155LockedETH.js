const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC1155LockedETH';
const uuid = '0de6a9ee-45d7-11eb-97b5-874ae92f991f';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
