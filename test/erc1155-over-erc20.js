const chai = require("chai");
const { expect } = chai;
const { BigNumber } = ethers;
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

describe("ERC1155OverERC20", function() {
  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("MockCoin");
    this.erc20Mock = await ERC20Mock.deploy();
    await this.erc20Mock.deployed();
    this.erc20Mock.mint(this.user1.address, parseEther("1000"));
    this.erc20Mock2 = await ERC20Mock.deploy();
    await this.erc20Mock2.deployed();
    this.erc20Mock2.mint(this.user1.address, parseEther("2000"));
    
    const ERC1155OverERC20 = await ethers.getContractFactory("ERC1155OverERC20");
    this.wrapper = await ERC1155OverERC20.deploy("https://example.com");
    await this.wrapper.deployed();

    await this.erc20Mock.connect(this.user1).approve(this.wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    await this.erc20Mock2.connect(this.user1).approve(this.wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
  });

  it("ERC1155 over ERC20", async function() {
    await this.wrapper.connect(this.user1).safeTransferFrom(
      this.user1.address,
      this.user2.address,
      this.erc20Mock.address,
      parseEther("300"),
      []
    );

    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("700"));
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock.address)).to.equal(parseEther("700"));
    expect(await this.erc20Mock.balanceOf(this.user2.address)).to.equal(parseEther("300"));
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc20Mock.address)).to.equal(parseEther("300"));

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [self.erc20Mock.address, self.erc20Mock2.address], [parseEther("100"), parseEther("100")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user3).safeTransferFrom(this.user1.address, this.user2.address, this.erc20Mock.address, parseEther("100"), []);
    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("600"));
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock.address)).to.equal(parseEther("600"));
    expect(await this.erc20Mock.balanceOf(this.user2.address)).to.equal(parseEther("400"));
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc20Mock.address)).to.equal(parseEther("400"));
  });

  it("ERC1155 over ERC20 (batch transfers)", async function() {
    await this.wrapper.connect(this.user1).safeBatchTransferFrom(
      this.user1.address,
      this.user2.address,
      [this.erc20Mock.address, this.erc20Mock2.address],
      [parseEther("300"), parseEther("1300")],
      []
    );

    // TODO: Heterogeneous arrays in balanceOfBatch

    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("700"));
    expect(await this.erc20Mock2.balanceOf(this.user1.address)).to.equal(parseEther("700"));
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("700"), parseEther("700")]);
    expect(await this.erc20Mock.balanceOf(this.user2.address)).to.equal(parseEther("300"));
    expect(await this.erc20Mock2.balanceOf(this.user2.address)).to.equal(parseEther("1300"));
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("300"), parseEther("1300")]);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [self.erc20Mock.address, self.erc20Mock2.address], [parseEther("100")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: ids and amounts length mismatch");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user3).safeBatchTransferFrom(this.user1.address, this.user2.address, [this.erc20Mock.address, this.erc20Mock2.address], [parseEther("100"), parseEther("100")], []);
    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("600"));
    expect(await this.erc20Mock2.balanceOf(this.user1.address)).to.equal(parseEther("600"));
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("600"), parseEther("600")]);
    expect(await this.erc20Mock.balanceOf(this.user2.address)).to.equal(parseEther("400"));
    expect(await this.erc20Mock2.balanceOf(this.user2.address)).to.equal(parseEther("1400"));
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("400"), parseEther("1400")]);
  });
});
