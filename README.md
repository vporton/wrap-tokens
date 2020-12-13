# wrap-tokens
Features:

* Wrap/lock different kinds of Ethereum tokens in other tokens.
* Provide smart wallets for DeFi.

It provides interface between ERC20 <-> ERC1155 through both:

* locked tokens
* wrapped tokens (with a bug: events are not emitted)

WARNING: The smart contracts in this package were not audited/tested!

## The smart wallet usage

[This project](http://reward.portonvictor.org) has a smart contract that can take funds from your wallet in a point of a future. The funds from your wallet go to supporting science and free software. (It uses prediction markets with conditional tokens for the users of that contract to be able to profit from your contribution before it is unlocked. It is essentially a transfer of money from the future using mathematical equalities to which markets conform, without a time-machine.) You can put your funds in that system (using a special smart contract call). If the point of the future when the funds are unlocked is not yet passed (and it is planned to be 100 years future from now!), then you can at any moment take your funds back. It provides a mean of bequest: Please put (when that contract will be deployed on mainnet), all (or at least some) your funds at that contract. While you are alive, you can take your funds back at any time. But if you die, our contract will take your funds and use for charitable purposes.

It is complicated by the fact that our charitable contract uses ERC-1155 tokens. No problem: We provide contracts that can "transform" ERC-20 to ERC-1155. So please use a contract from this package (or to-be-developed frontend) to put your ERC-20 tokens (and ETH) into it and donate or bequest the magically created ERC-1155 token. Just do it for the charity. You lose nothing: You won't need your tokens after 100 years, but we need it.

Well, there were two more problems:
* You could not use the bequested tokens directly if you need them, but would need first withdraw them from the system. (You can do at any time, but that's inconvenient.)
* You could not use the bequested tokens for a DeFi earn interest, because they are not on your wallet but on ours and you would not receive the interest.

The problems were solved! Just use one of the `SmartWalletWith*` contract (You need to deploy it yourself, you can't use somebody other's smart wallet - TODO: frontend for deployment) to put your tokens on it. This contract is an _Argent wallet_ compatible wallet, so you can do with your funds in it anything you could do with a plain Ethereum wallet.

## Installation

```sh
yarn
npx hardhat compile
npx hardhat deploy --network ...
```
