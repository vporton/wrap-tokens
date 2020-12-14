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

interface IWalletInterface extends ethers.utils.Interface {
  functions: {
    "authoriseModule(address,bool)": FunctionFragment;
    "authorised(address)": FunctionFragment;
    "enableStaticCall(address,bytes4)": FunctionFragment;
    "enabled(bytes4)": FunctionFragment;
    "modules()": FunctionFragment;
    "owner()": FunctionFragment;
    "setOwner(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "authoriseModule",
    values: [string, boolean]
  ): string;
  encodeFunctionData(functionFragment: "authorised", values: [string]): string;
  encodeFunctionData(
    functionFragment: "enableStaticCall",
    values: [string, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "enabled", values: [BytesLike]): string;
  encodeFunctionData(functionFragment: "modules", values?: void): string;
  encodeFunctionData(functionFragment: "owner", values?: void): string;
  encodeFunctionData(functionFragment: "setOwner", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "authoriseModule",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "authorised", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "enableStaticCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "enabled", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "modules", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;

  events: {};
}

export class IWallet extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IWalletInterface;

  functions: {
    authoriseModule(
      _module: string,
      _value: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    authorised(
      _module: string,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    enableStaticCall(
      _module: string,
      _method: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    enabled(
      _sig: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    modules(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    owner(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    setOwner(
      _newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  authoriseModule(
    _module: string,
    _value: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  authorised(_module: string, overrides?: CallOverrides): Promise<boolean>;

  enableStaticCall(
    _module: string,
    _method: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  enabled(_sig: BytesLike, overrides?: CallOverrides): Promise<string>;

  modules(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  setOwner(
    _newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  staticCall: {
    authoriseModule(
      _module: string,
      _value: boolean,
      overrides?: Overrides
    ): Promise<void>;

    authorised(_module: string, overrides?: CallOverrides): Promise<boolean>;

    enableStaticCall(
      _module: string,
      _method: BytesLike,
      overrides?: Overrides
    ): Promise<void>;

    enabled(_sig: BytesLike, overrides?: CallOverrides): Promise<string>;

    modules(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    setOwner(_newOwner: string, overrides?: Overrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    authoriseModule(_module: string, _value: boolean): Promise<BigNumber>;
    authorised(_module: string): Promise<BigNumber>;
    enableStaticCall(_module: string, _method: BytesLike): Promise<BigNumber>;
    enabled(_sig: BytesLike): Promise<BigNumber>;
    modules(): Promise<BigNumber>;
    owner(): Promise<BigNumber>;
    setOwner(_newOwner: string): Promise<BigNumber>;
  };

  populateTransaction: {
    authoriseModule(
      _module: string,
      _value: boolean
    ): Promise<PopulatedTransaction>;
    authorised(_module: string): Promise<PopulatedTransaction>;
    enableStaticCall(
      _module: string,
      _method: BytesLike
    ): Promise<PopulatedTransaction>;
    enabled(_sig: BytesLike): Promise<PopulatedTransaction>;
    modules(): Promise<PopulatedTransaction>;
    owner(): Promise<PopulatedTransaction>;
    setOwner(_newOwner: string): Promise<PopulatedTransaction>;
  };
}
