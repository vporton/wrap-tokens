//SPDX-License-Identifier: Apache-2.0	
pragma solidity ^0.7.1;

import "argent-contracts/contracts/wallet/BaseWallet.sol";
import "./ERC1155OverERC20.sol";

contract SmartWalletWithERC1155OverERC20 is BaseWallet, ERC1155OverERC20 {
    constructor (string memory uri_) ERC1155OverERC20(uri_) { }
}
