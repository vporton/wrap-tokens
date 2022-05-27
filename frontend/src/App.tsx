import React, { createRef, useState, useEffect, RefObject } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import './App.css';
import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
import erc20Abi from './ERC20Abi';
import erc1155Abi from './ERC1155Abi';
import {
  getChainId, isAddressValid, isUint256Valid, isWrappedTokenValid, isRealNumber, fetchOnceJson, baseGetWeb3,
} from './common';
import { Address, Uint256, Amount } from './widgets';
import ETHToERC1155 from './routes/ETHToERC1155';
import Erc20ToERC1155 from './routes/Erc20ToERC1155';
import Erc1155ToERC20 from './routes/Erc1155ToERC20';
const { toBN, fromWei, toWei } = Web3.utils;

// TODO: Show pending transactions.
// TODO: Better dialog than alert()
// TODO: Show a warning if ERC-20 address points to a non-existing contract.

// TODO
const CHAINS: { [id: string] : string } = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  // '1337': 'local',
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
  '56': 'bsc',
  '97': 'bsctest',
  '31337': 'local',
}

// let _web3Modal: any = null;

// async function myWeb3Modal() {
//   if (_web3Modal) {
//     return _web3Modal;
//   }

//   // const MewConnect = require('@myetherwallet/mewconnect-web-client');

//   const providerOptions = {
//       mewconnect: {
//           package: MewConnect, // required
//           options: {
//               infuraId: process.env.REACT_APP_INFURA_ID || '859569f6decc4446a5da1bb680e7e9cf'
//           }
//       }
//   };

//   return _web3Modal = new Web3Modal({
//     network: 'mainnet',
//     cacheProvider: true,
//     providerOptions
//   });
// }

// async function getWeb3Provider() {
//   if(_web3Provider) {
//     return _web3Provider;
//   } else {
//     // await connectEvents();
//   }
//   return _web3Provider = (window as any).ethereum ? await (await myWeb3Modal()).connect() : null;
// }

function App() {
  const [connectedToAccount, setConnectedToAccount] = useState(true); // Don't show the message by default.

  async function getWeb3() {
    try {
      (window as any).ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
    }
    catch(_) { }
    const web3 = await baseGetWeb3();
    getAccounts().then((accounts) => {
      setConnectedToAccount(accounts && accounts.length !== 0);
    });
    return web3;
  }

  async function getABIs() {
    return await fetchOnceJson(`abis.json`);
  }

  async function getAddresses() {
    const [json, chainId] = await Promise.all([fetchOnceJson(`addresses.json`), getChainId()]);
    return CHAINS[chainId] ? json[CHAINS[chainId]] : null;
  }

  async function getAccounts(): Promise<Array<string>> {
    const web3 = await baseGetWeb3();
    return web3 ? (web3 as any).eth.getAccounts() : null;
  }

  // FIXME: returns Promise?
  async function mySend(contract: string, method: any, args: Array<any>, sendArgs: any, handler: any): Promise<any> {
    sendArgs = sendArgs || {}
    const account = (await getAccounts())[0];
    return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs})
        .then((estimatedGas: string) => {
            const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
            if(handler !== null)
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
            else
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
        });
  }

  const context = { getWeb3, getABIs, getAddresses, getAccounts, mySend, connectedToAccount, setConnectedToAccount };

  return (
    <HashRouter>
      <div className="App">
        <header className="App-header">
          <ul className="header">
            <li><NavLink exact to="/">ETH &rarr; ERC1155</NavLink></li>
            <li><NavLink to="/erc20toErc1155">ERC20 &rarr; ERC1155</NavLink></li>
            <li><NavLink to="/erc1155toErc20">ERC1155 &rarr; ERC20</NavLink></li>
          </ul>
          <p style={{marginTop: 0}}>
            <small>
              <a href="https://github.com/vporton/wrap-tokens">Docs and source</a>
              {' '}|{' '}
              <a href="https://portonvictor.org">Author</a>
              {' '}|{' '}
              <a href="https://gitcoin.co/grants/1865/convert-erc-1155-erc-20-need-021224376-eth">
                Donate for full deployment on mainnet
              </a>
            </small>
          </p>
          <p style={{display: connectedToAccount ? 'none' : 'block', fontSize: '50%', color: 'red', fontWeight: 'bold'}}>Please connect to an Ethereum account!</p>
          <div className="content">
            <Route exact path="/">
              <ETHToERC1155 context={context}/>
            </Route>
            <Route path="/erc20toErc1155">
              <Erc20ToERC1155 context={context}/>
            </Route>
            <Route path="/erc1155toErc20">
              <Erc1155ToERC20 context={context}/>
            </Route>
          </div>
        </header>
      </div>
    </HashRouter>
  );
}

export default App;
