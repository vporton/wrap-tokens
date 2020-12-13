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

    const ERC20Mock = await ethers.getContractFactory("MockCoin");
    const erc20Mock = await ERC20Mock.deploy();
    await erc20Mock.deployed();
    erc20Mock.mint(user3.address, parseEther("1000"), []);
    
    const erc1155LockedERC20 = await ethers.getContractFactory("ERC1155LockedERC20");
    const wrapper = await erc1155LockedERC20.deploy("https://example.com");
    await wrapper.deployed();

    await erc20Mock.connect(user3).approve(wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    wrapper.connect(user3).borrowERC20(erc20Mock.address, parseEther("1000"), user3.address, user1.address, []);
    expect(await erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("1000"));

    await wrapper.connect(user1).safeTransferFrom(user1.address, user2.address, erc20Mock.address, parseEther("300"), []);
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("700"));
    expect(await wrapper.balanceOf(user2.address, erc20Mock.address)).to.equal(parseEther("300"));

    {
      async function fails() {
        await wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, erc20Mock.address, parseEther("100"), []);
      }
      // TODO: Here it's a different error message that in ERC1155OverERC20.
      await expectThrowsAsync(fails, "VM Exception while processing transaction: revert ERC1155: caller is not owner nor approved");
    }
    await wrapper.connect(user1).setApprovalForAll(user3.address, true);
    await wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, erc20Mock.address, parseEther("100"), []);
    expect(await erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("600"));
    expect(await erc20Mock.balanceOf(user2.address)).to.equal(parseEther("0"));
    expect(await wrapper.balanceOf(user2.address, erc20Mock.address)).to.equal(parseEther("400"));

    wrapper.connect(user1).returnToERC20(erc20Mock.address, parseEther("600"), user3.address);
    expect(await erc20Mock.balanceOf(user3.address)).to.equal(parseEther("600"));

    // TODO: Check batch transfers.
  });
});
