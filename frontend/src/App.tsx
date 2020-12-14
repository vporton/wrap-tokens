import React, { useState, isValidElement } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Modal from "web3modal";
import { Contract } from 'ethers';
const { toBN, fromWei, toWei } = Web3.utils;

function getCookie(cname: string): string {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
      c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
      }
  }
  return "";
}

let myWeb3: any = null;

function getEthereumNetworkName() {
  let networkName;
  let chainId = getCookie('web3network');
  if(!chainId) chainId = '0x1';
  switch(chainId.toLowerCase()) {
      case '0x83':
          networkName = 'matic';
          break;
      case '0x13881':
          networkName = 'mumbai';
          break;
      case '0x63':
          networkName = 'poa-core';
          break;
      case '0x4d':
          networkName = 'poa-sokol';
          break;
      default:
          networkName = 'matic'; // TODO: Use poa-core
          break;
  }
  return networkName;
}

function myWeb3Modal() {
    const MewConnect = require('@myetherwallet/mewconnect-web-client'); // TODO

    const providerOptions = {
        mewconnect: {
            package: MewConnect, // required
            options: {
                infuraId: "1d0c278301fc40f3a8f40f25ae3bd328" // required // FIXME
            }
        }
    };

    return new Web3Modal({
      network: getEthereumNetworkName(),
      cacheProvider: true,
      providerOptions
    });
}

async function getWeb3Provider() {
  return (window as any).ethereum ? await myWeb3Modal().connect() : null;
}

async function getWeb3() {
    if(myWeb3) return myWeb3;

    const myWeb3Provider = await getWeb3Provider();
    return myWeb3 = myWeb3Provider ? new Web3(myWeb3Provider) : null;
}

function isAddressValid(v: string): boolean { // TODO: called twice
  return Web3.utils.isAddress(v);
}

function isWrappedTokenValid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(160)));
}

function isRealNumber(v: string): boolean { // TODO: called twice
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

function App() {
  const [erc20Contract, _setErc20Contract] = useState('');
  const [erc1155Token, _setErc1155Token] = useState('');
  const [lockerContract, setLockerContract] = useState('');
  const [erc20Amount, setErc20Amount] = useState('');
  const [erc20Symbol, setErc20Symbol] = useState('');
  const [lockedErc1155Amount, setLockedErc1155Amount] = useState('');
  const [amount, setAmount] = useState('');

  function setErc20Contract(v: string) {
    _setErc20Contract(v);
    if(isAddressValid(v)) {
      _setErc1155Token(toBN(v).toString());
      loadErc20(v);
    } else {
      _setErc1155Token("");
    }
  }

  function setErc1155Token(v: string) {
    _setErc1155Token(v);
    if(isWrappedTokenValid(v)) {
      const hex = Web3.utils.toHex(v);
      const addr = hex.replace(/^0x/, '0x' + '0'.repeat(42 - hex.length))
      _setErc20Contract(Web3.utils.toChecksumAddress(addr));
    } else {
      _setErc20Contract("");
    }
  }

  async function loadErc20(_erc20Contract: string) {
    // TODO: Don't call functions repeatedly.
    const abi = [
      {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
    ];
    const web3 = await getWeb3();
    const erc20 = new web3.eth.Contract(abi as any, _erc20Contract);
    const account = ((await web3.eth.getAccounts()) as Array<string>)[0];

    erc20.methods.balanceOf(account).call()
      .then((balance: string) => {
        setErc20Amount(balance);
      })
      .catch(() => {
        setErc20Amount("");
      });

    erc20.methods.symbol().call()
      .then((symbol: string) => {
        setErc20Symbol(symbol);
      })
      .catch(() => {
        setErc20Symbol("");
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Manage Smart Crypto Funds</h1>
        <p>ERC-20 token address:
          {' '}
          <Address value={erc20Contract} onChange={(e: Event) => setErc20Contract((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 token ID:
          {' '}
          <WrappedERC20 value={erc1155Token} onChange={(e: Event) => setErc1155Token((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 locker contract address:
          {' '}
          <Address value={lockerContract} onChange={(e: Event) => setLockerContract((e.target as HTMLInputElement).value as string)}/>
          <br/>
          <span style={{color: 'red'}}>(Be sure to use only trustworthy locker contracts!)</span></p>
        <p>Amount on ERC-20:
          {' '}
          <span>{erc20Amount === '' ? '–' : fromWei(erc20Amount)}</span>
          {' '}
          <span>{erc20Symbol}</span></p>
        <p>Amount locked in ERC-1155:
          {' '}
          <span>{lockedErc1155Amount === '' ? '–' : fromWei(lockedErc1155Amount)}</span></p>
        <p>
          Amount:
          {' '}
          <Amount value={amount} onChange={(e: Event) => setAmount((e.target as HTMLInputElement).value as string)}/>
          {' '}
          <input type="button" value="Lock ERC-20 in ERC-1155"/>
          {' '}
          <input type="button" value="Unlock ERC-1155 to ERC-20"/>
        </p>
        <p>Locking/unlocking is 1/1 swap.</p>
      </header>
    </div>
  );
}

function Address({...props}) {
  return (
    <span className="Address">
      <input type="text"
             maxLength={42}
             size={50}
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isAddressValid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function WrappedERC20({...props}) { // FIXME: rename
  return (
    <span className="WrappedERC20">
      <input type="text"
             maxLength={49}
             size={56}
             value={props.value}
             onChange={props.onChange}
             className={isWrappedTokenValid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function Amount({...props}  ) {
  return (
    <span className="Amount">
      <input type="text"
             value={props.value ? props.value : ""}
             onChange={props.onChange}
               className={isRealNumber(props.value) ? '' : 'error'}/>
    </span>
  )
}

export default App;
