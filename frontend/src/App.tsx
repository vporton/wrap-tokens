import React, { useState, isValidElement, ChangeEvent } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Modal from "web3modal";
const { toBN, fromWei, toWei } = Web3.utils;

// FIXME: Funny error message when rejecting a transaction in MetaMask.

let myWeb3: any = null;

let abisPromise: any = null;
let abis: object | null = null;

// TODO
const CHAINS: { [id: string] : string } = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '1337': 'local', // FIXME
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
  '56': 'bsc',
  '97': 'bsctest',
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

// let _fetchedPromises = new Map<string, Promise<any>>();
let _fetchedJsonPromises = new Map<string, Promise<any>>();
let _fetched = new Map<string, any>();

async function fetchOnceJsonPromise(url: string): Promise<Promise<any>> {
  let promise = _fetchedJsonPromises.get(url);
  if (promise) {
    return promise;
  } else {
    const fetchResult = await fetch(url);
    promise = fetchResult.json() as Promise<any>;
    _fetchedJsonPromises.set(url, promise);
    return await promise;
  }
}

async function fetchOnceJson(url: string): Promise<any> {
  let json = _fetched.get(url);
  if (json) {
    return json;
  } else {
    json = await fetchOnceJsonPromise(url);
    _fetched.set(url, json);
    return json;
  }
}

