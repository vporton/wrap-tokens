//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./IERC1155Views.sol";
import "./IMyERC721.sol";

// This contract has a bug: It does not emit ERC-1155 events.
contract ERC1155OverERC721 is Context, ERC165, IERC1155, IERC1155Views {
    struct ERC721Token {
        IMyERC721 erc721Contract;
        uint256 erc721TokenId;
    }

    event RegisterToken(ERC721Token erc721token);

    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    /*
     *     bytes4(keccak256('totalSupply(uint256)')) == 0xbd85b039
     *     bytes4(keccak256('name(uint256)')) == 0x00ad800c
     *     bytes4(keccak256('symbol(uint256)')) == 0x4e41a1fb
     *     bytes4(keccak256('decimals(uint256)')) == 0x3f47e662
     *     bytes4(keccak256('uri(uint256)')) == 0x0e89341c
     *
     *     => 0xbd85b039 ^ 0x00ad800c ^ 0x4e41a1fb ^ 0x3f47e662 ^ 0x0e89341c == 0xc2a743b0
     */
    bytes4 private constant _INTERFACE_ID_ERC1155_VIEWS = 0xc2a743b0;

    // ERC-1155 token ID => ERC721Token
    mapping(uint256 => ERC721Token) public tokens;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    string internal _uri;

    // solhint-disable func-visibility
    constructor(string memory uri_) {
        _setURI(uri_);

        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155);

        // register the supported interfaces to conform to ERC1155Views via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155_VIEWS);
    }
    // solhint-enable func-visibility

    function registerERC721Token(ERC721Token calldata _erc721token) public {
        uint256 _hash = _tokenHash(_erc721token);
        if (address(tokens[_hash].erc721Contract) == address(0)) {
            tokens[_hash] = _erc721token;
            emit RegisterToken(_erc721token);
        }
    }

    // It gives a wrong value for non-registered token, but that doesn't matter.
    function totalSupply(uint256 /*_id*/) external pure override returns (uint256) {
        return 1;
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

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        ERC721Token memory _token = tokens[id];
        IMyERC721 _erc721Contract = _token.erc721Contract;
        uint256 _erc721TokenId = _token.erc721TokenId;
        return _erc721Contract.ownerOf(_erc721TokenId) == account ? 1 : 0;
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    )
        public view override returns (uint256[] memory batchBalances)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        batchBalances = new uint256[](accounts.length);

        for (uint i = 0; i < ids.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
    }

    /// This contract needs first be approved for the ERC-20 transfers (the recommended approval sum is ~uint256(0)).
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public virtual override
    {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(from == msg.sender || _operatorApprovals[from][msg.sender], "ERC1155: caller is not owner nor approved");
        _doTransferFrom(from, to, id, amount, data);
    }        

    /// This contract needs first be approved for the ERC-20 transfers (the recommended approval sum is ~uint256(0)).
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data) public virtual override
    {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(from == msg.sender || _operatorApprovals[from][msg.sender], "ERC1155: caller is not owner nor approved");

        for (uint i = 0; i < ids.length; ++i) {
            _doTransferFrom(from, to, ids[i], amounts[i], data);
        }
    }

    function isApprovedForAll(address account, address operator) external view override returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function setApprovalForAll(address operator, bool approved) external override {
        require(_msgSender() != operator, "ERC1155: setting approval status for self");

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function uri(uint256 /*_id*/) external view override returns (string memory) {
        return _uri; // We intentionally don't use `erc721.tokenURI()`.
    }

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function _doTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data) internal virtual 
    {
        if (amount != 0) {
            require(amount == 1, "No more than 1.");
            ERC721Token memory _token = tokens[id];
            IMyERC721 _erc721Contract = _token.erc721Contract;
            uint256 _erc721TokenId = _token.erc721TokenId;
            _erc721Contract.safeTransferFrom(from, to, _erc721TokenId, data);
        }
    }

    function _tokenHash(ERC721Token memory erc721token) internal virtual returns (uint256) {
        return uint256(keccak256(abi.encodePacked(erc721token.erc721Contract, erc721token.erc721TokenId)));
    }
}
