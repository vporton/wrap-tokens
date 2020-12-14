const hardhat = require("hardhat");
const fs = require('fs');

const { log } = deployments;

function updateAddress(json, property, value, network) {
    if(!json[network]) {
        json[network] = {};
    }
    json[network][property] = value;
}

module.exports = function myDeploy(contractName, ...args) {
    // function jsonInterface() {
    //     const text = fs.readFileSync(`artifacts/${contractName}.json`);
    //     return JSON.parse(text).abi;
    // }
    
    return async ({getNamedAccounts, deployments}) => {
        const namedAccounts = await getNamedAccounts();
        const {deploy} = deployments;
        const {deployer} = namedAccounts;
        log(`Deploying ${contractName}...`);
        const deployResult = await deploy(contractName, {
            from: deployer,
            gasPrice: ethers.utils.parseUnits('1', 'gwei'),
            args: args,
        });
        if (deployResult.newlyDeployed) {
            log(`contract ${contractName} deployed at ${deployResult.address} in block ${deployResult.receipt.blockNumber} using ${deployResult.receipt.gasUsed} gas`);
        }

        try {
            fs.mkdirSync('data');
        }
        catch(_) { }
        const fileName = `data/addresses.json`;
        let json;
        try {
            const text = fs.readFileSync(fileName);
            json = JSON.parse(text);
        }
        catch(_) {
            json = {};  
        }
        updateAddress(json, contractName, deployResult.address, hardhat.network.name);
        updateAddress(json, `${contractName}Block`, deployResult.receipt.blockNumber, hardhat.network.name);
        fs.writeFileSync(fileName, JSON.stringify(json));
    }
}
