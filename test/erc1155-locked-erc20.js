const chai = require("chai");
const { expect } = chai;
const { BigNumber } = ethers;
const { toBN } = BigNumber;
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

describe("ERC1155LockedERC20", function() {
  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("MockCoin");
    this.erc20Mock = await ERC20Mock.deploy();
    await this.erc20Mock.deployed();
    this.erc20Mock.mint(this.user3.address, parseEther("1000"), []);
    this.erc20Mock2 = await ERC20Mock.deploy();
    await this.erc20Mock2.deployed();
    this.erc20Mock2.mint(this.user3.address, parseEther("3000"), []);
    
    const erc1155LockedERC20 = await ethers.getContractFactory("ERC1155LockedERC20");
    this.wrapper = await erc1155LockedERC20.deploy("https://example.com");
    await this.wrapper.deployed();

    await this.erc20Mock.connect(this.user3).approve(this.wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    this.wrapper.connect(this.user3).borrowERC20(this.erc20Mock.address, parseEther("1000"), this.user3.address, this.user1.address, []);
    await this.erc20Mock2.connect(this.user3).approve(this.wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    expect(await this.wrapper.totalSupply(this.erc20Mock.address)).to.equal(parseEther("1000"));
    this.wrapper.connect(this.user3).borrowERC20(this.erc20Mock2.address, parseEther("2000"), this.user3.address, this.user1.address, []);
    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock.address)).to.equal(parseEther("1000"));
    expect(await this.erc20Mock2.balanceOf(this.user3.address)).to.equal(parseEther("1000"));
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock2.address)).to.equal(parseEther("2000"));
  });

  it("ERC20 locked in ERC155", async function() {
    await this.wrapper.connect(this.user1).safeTransferFrom(this.user1.address, this.user2.address, this.erc20Mock.address, parseEther("300"), []);
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock.address)).to.equal(parseEther("700"));
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc20Mock.address)).to.equal(parseEther("300"));

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeTransferFrom(self.user1.address, self.user2.address, self.erc20Mock.address, parseEther("100"), []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    await this.wrapper.connect(this.user3).safeTransferFrom(this.user1.address, this.user2.address, this.erc20Mock.address, parseEther("100"), []);
    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user1.address, this.erc20Mock.address)).to.equal(parseEther("600"));
    expect(await this.erc20Mock.balanceOf(this.user2.address)).to.equal(parseEther("0"));
    expect(await this.wrapper.balanceOf(this.user2.address, this.erc20Mock.address)).to.equal(parseEther("400"));

    this.wrapper.connect(this.user1).returnToERC20(this.erc20Mock.address, parseEther("600"), this.user3.address);
    expect(await this.wrapper.totalSupply(this.erc20Mock.address)).to.equal(parseEther("400"));
    expect(await this.erc20Mock.balanceOf(this.user3.address)).to.equal(parseEther("600"));
  });

  it("ERC20 locked in ERC155 (batch transfers)", async function() {
    await this.wrapper.connect(this.user1).safeBatchTransferFrom(this.user1.address, this.user2.address, [this.erc20Mock.address, this.erc20Mock2.address], [parseEther("300"), parseEther("300")], []);
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("700"), parseEther("1700")]);
    expect(await this.wrapper.balanceOfBatch([this.user2.address, this.user2.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("300"), parseEther("300")]);

    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user3.address, [self.erc20Mock.address, self.erc20Mock2.address], [parseEther("100"), parseEther("100")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(false);
    await this.wrapper.connect(this.user1).setApprovalForAll(this.user3.address, true);
    expect(await this.wrapper.connect(this.user1).isApprovedForAll(this.user1.address, this.user3.address)).to.be.equal(true);
    await this.wrapper.connect(this.user3).safeBatchTransferFrom(this.user1.address, this.user3.address, [this.erc20Mock.address, this.erc20Mock2.address], [parseEther("100"), parseEther("100")], []);
    expect(await this.erc20Mock.balanceOf(this.user1.address)).to.equal(parseEther("0"));
    expect(await this.erc20Mock2.balanceOf(this.user3.address)).to.equal(parseEther("1000"));
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user1.address, this.user1.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("600"), parseEther("1600")]);
    expect(await this.erc20Mock.balanceOf(this.user3.address)).to.equal(parseEther("0"));
    expect(await this.erc20Mock2.balanceOf(this.user3.address)).to.equal(parseEther("1000"));
    // TODO: Heterogeneous arrays of users.
    expect(await this.wrapper.balanceOfBatch([this.user3.address, this.user3.address], [this.erc20Mock.address, this.erc20Mock2.address])).to.deep.equal([parseEther("100"), parseEther("100")]);

    this.wrapper.connect(this.user1).returnToERC20(this.erc20Mock.address, parseEther("600"), this.user3.address);
    expect(await this.erc20Mock.balanceOf(this.user3.address)).to.equal(parseEther("600"));
    this.wrapper.connect(this.user1).returnToERC20(this.erc20Mock2.address, parseEther("600"), this.user3.address);
    expect(await this.erc20Mock2.balanceOf(this.user3.address)).to.equal(parseEther("1600"));
  });

  it("length mismatch", async function() {
    const self = this;
    {
      async function fails() {
        await self.wrapper.connect(self.user3).safeBatchTransferFrom(self.user1.address, self.user2.address, [self.erc20Mock.address, self.erc20Mock2.address], [parseEther("100")], []);
      }
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: ids and amounts length mismatch");
    }
  });

  it("metadata", async function() {
    expect(await this.wrapper.name(this.erc20Mock.address)).to.equal("Test coin");
    expect(await this.wrapper.symbol(this.erc20Mock.address)).to.equal("MCK");
    expect(await this.wrapper.decimals(this.erc20Mock.address)).to.equal(18);
    expect(await this.wrapper.uri(this.erc20Mock.address)).to.equal("https://example.com");
  });
});
