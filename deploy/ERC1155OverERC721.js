const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC1155OverERC721';
const uuid = 'a1300c10-6434-11eb-a25d-0770bc31d373';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
