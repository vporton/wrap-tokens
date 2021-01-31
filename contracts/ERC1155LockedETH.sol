//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./IERC1155Views.sol";

// TODO: Redeploy.
contract ERC1155LockedETH is ERC1155 {
    uint256 constant tokenId = 0;

    // solhint-disable func-visibility
    constructor (string memory uri_) ERC1155(uri_) {
    }
    // solhint-enable func-visibility

    function borrowETH(address _to, bytes calldata _data) public payable {
        _mint(_to, tokenId, msg.value, _data);
        emit BorrowedETH(msg.sender, msg.value, _to, _data);
    }

    function returnToETH(uint256 _amount, address payable _to) public {
        _to.transfer(_amount);
        _burn(msg.sender, tokenId, _amount);
        emit ReturnedToETH(_amount, msg.sender, _to);
    }

    function name(uint256 _id) external pure ourTokenId(_id) returns (string memory) {
        return "Wrapped Ether";
    }

    function symbol(uint256 _id) external pure ourTokenId(_id) returns (string memory) {
        return "ETH1155";
    }

    function decimals(uint256 _id) external pure ourTokenId(_id) returns (uint8) {
        return 18;
    }

    function uri(uint256 _id) external view override ourTokenId(_id) returns (string memory) {
        return _uri;
    }

    modifier ourTokenId(uint256 _id) {
        require(_id == tokenId, "undefined token ID");
        _;
    }

    event BorrowedETH(address sender, uint256 amount, address to, bytes data);

    event ReturnedToETH(uint256 amount, address from, address to);
}
