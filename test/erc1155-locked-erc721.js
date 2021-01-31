const chai = require("chai");
const { expect } = chai;
const { BigNumber } = ethers;
const { compositeTokenHash } = require('../lib/tokens-ethers.js');
const { parseEther } = ethers.utils;

chai.use(require('chai-as-promised'))

// TODO: Duplicate code.
const expectThrowsAsync = async (method, errorMessage) => {
  let error = null
  try {
    await method()
  }
  catch (err) {
    error = err
  }
  expect(error).to.be.an('Error')
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage)
  }
}

// TODO: Improve this test.
describe("ERC1155LockedERC721", function() {
  const erc721TokenId1 = 123;
  const erc721TokenId2 = 456;
  let erc1155TokenId1;
  let erc1155TokenId2;

  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3, this.user4] = await ethers.getSigners();

    const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
    this.erc721Mock1 = await ERC721Mock.deploy();
    await this.erc721Mock1.deployed();
    this.erc721Mock1.mint(this.user1.address, erc721TokenId1);
    this.erc721Mock2 = await ERC721Mock.deploy();
    await this.erc721Mock2.deployed();
    this.erc721Mock2.mint(this.user1.address, erc721TokenId2);
    
    const erc1155LockedERC721 = await ethers.getContractFactory("ERC1155LockedERC721");
    this.wrapper = await erc1155LockedERC721.deploy("https://example.com");
    await this.wrapper.deployed();

    // Some of the following approvals may be superfluous. It does not matter.
    await this.erc721Mock1.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
    await this.erc721Mock1.connect(this.user2).setApprovalForAll(this.wrapper.address, true);
    await this.erc721Mock1.connect(this.user3).setApprovalForAll(this.wrapper.address, true);
    await this.erc721Mock2.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
    await this.erc721Mock2.connect(this.user2).setApprovalForAll(this.wrapper.address, true);
    await this.erc721Mock2.connect(this.user3).setApprovalForAll(this.wrapper.address, true);

    const self = this;
    async function registerToken(erc721Contract, erc721TokenId) {
      const abi = [ "event RegisterToken((address contractAddress,uint256 tokenId))" ];
      const iface = new ethers.utils.Interface(abi);
      const tx = await self.wrapper.connect(self.user1).registerERC721Token({
        erc721Contract,
        erc721TokenId,
      });
      const response = await ethers.provider.getTransactionReceipt(tx.hash);
      const logs = iface.parseLog(response.logs[0]);
      return [logs.args[0].contractAddress, logs.args[0].tokenId];
    }
    // TODO: Also check that ERC-721 tokens with the same contract or token ID don't glitch
    // TODO: Try to register twice.
    const token1 = await registerToken(this.erc721Mock1.address, erc721TokenId1);
    erc1155TokenId1 = compositeTokenHash(...token1);
    const token2 = await registerToken(this.erc721Mock2.address, erc721TokenId2);
    erc1155TokenId2 = compositeTokenHash(...token2);

    await this.erc721Mock1.connect(this.user3).setApprovalForAll(this.wrapper.address, true);
    await this.wrapper.connect(this.user3).borrowERC721(
      {erc721Contract: this.erc721Mock1.address, erc721TokenId: erc721TokenId1}, this.user1.address, this.user2.address, []
    );
    await this.erc721Mock2.connect(this.user3).setApprovalForAll(this.wrapper.address, true);
    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(0);
    expect(await this.wrapper.balanceOf(this.user2.address, erc1155TokenId1)).to.equal(1);
    expect(await this.erc721Mock2.balanceOf(this.user3.address)).to.equal(0);
    expect(await this.wrapper.balanceOf(this.user2.address, erc1155TokenId2)).to.equal(0);
  });

  it("ERC721 locked in ERC155", async function() {
    await this.wrapper.connect(this.user2).setApprovalForAll(this.user1.address, true);
    await this.wrapper.connect(this.user1).safeTransferFrom(this.user2.address, this.user1.address, erc1155TokenId1, 1, []);
    expect(await this.wrapper.balanceOf(this.user1.address, erc1155TokenId1)).to.equal(1);
    expect(await this.wrapper.balanceOf(this.user2.address, erc1155TokenId1)).to.equal(0);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeTransferFrom(self.user1.address, self.user2.address, self.erc721Mock1.address, parseEther("100"), []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
    await this.wrapper.connect(this.user3).safeTransferFrom(this.user1.address, this.user2.address, erc1155TokenId1, 1, []);
    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(0);
    expect(await this.wrapper.balanceOf(this.user1.address, erc1155TokenId1)).to.equal(0);
    expect(await this.erc721Mock1.balanceOf(this.user2.address)).to.equal(0);
    expect(await this.wrapper.balanceOf(this.user2.address, erc1155TokenId1)).to.equal(1);

    this.wrapper.connect(this.user2).returnToERC721({erc721Contract: this.erc721Mock1.address, erc721TokenId: erc721TokenId1}, this.user3.address);
    expect(await this.erc721Mock1.balanceOf(this.user3.address)).to.equal(1);
  });

  it("length mismatch", async function() {
    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [erc1155TokenId1, erc1155TokenId2], [], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: ids and amounts length mismatch");
    }
  });

  it("metadata", async function() {
    expect(await this.wrapper.name(this.erc721Mock1.address)).to.equal("Something nonfungible");
    expect(await this.wrapper.symbol(this.erc721Mock1.address)).to.equal("NFT");
    expect(await this.wrapper.decimals(this.erc721Mock1.address)).to.equal(0);
    expect(await this.wrapper.uri(this.erc721Mock1.address)).to.equal("https://example.com");
  });
});
