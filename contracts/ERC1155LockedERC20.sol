//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./ERC1155FromERC20.sol";

// FIXME: Redeploy this contract.
contract ERC1155LockedERC20 is ERC1155FromERC20, ERC1155 {
    // solhint-disable func-visibility
    constructor (string memory uri_) ERC1155(uri_) {
    }
    // solhint-enable func-visibility

    function borrowERC20(IMyERC20 erc20, uint256 _amount, address _from, address _to, bytes calldata _data) public {
        _mint(_to, uint256(address(erc20)), _amount, _data);
        require(erc20.transferFrom(_from, address(this), _amount), "Cannot transfer.");
        emit BorrowedERC20(erc20, msg.sender, _amount, _from, _to, _data);
    }

    function returnToERC20(IMyERC20 erc20, uint256 _amount, address _to) public {
        _burn(msg.sender, uint256(address(erc20)), _amount);
        require(erc20.transfer(_to, _amount), "Cannot transfer.");
        emit ReturnedToERC20(erc20, _amount, msg.sender, _to);
    }

    // FIXME: Test.
    function totalSupply(uint256 _id) public view override returns (uint256) {
        return IMyERC20(address(_id)).balanceOf(address(this));
    }

    function uri(uint256 /*_id*/) external view override(ERC1155, IERC1155Views) returns (string memory) {
        return _uri;
    }

    event BorrowedERC20(IMyERC20 erc20, address sender, uint256 amount, address from, address to, bytes data);

    event ReturnedToERC20(IMyERC20 erc20, uint256 amount, address from, address to);
}
