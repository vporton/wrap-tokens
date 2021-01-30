//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./IERC1155Views.sol";
import "./IMyERC721.sol";

contract ERC1155LockedERC721 is ERC1155, IERC1155Views {
    struct ERC721Token {
        IMyERC721 erc721Contract;
        uint256 erc721TokenId;
    }

    event RegisterToken(ERC721Token erc721token);

    // solhint-disable func-visibility
    constructor (string memory uri_) ERC1155(uri_) {
    }
    // solhint-enable func-visibility

    function borrowERC721(ERC721Token calldata _erc721Token, address _from, address _to, bytes calldata _data) public {
        uint256 _erc1155TokenId = _tokenHash(_erc721Token);
        _mint(_to, _erc1155TokenId, 1, _data);
        _erc721Token.erc721Contract.transferFrom(_from, address(this), _erc721Token.erc721TokenId);
        emit BorrowedERC721(_erc721Token, msg.sender, _from, _to, _data);
    }

    function returnToERC721(ERC721Token calldata _erc721Token, address _to) public {
        uint256 _erc1155TokenId = _tokenHash(_erc721Token);
        _burn(msg.sender, _erc1155TokenId, 1);
        _erc721Token.erc721Contract.transferFrom(address(this), _to, _erc721Token.erc721TokenId);
        emit ReturnedToERC721(_erc721Token, msg.sender, _to);
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

    function uri(uint256 /*_id*/) external view override(ERC1155, IERC1155Views) returns (string memory) {
        return _uri; // We intentionally don't use `erc721.tokenURI()`.
    }

    event BorrowedERC721(ERC721Token erc721token, address sender, address from, address to, bytes data);

    event ReturnedToERC721(ERC721Token erc721token, address from, address to);

    function _tokenHash(ERC721Token calldata erc721token) internal virtual returns (uint256) {
        return uint256(keccak256(abi.encode(erc721token)));
    }
}
