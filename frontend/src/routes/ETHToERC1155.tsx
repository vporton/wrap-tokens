import React, { createRef, useState, useEffect, RefObject } from 'react';
import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
import erc20Abi from '../ERC20Abi';
import erc1155Abi from '../ERC1155Abi';
import { isAddressValid, isRealNumber } from '../common';
import { Address, Uint256, Amount } from '../widgets';
const { toBN, fromWei, toWei } = Web3.utils;

// TODO: Show pending transactions.
// TODO: Better dialog than alert()
// TODO: Show a warning if ERC-20 address points to a non-existing contract.

export default function ETHToERC1155(
  props: {
    context: {
      getWeb3: () => Promise<any>,
      getABIs: () => Promise<any>,
      getAddresses: () => Promise<{ERC1155LockedETH: {address: string}}>,
      getAccounts: () => Promise<Array<string>>,
      mySend: (contract: string, method: any, args: Array<any>, sendArgs: any, handler: any) => Promise<any>,
      connectedToAccount: boolean,
      setConnectedToAccount: (connected: boolean) => void,
    },
  })
{
  const { getWeb3, getABIs, getAddresses, getAccounts, mySend, connectedToAccount, setConnectedToAccount } = props.context;

  const [lockerContract, setLockerContract] = useState('');
  const [lockedErc1155Amount, setLockedErc1155Amount] = useState('');
  const [amount, setAmount] = useState('');
  const [truthworthy, setTruthworthy] = useState(true);

  let myEvents = [null, null];
  
  // TODO: Connect two contracts separately.
  async function connectEvents(lockerContract: string) {
    console.log('connectEvents')
    // for (let ev of myEvents) {
    //   if(ev) (ev as any).unsubscribe();
    // }
    
    const web3 = await getWeb3();
    if(web3 === null) return;
    web3.eth.clearSubscriptions();
    const account = (await getAccounts())[0];
    if(!account) return;
    if (isAddressValid(lockerContract)) {
      const abi = (await getABIs()).ERC1155LockedETH;
      const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
      myEvents[0] = erc1155.events.TransferSingle({filter: {_to: account}}, async () => {
        return await loadLockedIn1155();
      });
      myEvents[1] = erc1155.events.TransferBatch({filter: {_to: account}}, async () => {
        return await loadLockedIn1155();
      });
    }
  }

  if ((window as any).ethereum) {
    (window as any).ethereum.on('chainChanged', async (chainId: any) => { // TODO: more specific type
      // TODO: hacky code
      // TODO: duplicate code
      await getAddresses().then((addresses) => {
        if (addresses && addresses.ERC1155LockedETH) {
          setLockerContract(addresses.ERC1155LockedETH.address);
        }
      });
      await loadLockedIn1155();
    });

    (window as any).ethereum.on('accountsChanged', async function (accounts: Array<string>) {
      setConnectedToAccount(accounts.length !== 0);
    });
  }

  useEffect(() => {
    async function connect() {
      await connectEvents(lockerContract);
    }

    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockerContract]);

  useEffect(() => {
    // FIXME
    getAddresses().then((addresses) => { // ????????????
      setTruthworthy(addresses && lockerContract.toLowerCase() === addresses.ERC1155LockedETH.address.toLowerCase());
    });
  }, [lockerContract]);

  async function loadLockedIn1155() {
    // TODO: Don't call functions repeatedly.
    if (isAddressValid(lockerContract)) {
      const abi = (await getABIs()).ERC1155LockedETH;
      if (abi) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
  
          erc1155.methods.balanceOf(account, 0).call()
            .then((balance: string) => {
              setLockedErc1155Amount(balance);
            })
            .catch((e: any) => {
              setLockedErc1155Amount("");
            });
        } else {
          setLockedErc1155Amount("");
        }
      }
    } else {
      setLockedErc1155Amount("");
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
    if (addresses && addresses.ERC1155LockedETH) { // FIXME: It does not work on mainnet
      setLockerContract(addresses.ERC1155LockedETH.address);
    }
  });

  async function lockETHinErc1155() {
    if (isAddressValid(lockerContract)) {
      const abi = (await getABIs()).ERC1155LockedETH;
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
          await mySend(erc1155, erc1155.methods.borrowETH, [account, []], {from: account, value: toWei(amount)}, null)
            .catch(e => alert(e.message));
        }
        catch(e) {
          alert(e.message);
        }
      }
    }
  }

  async function unlockETHfromErc1155() {
    if (isAddressValid(lockerContract)) {
      const abi = (await getABIs()).ERC1155LockedETH;
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const erc1155 = new (web3 as any).eth.Contract(abi as any, lockerContract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
          await mySend(erc1155, erc1155.methods.returnToETH, [toWei(amount), account], {from: account}, null)
            // .catch(e => alert(e.message));
        }
        catch(e) {
          alert(e.message);
        }
      }
    }
  }

  const truthworthyRef = createRef();

  return (
    <div>
      <p>ERC-1155 token ID: 0</p>
      <p>ERC-1155 locker contract address:
        {' '}
        <Address value={lockerContract} onChange={(e: Event) => setLockerContract((e.target as HTMLInputElement).value as string)}/>
        <span ref={truthworthyRef as RefObject<HTMLSpanElement>} style={{display: truthworthy ? 'inline' : 'none'}}>(truthworty)</span>
        <br/>
        <span style={{color: 'red'}}>(Be sure to use only trustworthy locker contracts!)</span></p>
      <p>Amount locked in ERC-1155:
        {' '}
        <span>{lockedErc1155Amount === '' ? '–' : fromWei(lockedErc1155Amount)}</span></p>
      <p>
        Amount:
        {' '}
        <Amount value={amount} onChange={(e: Event) => setAmount((e.target as HTMLInputElement).value as string)}/>
        {' '}
        <input type="button" value="Lock ETH in ERC-1155" onClick={lockETHinErc1155}
                disabled={!isRealNumber(amount)}/>
        {' '}
        <input type="button" value="Unlock ERC-1155 to ETH" onClick={unlockETHfromErc1155}
                disabled={!isRealNumber(amount)}/>
      </p>
      <p>Locking/unlocking is 1/1 swap.</p>
    </div>
  );
}