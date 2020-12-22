import React, { useState, isValidElement, ChangeEvent } from 'react';
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
const { toBN, fromWei, toWei } = Web3.utils;

// TODO: This code is messy.

let myWeb3: any = null;

// TODO: Show pending transactions.
// TODO: Better dialog than alert()

// TODO
const CHAINS: { [id: string] : string } = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '1337': 'local',
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
let _web3Modal: any = null;

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

async function baseGetWeb3() {
  if(myWeb3) return myWeb3;

  _web3Provider = Web3.givenProvider; //await getWeb3Provider();
  return myWeb3 = _web3Provider ? new Web3(_web3Provider) : null;
}

async function getChainId(): Promise<any> { // TODO: more specific type
  const web3 = await baseGetWeb3();
  if (!web3) {
    return null;
  }
  return await (web3 as any).eth.getChainId();
}

function isAddressValid(v: string): boolean { // TODO: called twice
  return Web3.utils.isAddress(v);
}

function isUint256Valid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)));
}

function isWrappedTokenValid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(160)));
}

function isRealNumber(v: string): boolean { // TODO: called twice
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

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
  const [connectedToAccount, setConnectedToAccount] = useState(true); // Don't show the message by default.

  async function getWeb3() {
    try {
      (window as any).ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
    }
    catch(_) { }
    const web3 = await baseGetWeb3();
    getAccounts().then((accounts) => {
      setConnectedToAccount(accounts.length !== 0);
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
    const web3 = await getWeb3();
    const account = (await getAccounts())[0];
    return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs}).
        then((estimatedGas: string) => {
            const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
            if(handler !== null)
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
            else
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
        });
  }
  
  function Erc20ToERC1155() {
    const [erc20Contract, _setErc20Contract] = useState('');
    const [erc1155Token, _setErc1155Token] = useState('');
    const [lockerContract, _setLockerContract] = useState('');
    const [wrapperContract, setWrapperContract] = useState('');
    const [erc20Amount, setErc20Amount] = useState('');
    const [erc20Symbol, setErc20Symbol] = useState('');
    const [lockedErc1155Amount, setLockedErc1155Amount] = useState('');
    const [amount, setAmount] = useState('');
    const [erc1155WrapperApproved, setErc1155WrapperApproved] = useState(false);
  
    let myEvents = [null, null, null, null, null];
    
    // TODO: Connect two contracts separately.
    async function connectEvents(erc20Contract: string, lockerContract: string, erc1155Token: string) {
      console.log('connectEvents')
      // for (let ev of myEvents) {
      //   if(ev) (ev as any).unsubscribe();
      // }
      
      if(!isAddressValid(erc20Contract)) {
        return;
      }
      const web3 = await getWeb3();
      if(web3 === null) return;
      web3.eth.clearSubscriptions();
      const account = (await getAccounts())[0];
      if(!account) return;
      if (isAddressValid(lockerContract)) {
        const abi = (await getABIs()).ERC1155LockedERC20;
        const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
        myEvents[0] = erc1155.events.TransferSingle({filter: {_to: account}}, async () => {
          return await loadLockedIn1155(lockerContract, erc1155Token);
        });
        myEvents[1] = erc1155.events.TransferBatch({filter: {_to: account}}, async () => {
          return await loadLockedIn1155(lockerContract, erc1155Token);
        });
      }
      if (isAddressValid(erc20Contract)) {
        const abi = await fetchOnceJson('erc20-abi.json');
        const erc20 = new (web3 as any).eth.Contract(abi, erc20Contract);
        // TODO: Don't reload token symbol.
        myEvents[2] = erc20.events.Transfer({filter: {to: account}}, async () => {
          return await loadErc20(erc20Contract);
        });
        myEvents[3] = erc20.events.Transfer({filter: {from: account}}, async () => {
          return await loadErc20(erc20Contract);
        });
  
        // TODO: Don't reload token symbol.
        myEvents[4] = erc20.events.Approval({filter: {owner: account, spender: wrapperContract}}, async () => {
          return await checkErc1155WrapperApproved(erc20Contract);
        });
      }
    }
  
    if ((window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', async (chainId: any) => { // TODO: more specific type
        // TODO: hacky code
        // TODO: duplicate code
        await getAddresses().then((addresses) => {
          if (addresses) {
            setLockerContract(addresses.ERC1155LockedERC20.address);
            setWrapperContract(addresses.ERC1155OverERC20.address);
          }
        });
        await loadLockedIn1155(lockerContract, erc1155Token);
        await loadErc20(erc20Contract);
      });
  
      (window as any).ethereum.on('accountsChanged', async function (accounts: Array<string>) {
        if (isAddressValid(erc20Contract)) {
          setConnectedToAccount(accounts.length !== 0);
          await loadErc20(erc20Contract);
        }
      });
    }
  
    async function setErc20Contract(v: string) {
      _setErc20Contract(v);
      let tokenId = "";
      if(isAddressValid(v)) {
        tokenId = toBN(v).toString();
        _setErc1155Token(tokenId);
      } else {
        _setErc1155Token("");
      }
      await loadErc20(v);
      await loadLockedIn1155(lockerContract, tokenId);
      await connectEvents(v, lockerContract, tokenId);
      await checkErc1155WrapperApproved(v);
    }
  
    async function setErc1155Token(v: string) {
      _setErc1155Token(v);
      if(isWrappedTokenValid(v)) {
        const hex = Web3.utils.toHex(v);
        const addr = hex.replace(/^0x/, '0x' + '0'.repeat(42 - hex.length))
        const checksumed = Web3.utils.toChecksumAddress(addr);
        _setErc20Contract(checksumed);
        await loadErc20(checksumed);
        await checkErc1155WrapperApproved(checksumed);
        await connectEvents(checksumed, lockerContract, v);
      } else {
        _setErc20Contract("");
        await loadErc20("");
        await checkErc1155WrapperApproved("");
        await connectEvents(erc20Contract, lockerContract, v);
      }
      await loadLockedIn1155(lockerContract, v);
    }
  
    async function loadErc20(_erc20Contract: string) {
      // TODO: Don't call functions repeatedly.
      if (isAddressValid(_erc20Contract)) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc20 = new (web3 as any).eth.Contract(erc20Abi as any, _erc20Contract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
        
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
      if (isAddressValid(_lockerContract) && isWrappedTokenValid(_erc1155Token)) {
        const abi = (await getABIs()).ERC1155LockedERC20;
        if (abi) {
          const web3 = await getWeb3();
          if (web3 !== null) {
            const erc1155 = new (web3 as any).eth.Contract(abi as any, _lockerContract);
            const account = (await getAccounts())[0];
            if(!account) {
              setConnectedToAccount(false);
              return;
            }
    
            if (isWrappedTokenValid(_erc1155Token)) {
              erc1155.methods.balanceOf(account, _erc1155Token).call()
                .then((balance: string) => {
                  setLockedErc1155Amount(balance);
                })
                .catch((e: any) => {
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
  
    async function checkErc1155WrapperApproved(_erc20Contract: string) {
      if (isAddressValid(_erc20Contract)) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const account = (await getAccounts())[0];
          if(!account) {
            setErc1155WrapperApproved(false);
            return;
          }
          try {
            const erc20 = new (web3 as any).eth.Contract(erc20Abi as any, _erc20Contract);
            const allowanceStr = await erc20.methods.allowance(account, wrapperContract).call();
            const allowance = toBN(allowanceStr);
            const halfBig = toBN(2).pow(toBN(128));
            setErc1155WrapperApproved(!allowance.lt(halfBig));
          }
          catch(_) {
            setErc1155WrapperApproved(false);
          }
        } else {
          setErc1155WrapperApproved(false);
        }
      } else {
        setErc1155WrapperApproved(false);
      }
    }
  
    async function setLockerContract(v: string) {
      _setLockerContract(v);
      await loadLockedIn1155(v, erc1155Token);
    }
  
    // Without this does not load on Chromium, when coming by an external link:
    getAddresses().then((addresses) => {
      if (addresses) {
        setLockerContract(addresses.ERC1155LockedERC20.address);
        setWrapperContract(addresses.ERC1155OverERC20.address);
      }
    });
  
    async function lockErc20inErc1155() {
      if (isAddressValid(lockerContract) && isAddressValid(erc20Contract)) {
        const abi = (await getABIs()).ERC1155LockedERC20;
        const abi2 = await fetchOnceJson('erc20-abi.json');
        const web3 = await getWeb3();
        if (web3 !== null) {
          try {
            const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
            const erc20 = new (web3 as any).eth.Contract(abi2 as any, erc20Contract);
            const account = (await getAccounts())[0];
            if(!account) {
              setConnectedToAccount(false);
              return;
            }
            const allowanceStr = await erc20.methods.allowance(account, lockerContract).call();
            const allowance = toBN(allowanceStr);
            const halfBig = toBN(2).pow(toBN(128));
            if(allowance.lt(halfBig)) {
              const big = toBN(2).pow(toBN(256)).sub(toBN(1));
              await mySend(erc20, erc20.methods.approve, [lockerContract, big.toString()], {from: account}, null)
                // .catch(e => alert(e.message));
            }
            console.log(erc1155, erc1155.methods.borrowERC20, [erc20Contract, toWei(amount), account, account, []], {from: account}, null)
            await mySend(erc1155, erc1155.methods.borrowERC20, [erc20Contract, toWei(amount), account, account, []], {from: account}, null)
              .catch(e => alert(e.message));
          }
          catch(e) {
            alert(e.message);
          }
        }
      }
    }
  
    async function approveErc1155Wrapper() {
      if (isAddressValid(erc20Contract)) {
        const abi = await fetchOnceJson('erc20-abi.json');
        const web3 = await getWeb3();
        if (web3 !== null) {
          try {
            const erc20 = new (web3 as any).eth.Contract(abi as any, erc20Contract);
            const account = (await getAccounts())[0];
            if(!account) {
              setConnectedToAccount(false);
              return;
            }
            const allowanceStr = await erc20.methods.allowance(account, wrapperContract).call();
            const allowance = toBN(allowanceStr);
            const halfBig = toBN(2).pow(toBN(128));
            if(allowance.lt(halfBig)) {
              const big = toBN(2).pow(toBN(256)).sub(toBN(1));
              await mySend(erc20, erc20.methods.approve, [wrapperContract, big], {from: account}, null)
                // .catch(e => alert(e.message));
            }
          }
          catch(e) {
            alert(e.message);
            return;
          }
        }
      }
    }
  
    async function unlockErc20fromErc1155() {
      if (isAddressValid(lockerContract) && isAddressValid(erc20Contract)) {
        const abi = (await getABIs()).ERC1155LockedERC20;
        const web3 = await getWeb3();
        if (web3 !== null) {
          try {
            const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
            const account = (await getAccounts())[0];
            if(!account) {
              setConnectedToAccount(false);
              return;
            }
            await mySend(erc1155, erc1155.methods.returnToERC20, [erc20Contract, toWei(amount), account], {from: account}, null)
              // .catch(e => alert(e.message));
          }
          catch(e) {
            alert(e.message);
          }
        }
      }
    }
  
    return (
      <div>
        <p>ERC-20 token address:
          {' '}
          <Address value={erc20Contract} onChange={async (e: Event) => await setErc20Contract((e.target as HTMLInputElement).value as string)}/>
          {' '}
          <span style={{display: erc1155WrapperApproved ? 'none': 'inline'}}>
            <button onClick={approveErc1155Wrapper} disabled={!isAddressValid(erc20Contract)}>
              Approve for ERC-1155
            </button>
            &nbsp;
            <span style={{cursor: 'help'}} title="Allow the ERC-1155 wrapper contract to transfer funds for you (only when you explicitly request a transfer).">ⓘ</span>
          </span>
          <small style={{display: erc1155WrapperApproved ? 'inline': 'none'}}>
            (approved for ERC-1155 wrapper)
          </small>
        </p>
        <p>ERC-1155 <small>(has bug)</small> wrapper contract address:{' '}
          <code className="address">{wrapperContract}</code></p>
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
      </div>
    );
  }

  function Erc1155ToERC20() {
    const [erc1155Contract, _setErc1155Contract] = useState('');
    const [erc1155Token2, _setErc1155Token2] = useState('');
    const [erc20WrapperApproved, setErc20WrapperApproved] = useState(false);
    const [wrapperContract2, setWrapperContract2] = useState('');
    const [lockerContract2, setLockerContract2] = useState('');
    const [erc1155Amount, setErc1155Amount] = useState('');
    const [lockedErc20Amount, setLockedErc20Amount] = useState('');

    async function approveErc20Wrapper() {
    }

    async function loadRegistered(erc1155Contract: string, erc1155Token2: string) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const abi = (await getABIs()).ERC20Registry;
        const contractAddress = (await getAddresses())["ERC20Registry"].address;
        const registry = new (web3 as any).eth.Contract(abi, contractAddress);

        const address1 = await registry.methods.getWrapper(erc1155Contract, erc1155Token2).call();
        setWrapperContract2(/^0x0+$/.test(address1) ? "" : address1);
        const address2 = await registry.methods.getLocker(erc1155Contract, erc1155Token2).call();
        setLockerContract2(/^0x0+$/.test(address2) ? "" : address2);
        if (address2 !== '') {
          await loadLockedIn20(address2);
        }
      }
    }

    // TODO: parallel loading
    async function setErc1155Contract(v: string) {
      _setErc1155Contract(v);
      await loadErc1155(v, erc1155Token2);
      await loadLockedIn20(lockerContract2);
      // await connectEvents(v, lockerContract, tokenId); // FIXME
      await checkErc20WrapperApproved(v);
      await loadRegistered(v, erc1155Token2);
    }
  
    // TODO: parallel loading
    async function setErc1155Token2(v: string) {
      _setErc1155Token2(v);
      await loadErc1155(erc1155Contract, v);
      await loadLockedIn20(lockerContract2);
      // await connectEvents(v, lockerContract, tokenId); // FIXME
      await checkErc20WrapperApproved(erc1155Contract);
      await loadRegistered(erc1155Contract, v);
    }
  
    async function loadErc1155(_erc1155Contract: string, _tokenId: string) {
      // TODO: Don't call functions repeatedly.
      if (isAddressValid(_erc1155Contract) && isUint256Valid(_tokenId)) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc1155 = new (web3 as any).eth.Contract(erc1155Abi as any, _erc1155Contract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
        
          erc1155.methods.balanceOf(account, _tokenId).call()
            .then((balance: string) => {
              setErc1155Amount(balance);
            })
            .catch(() => {
              setErc1155Amount("");
            });
        } else {
          setErc1155Amount("");
        }
      } else {
        setErc1155Amount("");
      }
    }
  
    async function loadLockedIn20(_lockerContract: string) {
      // TODO: Don't call functions repeatedly.
      if (isAddressValid(_lockerContract)) {
        const abi = (await getABIs()).ERC20LockedERC1155;
        if (abi) {
          const web3 = await getWeb3();
          if (web3 !== null) {
            const erc20 = new (web3 as any).eth.Contract(abi as any, _lockerContract);
            const account = (await getAccounts())[0];
            if(!account) {
              setConnectedToAccount(false);
              return;
            }
    
            erc20.methods.balanceOf(account).call()
              .then((balance: string) => {
                setLockedErc20Amount(balance);
              })
              .catch((e: any) => {
                setLockedErc20Amount("");
              });
          } else {
            setLockedErc20Amount("");
          }
        }
      } else {
        setLockedErc20Amount("");
      }
    }
  
    async function checkErc20WrapperApproved(_erc20Contract: string) {
      if (isAddressValid(_erc20Contract)) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const account = (await getAccounts())[0];
          if(!account) {
            setErc20WrapperApproved(false);
            return;
          }
          try {
            const erc1155 = new (web3 as any).eth.Contract(erc1155Abi as any, erc1155Contract);
            // FIXME
            // const approved = await erc1155.methods.isApprovedForAll(account, wrapperContract).call();
            // setErc20WrapperApproved(approved);
          }
          catch(_) {
            setErc20WrapperApproved(false);
          }
        } else {
          setErc20WrapperApproved(false);
        }
      } else {
        setErc20WrapperApproved(false);
      }
    }
  
    async function createErc20Wrapper() {
      const web3 = await getWeb3();
      const abi = (await getABIs()).ERC20Registry;
      const account = (await getAccounts())[0];
      const contractAddress = (await getAddresses())["ERC20Registry"].address;
      const registry = new (web3 as any).eth.Contract(abi, contractAddress);
      const tx = await mySend(
          registry,
          registry.methods.registerWrapper,
          [erc1155Contract, erc1155Token2],
          {from: account},
          null
        )
        .catch(e => alert(e.message)); // FIXME: Return.
      /*const receipt =*/ await tx;
      const address = await registry.methods.getWrapper(erc1155Contract, erc1155Token2).call();
      setWrapperContract2(address);
    }

    async function createErc20Locker() {
      const web3 = await getWeb3();
      const abi = (await getABIs()).ERC20Registry;
      const account = (await getAccounts())[0];
      const contractAddress = (await getAddresses())["ERC20Registry"].address;
      const registry = new (web3 as any).eth.Contract(abi, contractAddress);
      const tx = await mySend(
          registry,
          registry.methods.registerLocker,
          [erc1155Contract, erc1155Token2],
          {from: account},
          null
        )
        .catch(e => alert(e.message)); // FIXME: Return.
      /*const receipt =*/ await tx;
      const address = await registry.methods.getLocker(erc1155Contract, erc1155Token2).call();
      setLockerContract2(address);
      await loadLockedIn20(address);
    }

    let myEvents = [null, null, null, null];
    
    // TODO: Connect two contracts separately.
    async function connectEvents(erc1155Contract: string, erc1155Token: string, lockerContract: string) {
      console.log('connectEvents')
      // for (let ev of myEvents) {
      //   if(ev) (ev as any).unsubscribe();
      // }
      
      if(!isAddressValid(erc1155Contract) || isUint256Valid(erc1155Token2)) {
        return;
      }
      const web3 = await getWeb3();
      if(web3 === null) return;
      web3.eth.clearSubscriptions(); // FIXME: clears also the other page!
      const account = (await getAccounts())[0];
      if(!account) return;
      if (isAddressValid(lockerContract)) {
        const abi = (await getABIs()).ERC20LockedERC1155;
        const erc20 = new (web3 as any).eth.Contract(abi as any, lockerContract);
        myEvents[0] = erc20.events.Transfer({filter: {to: account}}, async () => {
          return await loadLockedIn20(lockerContract);
        });
      }
      {
        const erc1155 = new (web3 as any).eth.Contract(erc1155Abi, erc1155Contract);
        // TODO: Don't reload token symbol.
        myEvents[1] = erc1155.events.TransferSingle({filter: {_to: account}}, async () => {
          return await loadErc1155(erc1155Contract, erc1155Token2);
        });
        myEvents[2] = erc1155.events.TransferSingle({filter: {_from: account}}, async () => {
          return await loadErc1155(erc1155Contract, erc1155Token2);
        });
  
        // TODO: Don't reload token symbol.
        myEvents[3] = erc1155.events.ApprovalForAll({filter: {account: account, operator: wrapperContract2}}, async () => {
          // return await checkErc1155WrapperApproved(erc1155Contract); // FIXME
        });
      }
    }
  
    return (
      <div>
        <p>ERC-1155 contract:
          {' '}
          <Address value={erc1155Contract} onChange={async (e: Event) => await setErc1155Contract((e.target as HTMLInputElement).value as string)}/>
          {' '}
          <span style={{display: erc20WrapperApproved ? 'none': 'inline'}}>
            <button onClick={approveErc20Wrapper} disabled={!isAddressValid(erc1155Contract)}>
              Approve for ERC-20
            </button>
            &nbsp;
            <span style={{cursor: 'help'}} title="Allow the ERC-20 wrapper contract to transfer funds for you (only when you explicitly request a transfer).">ⓘ</span>
          </span>
          <small style={{display: erc20WrapperApproved ? 'inline': 'none'}}>
            (approved for ERC-20 wrapper)
          </small>
        </p>
        <p>ERC-1155 token ID:
          {' '}
          <Uint256 value={erc1155Token2}
                   onChange={async (e: Event) => await setErc1155Token2((e.target as HTMLInputElement).value as string)}/>
        </p>
        <p>Wrapper contract:
          {' '}
          <code className="address">{wrapperContract2}</code>
          {' '}
          <button onClick={createErc20Wrapper} style={{display: wrapperContract2 !== '' ? 'none' : 'inline'}}>Create</button></p>
        <p>Locker contract:
          {' '}
          <code className="address">{lockerContract2}</code>
          {' '}
          <button onClick={createErc20Locker} style={{display: lockerContract2 !== '' ? 'none' : 'inline'}}>Create</button></p>
        <p>Amount on ERC-1155:
          {' '}
          <span>{erc1155Amount === '' ? '–' : fromWei(erc1155Amount)}</span></p>
        <p>Amount locked in ERC-20:
          {' '}
          <span>{lockedErc20Amount === '' ? '–' : fromWei(lockedErc20Amount)}</span></p>
        <p>
          Amount:
          {' '}
          <Amount/>
          {' '}
          <input type="button" value="Lock ERC-1155 in ERC-20"
                 disabled={true}/>
          {' '}
          <input type="button" value="Unlock ERC-1155 to ERC-20"
                 disabled={true}/>
        </p>
        <p>Locking/unlocking is 1/1 swap.</p>
      </div>
    );
  }

  // TODO: <script> should be in <head>. // TODO: Google Analytics does not work.
  return (
    <HashRouter>
      <div className="App">
        <header className="App-header">
          <ul className="header">
            <li><NavLink exact to="/">ERC20 &rarr; ERC1155</NavLink></li>
            <li><NavLink to="/erc1155toErc20">ERC1155 &rarr; ERC20</NavLink></li>
          </ul>
          <p style={{marginTop: 0}}>
            <small>
              <a href="https://github.com/vporton/wrap-tokens">Docs and source</a>
              {' '}|{' '}
              <a href="https://portonvictor.org">Author</a>
              {' '}|{' '}
              <a href="https://gitcoin.co/grants/1591/science-of-the-future">Donate</a>
            </small>
          </p>
          <p style={{display: connectedToAccount ? 'none' : 'block', fontSize: '50%', color: 'red', fontWeight: 'bold'}}>Please connect to an Ethereum account!</p>
          <div className="content">
            <Route exact path="/" component={Erc20ToERC1155}/>
            <Route path="/erc1155toErc20" component={Erc1155ToERC20}/>
          </div>
        </header>
      </div>
    </HashRouter>
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

function Uint256({...props}) {
  return (
    <span className="Uint256">
      <input type="text"
             maxLength={78}
             size={92}
             value={props.value}
             onChange={props.onChange}
             className={isUint256Valid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function WrappedERC20({...props}) {
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
