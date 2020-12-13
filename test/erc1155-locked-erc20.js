const chai = require("chai");
const { expect } = chai;
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

chai.use(require('chai-as-promised'))

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
  it("ERC20 locked in ERC1155", async function() {
    const [deployer, user1, user2, user3] = await ethers.getSigners();

    beforeEach(async function() {
      const ERC20Mock = await ethers.getContractFactory("MockCoin");
      this.erc20Mock = await ERC20Mock.deploy();
      await this.erc20Mock.deployed();
      this.erc20Mock.mint(user3.address, parseEther("1000"), []);
      
      const erc1155LockedERC20 = await ethers.getContractFactory("ERC1155LockedERC20");
      this.wrapper = await erc1155LockedERC20.deploy("https://example.com");
      await this.wrapper.deployed();

      await this.erc20Mock.connect(user3).approve(this.wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
      this.wrapper.connect(user3).borrowERC20(this.erc20Mock.address, parseEther("1000"), user3.address, user1.address, []);
      expect(await this.erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOf(user1.address, this.erc20Mock.address)).to.equal(parseEther("1000"));
    });

    it("ERC20 locked in ERC155", async function() {
      await this.wrapper.connect(user1).safeTransferFrom(user1.address, user2.address, this.erc20Mock.address, parseEther("300"), []);
      expect(await this.wrapper.balanceOf(user1.address, this.erc20Mock.address)).to.equal(parseEther("700"));
      expect(await this.wrapper.balanceOf(user2.address, this.erc20Mock.address)).to.equal(parseEther("300"));

      {
        async function fails() {
          await this.wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, this.erc20Mock.address, parseEther("100"), []);
        }
        // TODO: Here it's a different error message that in ERC1155OverERC20.
        await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
      }
      await this.wrapper.connect(user1).setApprovalForAll(user3.address, true);
      await this.wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, this.erc20Mock.address, parseEther("100"), []);
      expect(await this.erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOf(user1.address, this.erc20Mock.address)).to.equal(parseEther("600"));
      expect(await this.erc20Mock.balanceOf(user2.address)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOf(user2.address, this.erc20Mock.address)).to.equal(parseEther("400"));

      this.wrapper.connect(user1).returnToERC20(this.erc20Mock.address, parseEther("600"), user3.address);
      expect(await this.erc20Mock.balanceOf(user3.address)).to.equal(parseEther("600"));
    });

    // TODO: Check length mismatch in batch transfers.
    it("ERC20 locked in ERC155 (batch transfers)", async function() {
      await this.wrapper.connect(user1).safeTransferFromBatch(user1.address, user2.address, [this.erc20Mock.address], [parseEther("300")], []);
      expect(await this.wrapper.balanceOf(user1.address, [this.erc20Mock.address])).to.equal([parseEther("700")]);
      expect(await this.wrapper.balanceOf(user2.address, [this.erc20Mock.address])).to.equal([parseEther("300")]);

      {
        async function fails() {
          await this.wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, [this.erc20Mock.address], [parseEther("100")], []);
        }
        // TODO: Here it's a different error message that in ERC1155OverERC20.
        await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
      }
      await this.wrapper.connect(user1).setApprovalForAll(user3.address, true);
      await this.wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, [this.erc20Mock.address], [parseEther("100")], []);
      expect(await this.erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOfBatch(user1.address, [this.erc20Mock.address])).to.equal([parseEther("600")]);
      expect(await this.erc20Mock.balanceOf(user2.address)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOfBatch(user2.address, [this.erc20Mock.address])).to.equal([parseEther("400")]);

      this.wrapper.connect(user1).returnToERC20(this.erc20Mock.address, parseEther("600"), user3.address);
      expect(await this.erc20Mock.balanceOf(user3.address)).to.equal(parseEther("600"));
    });
  });
});
