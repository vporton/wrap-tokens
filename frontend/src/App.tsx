import React, { useState, isValidElement, ChangeEvent } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Modal from "web3modal";
const { toBN, fromWei, toWei } = Web3.utils;

let myWeb3: any = null;

// TODO
const CHAINS: { [id: string] : string } = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '101': 'local', // FIXME
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
}

let _web3Provider: any = null;

function isAddressValid(v: string): boolean { // TODO: called twice
  return Web3.utils.isAddress(v);
}

function isWrappedTokenValid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(160)));
}

function isRealNumber(v: string): boolean { // TODO: called twice
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

// TODO: Handle Ethereum network change.

function App() {
  const [erc20Contract, _setErc20Contract] = useState('');
  const [erc1155Token, _setErc1155Token] = useState('');
  const [lockerContract, _setLockerContract] = useState('');
  const [erc20Amount, setErc20Amount] = useState('');
  const [erc20Symbol, setErc20Symbol] = useState('');
  const [lockedErc1155Amount, setLockedErc1155Amount] = useState('');
  const [amount, setAmount] = useState('');

  let _web3Modal: any = null;

  async function myWeb3Modal() {
    if (_web3Modal) {
      return _web3Modal;
    }

    const MewConnect = require('@myetherwallet/mewconnect-web-client'); // TODO

    const providerOptions = {
        mewconnect: {
            package: MewConnect, // required
            options: {
                infuraId: "1d0c278301fc40f3a8f40f25ae3bd328" // required // FIXME
            }
        }
    };

    return _web3Modal = new Web3Modal({
      // network: 'mainnet',
      cacheProvider: true,
      providerOptions
    });
  }
  
  async function getWeb3Provider() {
    return _web3Provider = (window as any).ethereum ? (await myWeb3Modal()).connect() : null;
  }
  
  async function getWeb3() {
    if(myWeb3) return myWeb3;
  
    _web3Provider = await getWeb3Provider();
    console.log('_web3Provider', _web3Provider)
    return myWeb3 = _web3Provider ? new Web3(_web3Provider) : null;
  }
  
  async function setErc20Contract(v: string) {
    _setErc20Contract(v);
    if(isAddressValid(v)) {
      _setErc1155Token(toBN(v).toString());
      await loadErc20(v);
    } else {
      _setErc1155Token("");
    }
  }

  async function setErc1155Token(v: string) {
    _setErc1155Token(v);
    if(isWrappedTokenValid(v)) {
      const hex = Web3.utils.toHex(v);
      const addr = hex.replace(/^0x/, '0x' + '0'.repeat(42 - hex.length))
      _setErc20Contract(Web3.utils.toChecksumAddress(addr));
      await loadLockedIn1155(lockerContract, v);
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
    if (_erc20Contract !== '') {
      const web3 = await getWeb3();
      if (web3 !== null) {
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
      } else {
        setErc20Amount("");
        setErc20Symbol("");
      }
    } else {
      setErc20Amount("");
      setErc20Symbol("");
    }
  }

  async function loadLockedIn1155(_lockerContract: string, _erc1155Token: string) {
    // TODO: Don't call functions repeatedly.
    const abi = [
      {
        "constant": true,
        "inputs": [
          {
              "name": "user",
              "type": "address"
          },
          {
            "name": "token",
            "type": "uint256"
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
    ];
  
    if (_lockerContract !== '') {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const erc1155 = new web3.eth.Contract(abi as any, _lockerContract);
        const account = ((await web3.eth.getAccounts()) as Array<string>)[0];

        erc1155.methods.balanceOf(account, _erc1155Token).call()
          .then((balance: string) => {
            setLockedErc1155Amount(balance);
          })
          .catch(() => {
            setLockedErc1155Amount("");
          });
      } else {
        setLockedErc1155Amount("");
      }
    } else {
      setLockedErc1155Amount("");
    }
}

  async function setLockerContract(v: string) {
    _setLockerContract(v);
    await loadLockedIn1155(v, erc1155Token);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Manage Smart Crypto Funds</h1>
        <p>ERC-20 token address:
          {' '}
          <Address value={erc20Contract} onChange={async (e: Event) => await setErc20Contract((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 token ID:
          {' '}
          <WrappedERC20 value={erc1155Token} onChange={async (e: Event) => await setErc1155Token((e.target as HTMLInputElement).value as string)}/></p>
        <p>ERC-1155 locker contract address:
          {' '}
          <Address value={lockerContract} onChange={async (e: Event) => await setLockerContract((e.target as HTMLInputElement).value as string)}/>
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
