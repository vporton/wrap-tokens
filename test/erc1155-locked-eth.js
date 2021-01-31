const chai = require("chai");
const { expect } = chai;
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

const tokenId = 0;

describe("ERC1155LockedETH", function() {
  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const erc1155LockedERC20 = await ethers.getContractFactory("ERC1155LockedETH");
    this.wrapper = await erc1155LockedERC20.deploy("https://example.com");
    await this.wrapper.deployed();

    this.wrapper.connect(this.user3).borrowETH(this.user1.address, [], {value: parseEther("10")});
    // expect(await provider.getBalance(this.user1.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("10"));
  });

  it("ETH locked in ERC1155", async function() {
    await this.wrapper.connect(this.user1).safeTransferFrom(this.user1.address, this.user2.address, tokenId, parseEther("3"), []);
    expect(await this.wrapper.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("7"));
    expect(await this.wrapper.balanceOf(this.user2.address, tokenId)).to.equal(parseEther("3"));

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeTransferFrom(self.user1.address, self.user2.address, tokenId, parseEther("1"), []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user3).safeTransferFrom(this.user1.address, this.user2.address, tokenId, parseEther("1"), []);
    // expect(await provider.getBalance(this.user1.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("6"));
    // expect(await provider.getBalance(this.user2.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user2.address, tokenId)).to.equal(parseEther("4"));

    this.wrapper.connect(this.user1).returnToETH(parseEther("6"), this.user3.address);
    // expect(await provider.getBalance(this.user3.address)).to.equal(parseEther("6"));
  });

  it("ETH locked in ERC155 (batch transfers)", async function() {
    await this.wrapper.connect(this.user1).safeBatchTransferFrom(this.user1.address, this.user2.address, [tokenId], [parseEther("3")], []);
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [tokenId, tokenId])).to.deep.equal([parseEther("7"), parseEther("7")]);
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [tokenId, tokenId])).to.deep.equal([parseEther("3"), parseEther("3")]);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user3.address, [tokenId, tokenId], [parseEther("1"), parseEther("1")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(false);
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(true);
    await this.wrapper.connect(this.user3).safeBatchTransferFrom(this.user1.address, this.user3.address, [tokenId], [parseEther("1")], []);
    // expect(await provider.getBalance(this.user1.address)).to.equal(parseEther("0"));
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [tokenId, tokenId])).to.deep.equal([parseEther("6"), parseEther("6")]);
    // expect(await provider.getBalance(this.user3.address)).to.equal(parseEther("0"));
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user3.address, this.user3.address], [tokenId, tokenId])).to.deep.equal([parseEther("1"), parseEther("1")]);

    this.wrapper.connect(this.user1).returnToETH(parseEther("6"), this.user3.address);
    // expect(await provider.getBalance(this.user3.address)).to.equal(parseEther("6"));
  });

  it("length mismatch", async function() {
    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [tokenId, tokenId], [parseEther("1")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: ids and amounts length mismatch");
    }
  });

  it("metadata", async function() {
    expect(await this.wrapper.name(tokenId)).to.equal("Wrapped Ether");
    expect(await this.wrapper.symbol(tokenId)).to.equal("ETH1155");
    expect(await this.wrapper.decimals(tokenId)).to.equal(18);
    expect(await this.wrapper.uri(tokenId)).to.equal("https://example.com");
  });
});
