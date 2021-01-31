const ethers = require('ethers');

function compositeTokenHash(contractAddress, tokenId) {
    return ethers.utils.solidityKeccak256(["address", "uint256"], [contractAddress, tokenId]);
}

module.exports = {
    compositeTokenHash,
}
