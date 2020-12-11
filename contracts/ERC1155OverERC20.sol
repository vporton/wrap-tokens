//SPDX-License-Identifier: Apache-2.0	
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./IERC1155Views.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

// TODO: Duplicate code
interface IMyERC20 is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function uri() external view returns (string memory);
}

// TODO: Test it.
// This contract has a bug: It does not emit ERC-1155 events.
contract ERC1155OverERC20 is Context, ERC165, IERC1155, IERC1155Views {
    // using SafeMath for uint256;

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

    // Mapping from account to operator approvals
    mapping (address => mapping(address => bool)) private _operatorApprovals;

    string internal _uri;

    // solhint-disable func-visibility
    constructor (string memory uri_) {
        _setURI(uri_);

        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155);

        // register the supported interfaces to conform to ERC1155Views via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155_VIEWS);
    }
    // solhint-enable func-visibility

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

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        return IMyERC20(id).balanceOf(account);
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    )
        public
        view
        override
        returns (uint256[] memory)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint i = 0; i < ids.length; ++i) {
            batchBalances[i] = IMyERC20(ids[i]).balanceOf(accounts[i]);
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory /*data*/
    )
        public
        virtual
        override
    {
        require(to != address(0), "ERC1155: transfer to the zero address");
        if(_operatorApprovals[from][msg.sender]) {
            IMyERC20(id).approve(from, ~uint256(0));
        }
        require(IMyERC20(id).transferFrom(msg.sender, to, amount));
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        public
        virtual
        override
    {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");

        for (uint i = 0; i < ids.length; ++i) {
            if(_operatorApprovals[from][msg.sender]) {
                IMyERC20(ids[i]).approve(from, ~uint256(0));
            }
            safeTransferFrom(from, to, ids[i], amounts[i], data);
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
        return _uri;
    }

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }
}
