//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "argent-contracts/contracts/wallet/BaseWallet.sol";
import "./ERC20LockedERC1155.sol";
// import "./ERC1155Holder.sol";

contract SmartWalletWithERC20LockedERC1155 is BaseWallet, ERC20LockedERC1155/*, ERC1155Holder*/ {
}