function App() {
  const [erc20Contract, _setErc20Contract] = useState('');
  const [erc1155Token, _setErc1155Token] = useState('');
  const [lockerContract, _setLockerContract] = useState('');
  const [erc20Amount, setErc20Amount] = useState('');
  const [erc20Symbol, setErc20Symbol] = useState('');
  const [lockedErc1155Amount, setLockedErc1155Amount] = useState('');
  const [amount, setAmount] = useState('');

  let _web3Modal: any = null;

  async function getABIs() {
    return await fetchOnceJson(`/abis.json`);
  }
  
  let addressesPromise: any = null;
  let addresses: object | null = null;
  
  async function getChainId(): Promise<any> { // TODO: more specific type
    const web3 = await getWeb3();
    if (!web3) {
      return null;
    }
    return await web3.eth.getChainId();
  }

  async function getAddresses() {
    const [json, chainId] = await Promise.all([fetchOnceJson(`/addresses.json`), getChainId()]);
    const result = json[CHAINS[chainId]]; // FIXME: if non-existing chainId
    return result;
  }
  
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

  let myEvents = [null, null, null, null];
  
  // TODO: Connect two contract separately
  async function connectEvents(erc20Contract: string, lockerContract: string) {
    console.log('connectEvents')
    for (let ev of myEvents) {
      if(ev) (ev as any).unsubscribe();
    }
    const web3 = await getWeb3();
    const account = ((await web3.eth.getAccounts()) as Array<string>)[0]; // TODO: duplicate code
    if (isAddressValid(lockerContract)) {
      const abi = (await getABIs()).ERC1155LockedERC20;
      const erc1155 = new web3.eth.Contract(abi as any, lockerContract);
      myEvents[0] = erc1155.events.TransferSingle({filter: {_to: account}}, async () => {
        return await loadLockedIn1155(lockerContract, erc20Contract);
      });
      myEvents[1] = erc1155.events.TransferBatch({filter: {_to: account}}, async () => {
        return await loadLockedIn1155(erc20Contract, erc20Contract);
      });
    }
    if (isAddressValid(erc20Contract)) {
      const abi = await fetchOnceJson('/erc20-abi.json');
      const erc20 = new web3.eth.Contract(abi, erc20Contract);
      // TODO: Don't reload token symbol.
      myEvents[2] = erc20.events.Transfer({filter: {to: account}}, async () => {
        return await loadErc20(erc20Contract);
      });
      myEvents[3] = erc20.events.Transfer({filter: {from: account}}, async () => {
        return await loadErc20(erc20Contract);
      });
    }
  }

  async function getWeb3Provider() {
    if(_web3Provider) {
      return _web3Provider;
    } else {
      // await connectEvents();
    }
    return _web3Provider = (window as any).ethereum ? (await myWeb3Modal()).connect() : null;
  }
  
  async function getWeb3() {
    if(myWeb3) return myWeb3;
  
    _web3Provider = await getWeb3Provider();
    return myWeb3 = _web3Provider ? new Web3(_web3Provider) : null;
  }
  
  // FIXME: returns Promise?
  async function mySend(contract: string, method: any, args: Array<any>, sendArgs: any, handler: any): Promise<any> {
    sendArgs = sendArgs || {}
    const web3 = await getWeb3();
    const account = ((await web3.eth.getAccounts()) as Array<string>)[0];
    return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs}).
        then((estimatedGas: string) => {
            const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
            if(handler !== null)
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
            else
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
        });
  }
  
  async function setErc20Contract(v: string) {
    _setErc20Contract(v);
    if(isAddressValid(v)) {
      _setErc1155Token(toBN(v).toString());
    } else {
      _setErc1155Token("");
    }
    await loadErc20(v);
    await connectEvents(v, lockerContract);
  }

  async function setErc1155Token(v: string) {
    _setErc1155Token(v);
    if(isWrappedTokenValid(v)) {
      const hex = Web3.utils.toHex(v);
      const addr = hex.replace(/^0x/, '0x' + '0'.repeat(42 - hex.length))
      _setErc20Contract(Web3.utils.toChecksumAddress(addr));
    } else {
      _setErc20Contract("");
    }
    await loadLockedIn1155(lockerContract, v);
    await connectEvents(erc20Contract, v);
  }

  async function loadErc20(_erc20Contract: string) {
    console.log('loadErc20', _erc20Contract);
    // TODO: Don't call functions repeatedly.
    // TODO: Move inside
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
    if (isAddressValid(_erc20Contract)) {
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
    if (_lockerContract !== '') {
      const abi = (await getABIs()).ERC1155LockedERC20;
      if (abi) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc1155 = new web3.eth.Contract(abi as any, _lockerContract);
          const account = ((await web3.eth.getAccounts()) as Array<string>)[0];

          if (isAddressValid(erc20Contract) && isWrappedTokenValid(_erc1155Token)) {
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
    } else {
      setLockedErc1155Amount("");
    }
}

  async function setLockerContract(v: string) {
    _setLockerContract(v);
    await loadLockedIn1155(v, erc1155Token);
  }

  getAddresses().then((addresses) => {
    if (addresses) {
      setLockerContract(addresses.ERC1155LockedERC20.address);
    }
  });

  async function lockErc20inErc1155() {
    if (isAddressValid(lockerContract) && erc20Contract != '') {
      const abi = (await getABIs()).ERC1155LockedERC20;
      const abi2 = await fetchOnceJson('/erc20-abi.json');
      const web3 = await getWeb3();
      if (web3 !== null) {
        const erc1155 = new web3.eth.Contract(abi as any, lockerContract);
        const erc20 = new web3.eth.Contract(abi2 as any, erc20Contract);
        const account = ((await web3.eth.getAccounts()) as Array<string>)[0]; // TODO: duplicate code
        const allowance = toBN(await erc20.methods.allowance(account, lockerContract).call());
        const halfBig = toBN(2).pow(toBN(128));
        if(allowance.lt(halfBig)) {
          const big = toBN(2).pow(toBN(256)).sub(toBN(1));
          await mySend(erc20, erc20.methods.approve, [lockerContract, big], {from: account}, null)
            .catch(alert);
        }
        await mySend(erc1155, erc1155.methods.borrowERC20, [erc20Contract, toWei(amount), account, account, []], {from: account}, null)
          .catch(alert);
      }
    }
  }

  async function unlockErc20fromErc1155() {
    if (isAddressValid(lockerContract) && erc20Contract != '') {
      const abi = (await getABIs()).ERC1155LockedERC20;
      const web3 = await getWeb3();
      if (web3 !== null) {
        const erc1155 = new web3.eth.Contract(abi as any, lockerContract);
        const account = ((await web3.eth.getAccounts()) as Array<string>)[0]; // TODO: duplicate code
        await mySend(erc1155, erc1155.methods.returnToERC20, [erc20Contract, toWei(amount), account], {from: account}, null)
          .catch(alert);
      }
    }
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
          <input type="button" value="Lock ERC-20 in ERC-1155" onClick={lockErc20inErc1155}
                 disabled={!isAddressValid(erc20Contract) || !isRealNumber(amount)}/>
          {' '}
          <input type="button" value="Unlock ERC-1155 to ERC-20" onClick={unlockErc20fromErc1155}
                 disabled={!isAddressValid(erc20Contract) || !isRealNumber(amount)}/>
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
