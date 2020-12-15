//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "argent-contracts/contracts/wallet/BaseWallet.sol";
import "./ERC1155LockedERC20.sol";
import "./ERC1155Holder.sol";

contract SmartWalletWithERC1155LockedERC20 is BaseWallet, ERC1155LockedERC20, ERC1155Holder {
    constructor (string memory uri_) ERC1155LockedERC20(uri_) { }
}
