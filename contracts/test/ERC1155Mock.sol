// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.1;

import { ERC1155 } from "../ERC1155.sol";
import "../IERC1155Views.sol";

/**
 * @title ERC1155Mock
 * This mock just allows minting for testing purposes
 */
contract ERC1155Mock is ERC1155, IERC1155Views {
    constructor () ERC1155("https://example.com") { }

    function mint(address to, uint256 id, uint256 value, bytes memory data) public {
        _mint(to, id, value, data);
    }

    function totalSupply(uint256 /*_id*/) external pure override returns (uint256) {
        return 1000000; // wrong but does not matter for testing
    }

    function name(uint256 /*_id*/) external pure override returns (string memory) {
        return "Test coin";
    }

    function symbol(uint256 /*_id*/) external pure override returns (string memory) {
        return "MCK";
    }

    function decimals(uint256 /*_id*/) external pure override returns (uint8) {
        return 18;
    }

    function uri(uint256 /*_id*/) external pure override(ERC1155, IERC1155Views) returns (string memory) {
        return "https://example.com";
    }
}
