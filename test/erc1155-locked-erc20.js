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

describe("ERC20LockedERC1155", function() {
  it("ERC1155 locked in ERC20", async function() {
    const [deployer, user1, user2, user3] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("MockCoin");
    const erc20Mock = await ERC20Mock.deploy();
    await erc20Mock.deployed();
    erc20Mock.mint(user1.address, parseEther("1000"), []);
    
    const erc1155LockedERC20 = await ethers.getContractFactory("ERC1155LockedERC20");
    const wrapper = await erc1155LockedERC20.deploy("https://example.com");
    await wrapper.deployed();

    await erc20Mock.connect(user1).approve(wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    // TODO: Check for two different users.
    wrapper.connect(user1).borrowERC20(erc20Mock.address, parseEther("1000"), user1.address, user1.address, []);
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

    // TODO: Check for two different users.
    wrapper.connect(user1).returnToERC20(erc20Mock.address, parseEther("600"), user1.address);
    expect(await erc20Mock.balanceOf(user1.address)).to.equal(parseEther("600"));
  });
});
