//SPDX-License-Identifier: Apache-2.0	
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./IERC1155Views.sol";

// TODO: Duplicate code
interface IMyERC20 is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function uri() external view returns (string memory);
}

contract ERC1155LockedERC20 is ERC1155, IERC1155Views {
    // solhint-disable func-visibility
    constructor (string memory uri_) ERC1155(uri_) {
    }
    // solhint-enable func-visibility

    function borrowERC20(IMyERC20 erc20, uint256 _amount, address _from, address _to, bytes calldata data) public {
        require(erc20.transferFrom(_from, address(this), _amount), "Cannot transfer.");
        _mint(_to, uint256(address(erc20)), _amount, data);
    }

    function returnToERC20(IMyERC20 erc20, uint256 _amount, address _to) public {
        require(erc20.transfer(_to, _amount), "Cannot transfer.");
        _burn(_to, uint256(address(erc20)), _amount);
    }

    function totalSupply(uint256 _id) external view override returns (uint256) {
        return IMyERC20(address(_id)).totalSupply();
    }

    function name(uint256 _id) external view override returns (string memory) {
        return IMyERC20(address(_id)).name();
    }

    function symbol(uint256 _id) external view override returns (string memory) {
        return IMyERC20(address(_id)).symbol();
    }

    function decimals(uint256 _id) external view override returns (uint8) {
        return IMyERC20(address(_id)).decimals();
    }

    function uri(uint256 /*_id*/) external view override(ERC1155, IERC1155Views) returns (string memory) {
        return _uri;
    }
}
