import React, { useState } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Modal from "web3modal";

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

let myWeb3Provider: any = null;

async function getWeb3() {
    if(myWeb3) return myWeb3;

    if((window as any).ethereum) {
        const web3Modal = myWeb3Modal();
        myWeb3Provider = await web3Modal.connect();
    }
    return myWeb3 = myWeb3Provider ? new Web3(myWeb3Provider) : null;
}

function App() {
  const [erc20Contract, _setErc20Contract] = useState('');
  const [erc1155Token, _setErc1155Token] = useState('');
  const [amount, setAmount] = useState('');
  function setErc20Contract(v: string) {
    _setErc20Contract(v);
    // _setErc1155Token(bigInt(v.substring(2), 16).toString());
    _setErc1155Token(Web3.utils.toBN(v).toString());
  }
  function setErc1155Token(v: string) {
    _setErc1155Token(v);
    _setErc20Contract(Web3.utils.toHex(v));
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Manage Smart Crypto Funds</h1>
        <p>ERC-20 token address:
          <Address value={erc20Contract} onChange={(e: Event) => setErc20Contract((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 token ID:
          <Uint256 value={erc1155Token} onChange={(e: Event) => setErc1155Token((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 locker contract address: <Uint256/></p>
        <p>
          Amount: <Amount value={amount} onChange={(e: Event) => setAmount((e.target as HTMLInputElement).value as string)}/>
          <input type="button" value="Swap ERC-1155 to ERC-20"/>
          <input type="button" value="Swap ERC-20 to ERC-1155"/>
        </p>
      </header>
    </div>
  );
}

function Address({...props}) {
  return (
    <span className="Address">
      <input type="text" maxLength={42} size={50} value={props.value ? props.value : ""} onChange={props.onChange}/>
    </span>
  )
}

function Uint256({...props}) {
  return (
    <span className="Uint256">
      <input type="text" maxLength={78} size={92} value={props.value ? props.value : ""} onChange={props.onChange}/>
    </span>
  )
}

function Amount({...props}  ) {
  return (
    <span className="Amount">
      <input type="text" value={props.value ? props.value : ""} onChange={props.onChange}/>
    </span>
  )
}

export default App;
