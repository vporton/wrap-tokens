//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./IERC1155Views.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol";
import "./ERC20NoSymbol.sol";
import "./IMyERC20.sol";

interface IMyERC1155 is IERC1155, IERC1155Views { }

contract ERC20LockedERC1155 is ERC20NoSymbol, ERC1155Receiver, IMyERC20 {
    IMyERC1155 public erc1155;
    uint256 public tokenId;

    // solhint-disable func-visibility
    constructor(IMyERC1155 _erc1155, uint256 _tokenId)
    {
        erc1155 = _erc1155;
        tokenId = _tokenId;
    }
    // solhint-enable func-visibility

    /// Before calling this need to approve the ERC-1155 contract.
    function borrowERC1155(uint256 _amount, address _from, address _to, bytes calldata _data) public {
        erc1155.safeTransferFrom(_from, address(this), tokenId, _amount, _data);
        _mint(_to, _amount);
        emit BorrowedERC1155(msg.sender, _amount, _from, _to, _data);
    }

    function returnToERC1155(uint256 _amount, address _to, bytes calldata _data) public {
        erc1155.safeTransferFrom(address(this), _to, tokenId, _amount, _data);
        _burn(msg.sender, _amount);
        emit ReturnedToERC1155(_amount, msg.sender, _to, _data);
    }

    function name() public view override returns (string memory) {
        return erc1155.name(tokenId);
    }

    function symbol() public view override returns (string memory) {
        return erc1155.symbol(tokenId);
    }

    function uri() public view override returns (string memory) {
        return erc1155.uri(tokenId);
    }

    function decimals() public view override(ERC20NoSymbol, IMyERC20) returns (uint8) {
        return erc1155.decimals(tokenId);
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

    event BorrowedERC1155(address sender, uint256 amount, address from, address to, bytes data);

    event ReturnedToERC1155(uint256 amount, address from, address to, bytes data);
}
