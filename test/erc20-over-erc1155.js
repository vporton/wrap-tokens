const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

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

describe("ERC20OverERC1155", function() {
  const tokenId = 124;

  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
    this.erc1155Mock = await ERC1155Mock.deploy("https://example.com");
    await this.erc1155Mock.deployed();
    this.erc1155Mock.mint(this.user1.address, tokenId, parseEther("1000"), []);
    
    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20OverERC1155");
    this.wrapper = await ERC20OverERC1155.deploy(this.erc1155Mock.address, tokenId);
    await this.wrapper.deployed();

    await this.erc1155Mock.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
  });

  it("ERC20 over ERC1155", async function() {
    await this.wrapper.connect(this.user1).transfer(this.user2.address, parseEther("300"));
    expect(await this.erc1155Mock.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("700"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("700"));
    expect(await this.erc1155Mock.balanceOf(this.user2.address, tokenId)).to.equal(parseEther("300"));
    expect(await this.wrapper.balanceOf(this.user2.address)).to.equal(parseEther("300"));

    await this.wrapper.connect(this.user1).transferFrom(this.user1.address, this.user2.address, parseEther("100"));
    expect(await this.erc1155Mock.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("600"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("600"));
    expect(await this.erc1155Mock.balanceOf(this.user2.address, tokenId)).to.equal(parseEther("400"));
    expect(await this.wrapper.balanceOf(this.user2.address)).to.equal(parseEther("400"));

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user2).transferFrom(self.user3.address, self.user2.address, parseEther("10"));
      }
      // TODO: The error message is different here.
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC20: decreased allowance below zero");
    }
  });

  // TODO: Check that can't transfer for other users without their approval.
});
