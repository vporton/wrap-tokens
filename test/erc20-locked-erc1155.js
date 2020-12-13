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

describe("ERC20LockedERC1155", function() {
  const tokenId = 124;

  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
    this.erc1155Mock = await ERC1155Mock.deploy("https://example.com");
    await this.erc1155Mock.deployed();
    this.erc1155Mock.mint(this.user1.address, tokenId, parseEther("1000"), []);
    this.erc1155Mock.mint(this.user3.address, tokenId, parseEther("100"), []);
    
    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20LockedERC1155");
    this.wrapper = await ERC20OverERC1155.deploy(this.erc1155Mock.address, tokenId);
    await this.wrapper.deployed();

    await this.erc1155Mock.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
    await this.erc1155Mock.connect(this.user3).setApprovalForAll(this.wrapper.address, true);
  });

  it("ERC1155 locked in ERC20", async function() {
    // TODO: Check for two different users.
    this.wrapper.connect(this.user1).borrowERC1155(parseEther("1000"), this.user1.address, this.user1.address);
    this.wrapper.connect(this.user3).borrowERC1155(parseEther("100"), this.user3.address, this.user3.address);
    expect(await this.erc1155Mock.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("1000"));

    await this.wrapper.connect(this.user1).transfer(this.user2.address, parseEther("300"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("700"));
    expect(await this.wrapper.balanceOf(this.user2.address)).to.equal(parseEther("300"));

    await this.wrapper.connect(this.user1).approve(this.user3.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    await this.wrapper.connect(this.user3).transferFrom(this.user1.address, this.user2.address, parseEther("100"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("600"));
    expect(await this.wrapper.balanceOf(this.user2.address)).to.equal(parseEther("400"));

    // TODO: Check for two different users.
    this.wrapper.connect(this.user1).returnToERC1155(parseEther("600"), this.user1.address);
    expect(await this.erc1155Mock.balanceOf(this.user1.address, tokenId)).to.equal(parseEther("600"));
    expect(await this.wrapper.balanceOf(this.user1.address)).to.equal(parseEther("0"));

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user2).transferFrom(self.user3.address, self.user2.address, parseEther("10"));
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance");
    }
  });

  it("metadata", async function() {
    expect(await this.wrapper.name()).to.equal("Test coin");
    expect(await this.wrapper.symbol()).to.equal("MCK");
    expect(await this.wrapper.decimals()).to.equal(18);
    expect(await this.wrapper.uri()).to.equal("https://example.com");
  });
});
