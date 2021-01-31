const chai = require("chai");
const { compositeTokenHash } = require('../lib/tokens-ethers.js');
const { expect } = chai;

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

describe("ERC1155OverERC721", function() {
  const erc721TokenId1 = 123;
  const erc721TokenId2 = 456;
  let erc1155TokenId1;
  let erc1155TokenId2;

  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
    this.erc721Mock1 = await ERC721Mock.deploy();
    await this.erc721Mock1.deployed();
    this.erc721Mock1.mint(this.user1.address, erc721TokenId1);
    this.erc721Mock2 = await ERC721Mock.deploy();
    await this.erc721Mock2.deployed();
    this.erc721Mock2.mint(this.user1.address, erc721TokenId2);
    
    const ERC1155OverERC721 = await ethers.getContractFactory("ERC1155OverERC721");
    this.wrapper = await ERC1155OverERC721.deploy("https://example.com");
    await this.wrapper.deployed();

    await this.erc721Mock1.connect(this.user1).approve(this.wrapper.address, erc721TokenId1);
    await this.erc721Mock2.connect(this.user1).approve(this.wrapper.address, erc721TokenId2);

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
  });

  // TODO: Check also transferring zero or failure to transfer >1 tokens.
  it("ERC721 over ERC20", async function() {
    await this.wrapper.connect(this.user1).safeTransferFrom(
      this.user1.address,
      this.user2.address,
      erc1155TokenId1,
      1,
      []
    );
    return;

    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc721Mock1.address)).to.equal(1);
    expect(await this.erc721Mock1.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc721Mock1.address)).to.equal(1);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [self.erc721Mock1.address, self.erc721Mock2.address], [1, 1], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(false);
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(true);
    await this.wrapper.connect(this.user3).safeTransferFrom(this.user1.address, this.user2.address, this.erc721Mock1.address, 1, []);
    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc721Mock1.address)).to.equal(1);
    expect(await this.erc721Mock1.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc721Mock1.address)).to.equal(1);
  });
  return;

  it("ERC1155 over ERC20 (batch transfers)", async function() {
    await this.wrapper.connect(this.user1).safeBatchTransferFrom(
      this.user1.address,
      this.user2.address,
      [this.erc721Mock1.address, this.erc721Mock2.address],
      [1, 1],
      []
    );

    // TODO: Heterogeneous arrays in balanceOfBatch

    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.erc721Mock2.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc721Mock1.address, this.erc721Mock2.address])).to.deep.equal([1, 1]);
    expect(await this.erc721Mock1.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.erc721Mock2.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [this.erc721Mock1.address, this.erc721Mock2.address])).to.deep.equal([1, 1]);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [self.erc721Mock1.address, self.erc721Mock2.address], [1], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: ids and amounts length mismatch");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user3).safeBatchTransferFrom(this.user1.address, this.user2.address, [this.erc721Mock1.address, this.erc721Mock2.address], [1, 1], []);
    expect(await this.erc721Mock1.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.erc721Mock2.balanceOf(this.user1.address)).to.equal(1);
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc721Mock1.address, this.erc721Mock2.address])).to.deep.equal([1, 1]);
    expect(await this.erc721Mock1.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.erc721Mock2.balanceOf(this.user2.address)).to.equal(1);
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [this.erc721Mock1.address, this.erc721Mock2.address])).to.deep.equal([1, 1]);
  });

  it("metadata", async function() {
    expect(await this.wrapper.name(this.erc721Mock1.address)).to.equal("Something nonfungible");
    expect(await this.wrapper.symbol(this.erc721Mock1.address)).to.equal("NFT");
    expect(await this.wrapper.decimals(this.erc721Mock1.address)).to.equal(0);
    expect(await this.wrapper.uri(this.erc721Mock1.address)).to.equal("https://example.com");
  });
});
