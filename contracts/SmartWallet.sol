//SPDX-License-Identifier: GPL-3.0-or-later
// A simple smart wallet.
// Based on code from https://github.com/argentlabs/argent-contracts/blob/develop/contracts/wallet/BaseWallet.sol
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";

// TODO: Make it upgradeable.
contract SmartWallet is ERC1155Receiver {
    event Invoked(address sender, address target, uint value, bytes data);

    address public owner;

    // solhint-disable func-visibility
    constructor(address _owner) payable {
        owner = _owner;
    }
    // solhint-enable func-visibility

    modifier ownerOnly {
        require(msg.sender == owner, "You are not the owner of the smart wallet");
        _;
    }

    function setOwner(address _owner) public ownerOnly {
        owner = _owner;
    }

    /**
     * @notice Performs a generic transaction.
     * @param _target The address for the transaction.
     * @param _value The value of the transaction.
     * @param _data The data of the transaction.
     */
    // solhint-disable no-unused-vars
    function invoke(address _target, uint _value, bytes calldata _data)
        external ownerOnly returns (bytes memory _result)
    {
        // solhint-disable indent
        // solhint-disable bracket-align
        (bool success, bytes memory result) = _target.call{value: _value}(_data);
        require(success, string(result));
        emit Invoked(msg.sender, _target, _value, _data);
        return result;
    }

    // solhint-disable-next-line state-visibility
    receive() external payable {
    }

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
