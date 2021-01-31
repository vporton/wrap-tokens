//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";
import './ERC20FromERC1155.sol';
import "./ERC20NoSymbol.sol";

// FIXME: Redeploy
contract ERC20LockedERC1155 is ERC20FromERC1155, ERC20NoSymbol, ERC1155Receiver {
    /// Before calling this need to approve the ERC-1155 contract.
    function borrowERC1155(uint256 _amount, address _from, address _to, bytes calldata _data) public {
        _mint(_to, _amount);
        erc1155.safeTransferFrom(_from, address(this), tokenId, _amount, _data);
        emit BorrowedERC1155(msg.sender, _amount, _from, _to, _data);
    }

    function returnToERC1155(uint256 _amount, address _to, bytes calldata _data) public {
        _burn(msg.sender, _amount);
        erc1155.safeTransferFrom(address(this), _to, tokenId, _amount, _data);
        emit ReturnedToERC1155(_amount, msg.sender, _to, _data);
    }

    function onERC1155Received(
        address /*_operator*/,
        address /*_from*/,
        uint256 /*_id*/,
        uint256 /*_value*/,
        bytes calldata /*_data*/) public pure override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address /*_operator*/,
        address /*_from*/,
        uint256[] calldata /*_ids*/,
        uint256[] calldata /*_values*/,
        bytes calldata /*_data*/) public pure override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }

    function decimals() public view override(ERC20FromERC1155, ERC20NoSymbol) returns(uint8) {
        return ERC20FromERC1155.decimals();
    }

    event BorrowedERC1155(address sender, uint256 amount, address from, address to, bytes data);

    event ReturnedToERC1155(uint256 amount, address from, address to, bytes data);
}
