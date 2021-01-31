const { expect } = require("chai");
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
    this.erc1155Mock = await ERC1155Mock.deploy();
    await this.erc1155Mock.deployed();
    this.erc1155Mock.mint(this.user1.address, tokenId, parseEther("1000"), []);
    
    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20OverERC1155");
    this.wrapper = await ERC20OverERC1155.deploy();
    await this.wrapper.deployed();
    await this.wrapper.initialize(this.erc1155Mock.address, tokenId);

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

    it("increase/decrease allowance", async function() {
      await this.wrapper.connect(this.user1).approve(this.user3.address, parseEther("300"));
      const self = this;
      {
        async function fails() {
          await self.wrapper.connect(self.user3).transferFrom(self.user1.address, self.user2.address, parseEther("400"));
        }
        await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance");
      }
      await this.wrapper.connect(this.user1).approve(this.user3.address, parseEther("600"));
      await this.wrapper.connect(this.user3).transferFrom(this.user1.address, this.user2.address, parseEther("500"));
      expect(await this.wrapper.allowance(this.user1.address, this.user3.address)).to.equal(parseEther("100"));
      await this.wrapper.connect(this.user1).increaseAllowance(this.user3.address, parseEther("200"));
      expect(await this.wrapper.allowance(this.user1.address, this.user3.address)).to.equal(parseEther("300"));
      await this.wrapper.connect(this.user1).decreaseAllowance(this.user3.address, parseEther("100"));
      expect(await this.wrapper.allowance(this.user1.address, this.user3.address)).to.equal(parseEther("200"));
      {
        async function fails() {
          await self.wrapper.connect(self.user1).decreaseAllowance(self.user3.address, parseEther("10000"));
        }
        await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance");
      }
    });

    it("metadata", async function() {
      expect(await this.wrapper.name()).to.equal("Test coin");
      expect(await this.wrapper.symbol()).to.equal("MCK");
      expect(await this.wrapper.decimals()).to.equal(18);
      expect(await this.wrapper.uri()).to.equal();
    });
  });
});
