//SPDX-License-Identifier: GPL-3.0-or-later
// A simple smart wallet.
// Based on code from https://github.com/argentlabs/argent-contracts/blob/develop/contracts/wallet/BaseWallet.sol
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";

contract ERC1155Holder is ERC1155Receiver {
    function onERC1155Received(
        address /*_operator*/,
        address /*_from*/,
        uint256 /*_id*/,
        uint256 /*_value*/,
        bytes calldata /*_data*/) external pure override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address /*_operator*/,
        address /*_from*/,
        uint256[] calldata /*_ids*/,
        uint256[] calldata /*_values*/,
        bytes calldata /*_data*/) external pure override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }
}
