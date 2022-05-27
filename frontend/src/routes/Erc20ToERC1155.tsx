import React, { createRef, useState, useEffect, RefObject } from 'react';
import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
import erc20Abi from '../ERC20Abi';
import erc1155Abi from '../ERC1155Abi';
import { isAddressValid, isRealNumber, fetchOnceJson, isWrappedTokenValid } from '../common';
import { Address, Uint256, Amount } from '../widgets';
const { toBN, fromWei, toWei } = Web3.utils;

export default function Erc20ToERC1155(
  props: {
    context: {
      getWeb3: () => Promise<any>,
      getABIs: () => Promise<any>,
      getAddresses: () => Promise<{ERC1155LockedERC20: {address: string}, ERC1155OverERC20: {address: string}}>,
      getAccounts: () => Promise<Array<string>>,
      mySend: (contract: string, method: any, args: Array<any>, sendArgs: any, handler: any) => Promise<any>
      connectedToAccount: boolean,
      setConnectedToAccount: (connected: boolean) => void,
    }
  })
{
  const { getWeb3, getABIs, getAddresses, getAccounts, mySend, connectedToAccount, setConnectedToAccount } = props.context;

  const [erc20Contract, setErc20Contract] = useState('');
  const [erc1155Token, setErc1155Token] = useState('');
  const [lockerContract, setLockerContract] = useState('');
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
        return await loadLockedIn1155();
      });
      myEvents[1] = erc1155.events.TransferBatch({filter: {_to: account}}, async () => {
        return await loadLockedIn1155();
      });
    }
    if (isAddressValid(erc20Contract)) {
      const abi = await fetchOnceJson('erc20-abi.json');
      const erc20 = new (web3 as any).eth.Contract(abi, erc20Contract);
      // TODO: Don't reload token symbol.
      myEvents[2] = erc20.events.Transfer({filter: {to: account}}, async () => {
        return await loadErc20();
      });
      myEvents[3] = erc20.events.Transfer({filter: {from: account}}, async () => {
        return await loadErc20();
      });

      // TODO: Don't reload token symbol.
      myEvents[4] = erc20.events.Approval({filter: {owner: account, spender: wrapperContract}}, async () => {
        return await checkErc1155WrapperApproved();
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
      await loadLockedIn1155();
      await loadErc20();
    });

    (window as any).ethereum.on('accountsChanged', async function (accounts: Array<string>) {
      if (isAddressValid(erc20Contract)) {
        setConnectedToAccount(accounts.length !== 0);
        await loadErc20();
      }
    });
  }

  useEffect(() => {
    async function fetchData() {
      await checkErc1155WrapperApproved();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperContract]);

  useEffect(() => {
    async function fetchData() {
      let tokenId = "";
      if(isAddressValid(erc20Contract)) {
        tokenId = toBN(erc20Contract).toString();
        setErc1155Token(tokenId);
      } else {
        setErc1155Token("");
      }
      await loadErc20();
      await checkErc1155WrapperApproved();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Contract]);

  useEffect(() => {
    async function fetchData() {
      if(isWrappedTokenValid(erc1155Token)) {
        const hex = Web3.utils.toHex(erc1155Token);
        const addr = hex.replace(/^0x/, '0x' + '0'.repeat(42 - hex.length))
        const checksumed = Web3.utils.toChecksumAddress(addr);
        setErc20Contract(checksumed);
      } else {
        setErc20Contract("");
      }
      await loadLockedIn1155();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc1155Token]);

  useEffect(() => {
    async function connect() {
      await connectEvents(erc20Contract, lockerContract, erc1155Token);
    }

    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Contract, lockerContract, erc1155Token]);

  async function loadErc20() {
    // TODO: Don't call functions repeatedly.
    if (isAddressValid(erc20Contract)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const erc20 = new (web3 as any).eth.Contract(erc20Abi as any, erc20Contract);
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

  async function loadLockedIn1155() {
    // TODO: Don't call functions repeatedly.
    if (isAddressValid(lockerContract) && isWrappedTokenValid(erc1155Token)) {
      const abi = (await getABIs()).ERC1155LockedERC20;
      if (abi) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
  
          if (isWrappedTokenValid(erc1155Token)) {
            erc1155.methods.balanceOf(account, erc1155Token).call()
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

  async function checkErc1155WrapperApproved() {
    if (isAddressValid(wrapperContract)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const account = (await getAccounts())[0];
        if(!account) {
          setErc1155WrapperApproved(false);
          return;
        }
        try {
          const erc20 = new (web3 as any).eth.Contract(erc20Abi as any, erc20Contract);
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

  useEffect(() => {
    async function fetchData() {
      await loadLockedIn1155();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockerContract]);

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
          const big = toBN(2).pow(toBN(256)).sub(toBN(1));
          await mySend(erc20, erc20.methods.approve, [wrapperContract, big], {from: account}, null)
            // .catch(e => alert(e.message));
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
      <p>ERC-1155 <small>(has non-dangerous bug)</small> wrapper contract address:{' '}
        <code className="address">{wrapperContract}</code></p>
      <p>ERC-1155 token ID:
        {' '}
        <WrappedERC20 value={erc1155Token} onChange={async (e: Event) => await setErc1155Token((e.target as HTMLInputElement).value as string)}/></p>
      <p>ERC-1155 locker contract address:
        {' '}
        <Address value={lockerContract} onChange={async (e: Event) => await setLockerContract((e.target as HTMLInputElement).value as string)}/>
        <br/>
        <span style={{color: 'red'}}>
          (Be sure to use only trustworthy locker contracts!)
        </span>
      </p>
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

function WrappedERC20({...props}) {
  return (
    <span className="WrappedERC20">
      <input type="text"
             style={{maxWidth: '27em', width: '100%'}} /* Hack for 160 bit value */
             maxLength={49}
             size={56}
             value={props.value}
             onChange={props.onChange}
             className={isWrappedTokenValid(props.value) ? '' : 'error'}/>
    </span>
  )
}
