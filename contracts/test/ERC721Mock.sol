// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.1;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ERC721Mock
 * This mock just allows minting for testing purposes
 */
contract ERC721Mock is ERC721 {
    constructor () ERC721("Something nonfungible", "NFT") { }

    function mint(address to, uint256 id) public {
        _safeMint(to, id);
    }
}
