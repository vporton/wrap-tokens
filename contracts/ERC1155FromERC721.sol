//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;
pragma abicoder v2;

import "./IERC1155Views.sol";
import "./IMyERC721.sol";

abstract contract ERC1155FromERC721 is IERC1155Views {
    struct ERC721Token {
        IMyERC721 erc721Contract;
        uint256 erc721TokenId;
    }

    event RegisterToken(ERC721Token erc721token);

    // ERC-1155 token ID => ERC721Token
    mapping(uint256 => ERC721Token) public tokens;

    function registerERC721Token(ERC721Token calldata _erc721token) public {
        uint256 _hash = _tokenHash(_erc721token);
        if (address(tokens[_hash].erc721Contract) == address(0)) {
            tokens[_hash] = _erc721token;
            emit RegisterToken(_erc721token);
        }
    }

    function name(uint256 _id) external view override returns (string memory) {
        return IMyERC721(address(_id)).name();
    }

    function symbol(uint256 _id) external view override returns (string memory) {
        return IMyERC721(address(_id)).symbol();
    }

    function decimals(uint256 /*_id*/) external pure override returns (uint8) {
        return 0;
    }

    // It gives a wrong value for non-registered token, but that doesn't matter.
    function totalSupply(uint256 /*_id*/) external pure override returns (uint256) {
        return 1;
    }

    function _tokenHash(ERC721Token calldata erc721token) internal virtual returns (uint256) {
        return uint256(keccak256(abi.encodePacked(erc721token.erc721Contract, erc721token.erc721TokenId)));
    }
}
