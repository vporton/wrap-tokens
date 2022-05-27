import React, { createRef, useState, useEffect, RefObject } from 'react';
import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
import erc1155Abi from '../ERC1155Abi';
import { isAddressValid, isUint256Valid } from '../common';
import { Address, Uint256, Amount } from '../widgets';
const { toBN, fromWei, toWei } = Web3.utils;

export default function Erc1155ToERC20(
  props: {
    context: {
      getWeb3: () => Promise<any>,
      getABIs: () => Promise<any>,
      getAddresses: () => Promise<{ERC20Registry: {address: string}}>,
      getAccounts: () => Promise<Array<string>>,
      mySend: (contract: string, method: any, args: Array<any>, sendArgs: any, handler: any) => Promise<any>
      connectedToAccount: boolean,
      setConnectedToAccount: (connected: boolean) => void,
    },
  })
{
  const { getWeb3, getABIs, getAddresses, getAccounts, mySend, connectedToAccount, setConnectedToAccount } = props.context;

  const [erc1155Contract, setErc1155Contract] = useState('');
  const [erc1155Token2, setErc1155Token2] = useState('');
  const [erc20WrapperApproved, setErc20WrapperApproved] = useState(false);
  const [wrapperContract2, setWrapperContract2] = useState('');
  const [lockerContract2, setLockerContract2] = useState('');
  const [erc1155Amount, setErc1155Amount] = useState('');
  const [amount, setAmount] = useState('');
  const [lockedErc20Amount, setLockedErc20Amount] = useState('');

  async function loadRegistered() {
    if (isAddressValid(erc1155Contract) && isUint256Valid(erc1155Token2)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const abi = (await getABIs()).ERC20Registry;
        const contractAddress = (await getAddresses()).ERC20Registry.address;
        const registry = new (web3 as any).eth.Contract(abi, contractAddress);

        const address1 = await registry.methods.getWrapper(erc1155Contract, erc1155Token2).call();
        setWrapperContract2(/^0x0+$/.test(address1) ? "" : address1);
        const address2 = await registry.methods.getLocker(erc1155Contract, erc1155Token2).call();
        setLockerContract2(/^0x0+$/.test(address2) ? "" : address2);
      }
    }
  }

  useEffect(() => {
    async function fetchData() {
      await loadRegistered();
      await loadErc1155();
      await connectEvents();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc1155Contract, erc1155Token2]);

  useEffect(() => {
    async function fetchData() {
      await checkErc20WrapperApproved();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc1155Contract, wrapperContract2]);

  useEffect(() => {
    async function fetchData() {
      await connectEvents();
      await loadLockedIn20();
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockerContract2]);

  async function loadErc1155() {
    // TODO: Don't call functions repeatedly.
    if (isAddressValid(erc1155Contract) && isUint256Valid(erc1155Token2)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const erc1155 = new (web3 as any).eth.Contract(erc1155Abi as any, erc1155Contract);
        const account = (await getAccounts())[0];
        if(!account) {
          setConnectedToAccount(false);
          return;
        }

        erc1155.methods.balanceOf(account, erc1155Token2).call()
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

  async function loadLockedIn20() {
    // TODO: Don't call functions repeatedly.
    if (isAddressValid(lockerContract2)) {
      const abi = (await getABIs()).ERC20LockedERC1155;
      if (abi) {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const erc20 = new (web3 as any).eth.Contract(abi as any, lockerContract2);
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

  async function checkErc20WrapperApproved() {
    if (isAddressValid(erc1155Contract) && wrapperContract2 !== '') {
      const web3 = await getWeb3();
      if (web3 !== null) {
        const account = (await getAccounts())[0];
        if(!account) {
          setErc20WrapperApproved(false);
          return;
        }
        try {
          const erc1155 = new (web3 as any).eth.Contract(erc1155Abi as any, erc1155Contract);
          const approved = await erc1155.methods.isApprovedForAll(account, wrapperContract2).call();
          setErc20WrapperApproved(approved);
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
    const contractAddress = (await getAddresses()).ERC20Registry.address;
    const registry = new (web3 as any).eth.Contract(abi, contractAddress);
    const tx = await mySend(
        registry,
        registry.methods.registerWrapper,
        [erc1155Contract, erc1155Token2],
        {from: account},
        null
      )
      .catch(e => alert(e.message))
      .then(async tx => {
        /*const receipt =*/ await tx;
        const address = await registry.methods.getWrapper(erc1155Contract, erc1155Token2).call();
        setWrapperContract2(address);
      });
  }

  async function createErc20Locker() {
    const web3 = await getWeb3();
    const abi = (await getABIs()).ERC20Registry;
    const account = (await getAccounts())[0];
    const contractAddress = (await getAddresses()).ERC20Registry.address;
    const registry = new (web3 as any).eth.Contract(abi, contractAddress);
    const tx = await mySend(
        registry,
        registry.methods.registerLocker,
        [erc1155Contract, erc1155Token2],
        {from: account},
        null
      )
      .catch(e => alert(e.message))
      .then(async tx => {
        /*const receipt =*/ await tx;
        const address = await registry.methods.getLocker(erc1155Contract, erc1155Token2).call();
        setLockerContract2(address);
      });
  }

  let myEvents = [null, null, null, null, null];
  
  // TODO: Connect two contracts separately.
  async function connectEvents() {
    console.log('connectEvents2')
    // for (let ev of myEvents) {
    //   if(ev) (ev as any).unsubscribe();
    // }
    
    const web3 = await getWeb3();
    if(web3 === null) return;
    web3.eth.clearSubscriptions(); // FIXME: clears also the other page!
    const account = (await getAccounts())[0];
    if(!account) return;
    console.log('lockerContract2', lockerContract2)
    if (isAddressValid(lockerContract2)) {
      const abi = (await getABIs()).ERC20LockedERC1155;
      const erc20 = new (web3 as any).eth.Contract(abi as any, lockerContract2);
      myEvents[0] = erc20.events.Transfer({filter: {to: account}}, async () => {
        return await loadLockedIn20();
      });
      myEvents[1] = erc20.events.Transfer({filter: {from: account}}, async () => {
        return await loadLockedIn20();
      });
    }
    try {
      const erc1155 = new (web3 as any).eth.Contract(erc1155Abi, erc1155Contract);
      // TODO: Don't reload token symbol.
      myEvents[2] = erc1155.events.TransferSingle({filter: {_to: account}}, async () => {
        return await loadErc1155();
      });
      myEvents[3] = erc1155.events.TransferSingle({filter: {_from: account}}, async () => {
        return await loadErc1155();
      });

      // TODO: Don't reload token symbol.
      myEvents[4] = erc1155.events.ApprovalForAll({filter: {account: account, operator: wrapperContract2}}, async () => {
        return await checkErc20WrapperApproved();
      });
    }
    catch(_) { }
  }

  async function lockErc1155inErc20() {
    if (isAddressValid(lockerContract2)) {
      const abi = (await getABIs()).ERC20LockedERC1155;
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const erc20 = new (web3 as any).eth.Contract(abi as any, lockerContract2);
          const erc1155 = new (web3 as any).eth.Contract(erc1155Abi as any, erc1155Contract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
          const approved = await erc1155.methods.isApprovedForAll(account, lockerContract2).call();
          if(!approved) {
            await mySend(erc1155, erc1155.methods.setApprovalForAll, [lockerContract2, true], {from: account}, null)
              // .catch(e => alert(e.message));
          }
          await mySend(erc20, erc20.methods.borrowERC1155, [toWei(amount), account, account, []], {from: account}, null)
            .catch(e => alert(e.message));
        }
        catch(e) {
          alert(e.message);
        }
      }
    }
  }

  async function approveErc20Wrapper() {
    if (isAddressValid(lockerContract2)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const erc1155 = new (web3 as any).eth.Contract(erc1155Abi, erc1155Contract);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
          await mySend(erc1155, erc1155.methods.setApprovalForAll, [wrapperContract2, true], {from: account}, null)
            // .catch(e => alert(e.message));
        }
        catch(e) {
          alert(e.message);
          return;
        }
      }
    }
  }

  async function unlockErc1155fromErc20() {
    const abi = (await getABIs()).ERC20LockedERC1155;
    if (isAddressValid(lockerContract2)) {
      const web3 = await getWeb3();
      if (web3 !== null) {
        try {
          const erc20 = new (web3 as any).eth.Contract(abi as any, lockerContract2);
          const account = (await getAccounts())[0];
          if(!account) {
            setConnectedToAccount(false);
            return;
          }
          await mySend(erc20, erc20.methods.returnToERC1155, [toWei(amount), account, []], {from: account}, null)
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
      <p>ERC-1155 contract:
        {' '}
        <Address value={erc1155Contract} onChange={async (e: Event) => await setErc1155Contract((e.target as HTMLInputElement).value as string)}/>
        {' '}
        <span style={{display: erc20WrapperApproved ? 'none': 'inline'}}>
          <button onClick={approveErc20Wrapper} disabled={wrapperContract2 === "" || erc20WrapperApproved}>
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
        <button onClick={createErc20Wrapper}
                style={{display: wrapperContract2 !== '' ? 'none' : 'inline'}}
                disabled={!isAddressValid(erc1155Contract) || !isUint256Valid(erc1155Token2)}>Create</button></p>
      <p>Locker contract:
        {' '}
        <code className="address">{lockerContract2}</code>
        {' '}
        <button onClick={createErc20Locker}
                style={{display: lockerContract2 !== '' ? 'none' : 'inline'}}
                disabled={!isAddressValid(erc1155Contract) || !isUint256Valid(erc1155Token2)}>Create</button></p>
      <p>Amount on ERC-1155:
        {' '}
        <span>{erc1155Amount === '' ? '–' : fromWei(erc1155Amount)}</span></p>
      <p>Amount locked in ERC-20:
        {' '}
        <span>{lockedErc20Amount === '' ? '–' : fromWei(lockedErc20Amount)}</span></p>
      <p>
        Amount:
        {' '}
        <Amount value={amount} onChange={(e: Event) => setAmount((e.target as HTMLInputElement).value as string)}/>
        {' '}
        <input type="button" value="Lock ERC-1155 in ERC-20" onClick={lockErc1155inErc20}
                disabled={!isAddressValid(lockerContract2)}/>
        {' '}
        <input type="button" value="Unlock ERC-1155 in ERC-20" onClick={unlockErc1155fromErc20}
                disabled={!isAddressValid(lockerContract2)}/>
      </p>
      <p>Locking/unlocking is 1/1 swap.</p>
    </div>
  );
}
