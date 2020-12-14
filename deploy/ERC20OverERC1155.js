const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'ERC20OverERC1155';
const uuid = '000b0bd8-3dd2-11eb-a46d-abb98f9bd133';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
