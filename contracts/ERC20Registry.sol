//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.1;

// FIXME: Deploy multiple contracts by one call.

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import './ERC20OverERC1155.sol';
import './ERC20LockedERC1155.sol';

contract ERC20Registry {
    IMyERC1155 public erc20OverErc1155;
    IMyERC1155 public erc20LockedErc1155;

    mapping (address => mapping (uint256 => ERC20OverERC1155)) private wrappers;
    mapping (address => mapping (uint256 => ERC20LockedERC1155)) private lockers;

    constructor(IMyERC1155 _erc20OverErc1155, IMyERC1155 _erc20LockedErc1155) {
        erc20OverErc1155 = _erc20OverErc1155;
        erc20LockedErc1155 = _erc20LockedErc1155;
    }

    function deployMinimal(address _logic) public returns (address proxy) {
        // Adapted from https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
        bytes20 targetBytes = bytes20(_logic);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            proxy := create(0, clone, 0x37)
        }
    }

    function registerWrapper(IERC1155 _erc1155, uint256 _tokenId) public returns (ERC20OverERC1155 _erc20) {
        _erc20 = wrappers[address(_erc1155)][_tokenId];
        if (address(_erc20) == address(0)) {
            _erc20 = ERC20OverERC1155(deployMinimal(address(erc20OverErc1155)));
            _erc20.initialize(IMyERC1155(address(_erc1155)), _tokenId);
            wrappers[address(_erc1155)][_tokenId] = _erc20;
            emit WrapperRegistered(msg.sender, _erc1155, _tokenId, _erc20);
        }
    }

    function registerLocker(IERC1155 _erc1155, uint256 _tokenId) public returns (ERC20LockedERC1155 _erc20) {
        _erc20 = lockers[address(_erc1155)][_tokenId];
        if (address(_erc20) == address(0)) {
            _erc20 = ERC20LockedERC1155(deployMinimal(address(erc20LockedErc1155)));
            _erc20.initialize(IMyERC1155(address(_erc1155)), _tokenId);
            lockers[address(_erc1155)][_tokenId] = _erc20;
            emit LockerRegistered(msg.sender, _erc1155, _tokenId, _erc20);
        }
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
