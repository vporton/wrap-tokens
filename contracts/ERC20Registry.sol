//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.1;

// FIXME: Use proxy.
// FIXME: Deploy multiple contracts by one call.

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import './ERC20OverERC1155.sol';
import './ERC20LockedERC1155.sol';

contract ERC20Registry {
    mapping (address => mapping (uint256 => ERC20OverERC1155)) private wrappers;
    mapping (address => mapping (uint256 => ERC20LockedERC1155)) private lockers;

    function registerWrapper(IERC1155 _erc1155, uint256 _tokenId) public returns (ERC20OverERC1155 _erc20) {
        _erc20 = wrappers[address(_erc1155)][_tokenId];
        if (address(_erc20) != address(0)) {
            return _erc20;
        }
        _erc20 = new ERC20OverERC1155(IMyERC1155(address(_erc1155)), _tokenId);
        wrappers[address(_erc1155)][_tokenId] = _erc20;
        emit WrapperRegistered(msg.sender, _erc1155, _tokenId, _erc20);
    }

    function registerLocker(IERC1155 _erc1155, uint256 _tokenId) public returns (ERC20LockedERC1155 _erc20) {
        _erc20 = lockers[address(_erc1155)][_tokenId];
        if (address(_erc20) != address(0)) {
            return _erc20;
        }
        _erc20 = new ERC20LockedERC1155(IMyERC1155(address(_erc1155)), _tokenId);
        lockers[address(_erc1155)][_tokenId] = _erc20;
        emit LockerRegistered(msg.sender, _erc1155, _tokenId, _erc20);
    }

    function getWrapper(IERC1155 _erc1155, uint256 _tokenId) public view returns (ERC20OverERC1155) {
        return wrappers[address(_erc1155)][_tokenId];
    }

    function getLocker(IERC1155 _erc1155, uint256 _tokenId) public view returns (ERC20LockedERC1155) {
        return lockers[address(_erc1155)][_tokenId];
    }

    event WrapperRegistered(address sender, IERC1155 indexed erc1155, uint256 indexed tokenId, ERC20OverERC1155 indexed erc20);
    event LockerRegistered(address sender, IERC1155 indexed erc1155, uint256 indexed tokenId, ERC20LockedERC1155 indexed erc20);
}
