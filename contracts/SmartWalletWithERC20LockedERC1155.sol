//SPDX-License-Identifier: Apache-2.0	
pragma solidity ^0.7.1;

import "argent-contracts/contracts/wallet/BaseWallet.sol";
import "./ERC20LockedERC1155.sol";

contract SmartWalletWithERC1155LockedERC20 is BaseWallet, ERC20LockedERC1155 {
    constructor(IMyERC1155 _erc1155, uint256 _tokenId) ERC20LockedERC1155(_erc1155, _tokenId) { }
}
