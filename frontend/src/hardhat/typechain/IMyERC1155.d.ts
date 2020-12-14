/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IMyERC1155Interface extends ethers.utils.Interface {
  functions: {
    "balanceOf(address,uint256)": FunctionFragment;
    "balanceOfBatch(address[],uint256[])": FunctionFragment;
    "decimals(uint256)": FunctionFragment;
    "isApprovedForAll(address,address)": FunctionFragment;
    "name(uint256)": FunctionFragment;
    "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)": FunctionFragment;
    "safeTransferFrom(address,address,uint256,uint256,bytes)": FunctionFragment;
    "setApprovalForAll(address,bool)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "symbol(uint256)": FunctionFragment;
    "totalSupply(uint256)": FunctionFragment;
    "uri(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOfBatch",
    values: [string[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "decimals",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isApprovedForAll",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "name", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "safeBatchTransferFrom",
    values: [string, string, BigNumberish[], BigNumberish[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovalForAll",
    values: [string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "symbol",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "uri", values: [BigNumberish]): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isApprovedForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "safeBatchTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setApprovalForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;

  events: {
    "ApprovalForAll(address,address,bool)": EventFragment;
    "TransferBatch(address,address,address,uint256[],uint256[])": EventFragment;
    "TransferSingle(address,address,address,uint256,uint256)": EventFragment;
    "URI(string,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferBatch"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferSingle"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "URI"): EventFragment;
}

export class IMyERC1155 extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IMyERC1155Interface;

  functions: {
    balanceOf(
      account: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    balanceOfBatch(
      accounts: string[],
      ids: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber[];
    }>;

    decimals(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: number;
    }>;

    isApprovedForAll(
      account: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    name(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    safeBatchTransferFrom(
      from: string,
      to: string,
      ids: BigNumberish[],
      amounts: BigNumberish[],
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    symbol(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    totalSupply(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    uri(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;
  };

  balanceOf(
    account: string,
    id: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  balanceOfBatch(
    accounts: string[],
    ids: BigNumberish[],
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  decimals(_id: BigNumberish, overrides?: CallOverrides): Promise<number>;

  isApprovedForAll(
    account: string,
    operator: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  name(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;

  safeBatchTransferFrom(
    from: string,
    to: string,
    ids: BigNumberish[],
    amounts: BigNumberish[],
    data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  safeTransferFrom(
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  symbol(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;

  totalSupply(_id: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  uri(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;

  staticCall: {
    balanceOf(
      account: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOfBatch(
      accounts: string[],
      ids: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    decimals(_id: BigNumberish, overrides?: CallOverrides): Promise<number>;

    isApprovedForAll(
      account: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    name(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;

    safeBatchTransferFrom(
      from: string,
      to: string,
      ids: BigNumberish[],
      amounts: BigNumberish[],
      data: BytesLike,
      overrides?: Overrides
    ): Promise<void>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<void>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    symbol(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;

    totalSupply(
      _id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    uri(_id: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    ApprovalForAll(
      account: string | null,
      operator: string | null,
      approved: null
    ): EventFilter;

    TransferBatch(
      operator: string | null,
      from: string | null,
      to: string | null,
      ids: null,
      values: null
    ): EventFilter;

    TransferSingle(
      operator: string | null,
      from: string | null,
      to: string | null,
      id: null,
      value: null
    ): EventFilter;

    URI(value: null, id: BigNumberish | null): EventFilter;
  };

  estimateGas: {
    balanceOf(account: string, id: BigNumberish): Promise<BigNumber>;
    balanceOfBatch(accounts: string[], ids: BigNumberish[]): Promise<BigNumber>;
    decimals(_id: BigNumberish): Promise<BigNumber>;
    isApprovedForAll(account: string, operator: string): Promise<BigNumber>;
    name(_id: BigNumberish): Promise<BigNumber>;
    safeBatchTransferFrom(
      from: string,
      to: string,
      ids: BigNumberish[],
      amounts: BigNumberish[],
      data: BytesLike
    ): Promise<BigNumber>;
    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      amount: BigNumberish,
      data: BytesLike
    ): Promise<BigNumber>;
    setApprovalForAll(operator: string, approved: boolean): Promise<BigNumber>;
    supportsInterface(interfaceId: BytesLike): Promise<BigNumber>;
    symbol(_id: BigNumberish): Promise<BigNumber>;
    totalSupply(_id: BigNumberish): Promise<BigNumber>;
    uri(_id: BigNumberish): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(account: string, id: BigNumberish): Promise<PopulatedTransaction>;
    balanceOfBatch(
      accounts: string[],
      ids: BigNumberish[]
    ): Promise<PopulatedTransaction>;
    decimals(_id: BigNumberish): Promise<PopulatedTransaction>;
    isApprovedForAll(
      account: string,
      operator: string
    ): Promise<PopulatedTransaction>;
    name(_id: BigNumberish): Promise<PopulatedTransaction>;
    safeBatchTransferFrom(
      from: string,
      to: string,
      ids: BigNumberish[],
      amounts: BigNumberish[],
      data: BytesLike
    ): Promise<PopulatedTransaction>;
    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      amount: BigNumberish,
      data: BytesLike
    ): Promise<PopulatedTransaction>;
    setApprovalForAll(
      operator: string,
      approved: boolean
    ): Promise<PopulatedTransaction>;
    supportsInterface(interfaceId: BytesLike): Promise<PopulatedTransaction>;
    symbol(_id: BigNumberish): Promise<PopulatedTransaction>;
    totalSupply(_id: BigNumberish): Promise<PopulatedTransaction>;
    uri(_id: BigNumberish): Promise<PopulatedTransaction>;
  };
}
