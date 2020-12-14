/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import { ERC20OverERC1155 } from "./ERC20OverERC1155";

export class ERC20OverERC1155Factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _erc1155: string,
    _tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ERC20OverERC1155> {
    return super.deploy(
      _erc1155,
      _tokenId,
      overrides || {}
    ) as Promise<ERC20OverERC1155>;
  }
  getDeployTransaction(
    _erc1155: string,
    _tokenId: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_erc1155, _tokenId, overrides || {});
  }
  attach(address: string): ERC20OverERC1155 {
    return super.attach(address) as ERC20OverERC1155;
  }
  connect(signer: Signer): ERC20OverERC1155Factory {
    return super.connect(signer) as ERC20OverERC1155Factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20OverERC1155 {
    return new Contract(address, _abi, signerOrProvider) as ERC20OverERC1155;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IMyERC1155",
        name: "_erc1155",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "erc1155",
    outputs: [
      {
        internalType: "contract IMyERC1155",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516117573803806117578339818101604052604081101561003357600080fd5b810190808051906020019092919080519060200190929190505050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060018190555050506116b1806100a66000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806370a082311161008c578063a9059cbb11610066578063a9059cbb1461045a578063d56022d7146104be578063dd62ed3e146104f2578063eac989f81461056a576100ea565b806370a082311461031b57806395d89b4114610373578063a457c2d7146103f6576100ea565b806318160ddd116100c857806318160ddd146101f457806323b872dd14610212578063313ce5671461029657806339509351146102b7576100ea565b806306fdde03146100ef578063095ea7b31461017257806317d70f7c146101d6575b600080fd5b6100f76105ed565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561013757808201518184015260208101905061011c565b50505050905090810190601f1680156101645780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101be6004803603604081101561018857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061075f565b60405180821515815260200191505060405180910390f35b6101de610774565b6040518082815260200191505060405180910390f35b6101fc61077a565b6040518082815260200191505060405180910390f35b61027e6004803603606081101561022857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610830565b60405180821515815260200191505060405180910390f35b61029e610986565b604051808260ff16815260200191505060405180910390f35b610303600480360360408110156102cd57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a3c565b60405180821515815260200191505060405180910390f35b61035d6004803603602081101561033157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610ae2565b6040518082815260200191505060405180910390f35b61037b610bb7565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103bb5780820151818401526020810190506103a0565b50505050905090810190601f1680156103e85780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6104426004803603604081101561040c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d2a565b60405180821515815260200191505060405180910390f35b6104a66004803603604081101561047057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610dea565b60405180821515815260200191505060405180910390f35b6104c6610f01565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6105546004803603604081101561050857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f25565b6040518082815260200191505060405180910390f35b610572610fac565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156105b2578082015181840152602081019050610597565b50505050905090810190601f1680156105df5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b606060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1662ad800c6001546040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b15801561066157600080fd5b505afa158015610675573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250602081101561069f57600080fd5b81019080805160405193929190846401000000008211156106bf57600080fd5b838201915060208201858111156106d557600080fd5b82518660018202830111640100000000821117156106f257600080fd5b8083526020830192505050908051906020019080838360005b8381101561072657808201518184015260208101905061070b565b50505050905090810190601f1680156107535780820380516001836020036101000a031916815260200191505b50604052505050905090565b600061076c33848461111f565b905092915050565b60015481565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663bd85b0396001546040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b1580156107f057600080fd5b505afa158015610804573d6000803e3d6000fd5b505050506040513d602081101561081a57600080fd5b8101908080519060200190929190505050905090565b60003373ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16146108715761086f3383610d2a565b505b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663f242432a8585600154866040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1681526020018381526020018281526020018060200182810382526000815260200160200195505050505050600060405180830381600087803b15801561093e57600080fd5b505af192505050801561094f575060015b61097a5761095b611557565b806109665750610970565b600091505061097f565b3d6000803e3d6000fd5b600190505b9392505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633f47e6626001546040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b1580156109fc57600080fd5b505afa158015610a10573d6000803e3d6000fd5b505050506040513d6020811015610a2657600080fd5b8101908080519060200190929190505050905090565b6000610ad73384610ad285600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546113f190919063ffffffff16565b61111f565b506001905092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1662fdd58e836001546040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060206040518083038186803b158015610b7557600080fd5b505afa158015610b89573d6000803e3d6000fd5b505050506040513d6020811015610b9f57600080fd5b81019080805190602001909291905050509050919050565b606060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16634e41a1fb6001546040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b158015610c2c57600080fd5b505afa158015610c40573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052506020811015610c6a57600080fd5b8101908080516040519392919084640100000000821115610c8a57600080fd5b83820191506020820185811115610ca057600080fd5b8251866001820283011164010000000082111715610cbd57600080fd5b8083526020830192505050908051906020019080838360005b83811015610cf1578082015181840152602081019050610cd6565b50505050905090810190601f168015610d1e5780820380516001836020036101000a031916815260200191505b50604052505050905090565b6000610ddf3384610dda8560405180606001604052806028815260200161163060289139600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114799092919063ffffffff16565b61111f565b506001905092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663f242432a3385600154866040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1681526020018381526020018281526020018060200182810382526000815260200160200195505050505050600060405180830381600087803b158015610eba57600080fd5b505af1925050508015610ecb575060015b610ef657610ed7611557565b80610ee25750610eec565b6000915050610efb565b3d6000803e3d6000fd5b600190505b92915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b606060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630e89341c6001546040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b15801561102157600080fd5b505afa158015611035573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250602081101561105f57600080fd5b810190808051604051939291908464010000000082111561107f57600080fd5b8382019150602082018581111561109557600080fd5b82518660018202830111640100000000821117156110b257600080fd5b8083526020830192505050908051906020019080838360005b838110156110e65780820151818401526020810190506110cb565b50505050905090810190601f1680156111135780820380516001836020036101000a031916815260200191505b50604052505050905090565b60008073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614156111a6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806116586024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561122c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061160e6022913960400191505060405180910390fd5b81600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a360008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a22cb4658460008514156040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff168152602001821515815260200192505050600060405180830381600087803b1580156113a957600080fd5b505af19250505080156113ba575060015b6113e5576113c6611557565b806113d157506113db565b60009150506113ea565b3d6000803e3d6000fd5b600190505b9392505050565b60008082840190508381101561146f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b6000838311158290611526576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156114eb5780820151818401526020810190506114d0565b50505050905090810190601f1680156115185780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b6000601f19601f8301169050919050565b60008160e01c9050919050565b600060443d10156115675761160a565b60046000803e61157860005161154a565b6308c379a08114611589575061160a565b60405160043d036004823e80513d602482011167ffffffffffffffff821117156115b55750505061160a565b808201805167ffffffffffffffff8111156115d457505050505061160a565b8060208301013d85018111156115ef5750505050505061160a565b6115f882611539565b60208401016040528296505050505050505b9056fe45524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a20617070726f76652066726f6d20746865207a65726f2061646472657373a2646970667358221220ad5f5ff19d4ad772789969d7b421d952c2762eaac16f49ab3521b26be27cd77364736f6c63430007050033";
