const hardhat = require("hardhat");
const fs = require('fs');

const { log } = deployments;

function updateAddress(json, network, property, value) {
    if (network == 'ganache' || network == 'hardhat') {
        network = 'local';
    }
    switch (network) {
        case 'local':
        case 'mainnet':
        case 'goerli':
        case 'kovan':
        case 'matic':
        case 'mumbai':
        case 'ropsten':
        case 'rinkeby':
        case 'sokol':
        case 'core':
        case 'xdai':
        case 'callisto':
        case 'bsc':
        case 'bsctest':
            if (!json[network]) {
                json[network] = {};
            }
            json[network][property] = value;
    }
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
            gasPrice: ethers.utils.parseUnits(process.env.GAS_PRICE ? process.env.GAS_PRICE : '25', 'gwei'),
            gas: '1300000',
            args: args,
        });
        if (deployResult.newlyDeployed) {
            log(`contract ${contractName} deployed at ${deployResult.address} in block ${deployResult.receipt.blockNumber} using ${deployResult.receipt.gasUsed} gas`);
        }

        try {
            fs.mkdirSync('data');
        }
        catch(_) { }

        {
            const abisFileName = `frontend/public/abis.json`;
            let json;
            try {
                const text = fs.readFileSync(abisFileName);
                json = JSON.parse(text);
            }
            catch(_) {
                json = {};  
            }
            json[contractName] = deployResult.abi;
            fs.writeFileSync(abisFileName, JSON.stringify(json));
        }

        {
            const addressesFileName = `frontend/public/addresses.json`;
            let json;
            try {
                const text = fs.readFileSync(addressesFileName);
                json = JSON.parse(text);
            }
            catch(_) {
                json = {};  
            }
            updateAddress(json, hardhat.network.name, contractName, {
                address: deployResult.address,
                block: deployResult.receipt.blockNumber,
            });
            fs.writeFileSync(addressesFileName, JSON.stringify(json));
        }
    }
}
