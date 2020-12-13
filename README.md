# Wrap Tokens
TD;DR: You use this system either for (or for both):
* wrap any ERC1155 in ERC20 or vice versa
* bequest your funds for science and free software (please do!), you can even keep doing DeFi (earn interest) while your funds are on our "bequest" account and choose to bequest to us your interest, too

Features:

* Wrap/lock different kinds of Ethereum tokens in other tokens.
* Provide smart wallets for DeFi.

It provides interface between ERC20 <-> ERC1155 through both (for your choice):

* locked tokens
* wrapped tokens (with a bug: events are not emitted)

WARNING: The smart contracts in this package were not audited/tested!

## The smart wallet usage

[This project](http://reward.portonvictor.org) has a smart contract that can take funds from your wallet in a point of a future. The funds from your wallet go to supporting science and free software. (It uses prediction markets with conditional tokens for the users of that contract to be able to profit from your contribution before it is unlocked. It is essentially a transfer of money from the future using mathematical equalities to which markets conform, without a time-machine.) You can put your funds in that system (using a special smart contract call). If the point of the future when the funds are unlocked is not yet passed (and it is planned to be 100 years future from now!), then you can at any moment take your funds back. It provides a mean of bequest: Please put (when that contract will be deployed on mainnet), all (or at least some) your funds at that contract. While you are alive, you can take your funds back at any time. But if you die (or lose the private key), our contract will take your funds and use for charitable purposes.

For us to be able to take your bequested funds, please don't forget to approve (TODO: explain how and create the UI) every ERC-20 token that you wrap in our ERC-1155 contracts to be spent by our charity.

It is complicated by the fact that our charitable contract uses ERC-1155 tokens. No problem: We provide contracts that can "transform" ERC-20 to ERC-1155. So please use a contract from this package (or to-be-developed frontend) to put your ERC-20 tokens (and ETH) into it and donate or bequest the magically created ERC-1155 token. Just do it for the charity. You lose nothing: You won't need your tokens after 100 years, but we need it.

Well, there were two more problems:
* You could not use the bequested tokens directly if you need them, but would need first withdraw them from the system. (You can do at any time, but that's inconvenient.)
* You could not use the bequested tokens for a DeFi earn interest, because they are not on your wallet but on ours and you would not receive the interest.

The problems were solved! Just use one of the `SmartWalletWith*` contract (You need to deploy it yourself, you can't use somebody other's smart wallet - TODO: frontend for deployment) to put your tokens on it. This contract is an _Argent wallet_ compatible wallet, so you can do with your funds in it anything you could do with a plain Ethereum wallet. For example, you can earn DeFi interest from a DeFi token put on such a wallet. Moreover, we will inherit your earned interest, too. (Don't forget to approve withdrawal of the earned tokens by our charity!) 

Moreover, unlike the Argent wallet, all our `SmartWalletWith*` contracts are fully ERC-1155 compatible.

## FAQ

**Can it happen that my funds will be taken before the set time passes?**

No, the smart contract are written in such a way, that we can increase but can't decrease the period of time we can't take your funds.

## Smart Contracts

We have the following smart contracts:

* `ERC1155LockedERC20` - you can swap (and swap back) any ERC-20 token to a ERC-1155 token whose ID is just the contract address of the ERC-20.
* `ERC1155OverERC20` - you give pemission to this contract transfer ERC-20 as if it were a ERC-1155 token (whose ID is just the contract address of the ERC-20), that is when you transfer this ERC-1155, the ERC-20 is transferred too, and vice versa. Non-fixable bug: This ERC-1155 does not emit events on transfers (because we can't emit every event the standard requires, as it would involve emitting an event for every token holder on the net when you initialize it, what is clearly impossible).

and in the reverse direction:

* `ERC20LockedERC1155` - you can swap (and swap back) any ERC-1155 token to your ERC-20 token.
* `ERC20OverERC1155` - you give pemission to this contract transfer a ERC-1155 token as if it were a ERC-20 token, that is when you transfer this ERC-20, the ERC-1155 is transferred too, and vice versa. Non-fixable bug: This ERC-20 does not emit events on transfers (because we can't emit every event the standard requires, as it would involve emitting an event for every token holder on the net when you initialize it, what is clearly impossible).

It is your choice whether to use `*Locked*` or `*Over*` tokens: `*Over*` are easier to use and spend less gas, but they have a bug (see above). Note that this bug does _not_ matter for our science and free software donations and bequest system.

Finally, as said above for every of the above contracts, we have also the four corresponding `SmartWalletWith*` contracts, that you can use to both bequest your funds and keep using them for DeFi and other contract calls.

## Installation

```sh
yarn
npx hardhat compile
npx hardhat deploy --network ...
```
