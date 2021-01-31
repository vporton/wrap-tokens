//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "./IMyERC20.sol";
import "./IMyERC1155.sol";

abstract contract ERC20FromERC1155 is IMyERC20 {
    IMyERC1155 public erc1155;
    uint256 public tokenId;

    function initialize(IMyERC1155 _erc1155, uint256 _tokenId) public {
        require(address(erc1155) == address(0), "already initialized");
        erc1155 = _erc1155;
        tokenId = _tokenId;
    }

    function name() public view virtual override returns(string memory) {
        return erc1155.name(tokenId);
    }

    function symbol() public view virtual override returns(string memory) {
        return erc1155.symbol(tokenId);
    }

    function uri() public view virtual override returns(string memory) {
        return erc1155.uri(tokenId);
    }

    function decimals() public view virtual override returns(uint8) {
        return erc1155.decimals(tokenId);
    }
}
