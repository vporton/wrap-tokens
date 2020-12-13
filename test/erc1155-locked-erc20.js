const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

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

    await erc20Mock.conn  ect(user1).approve(wrapper.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    // TODO: Check for two different users.
    wrapper.connect(user1).borrowERC20(erc20Mock.address, parseEther("1000"), user1.address, user1.address, []);
    expect(await erc20Mock.balanceOf(user1.address)).to.equal(parseEther("0"));
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("1000"));

    await wrapper.connect(user1).safeTransferFrom(user1.address, user2.address, erc20Mock.address, parseEther("300"), []);
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("700"));
    expect(await wrapper.balanceOf(user2.address, erc20Mock.address)).to.equal(parseEther("300"));

    await wrapper.connect(user1).setApprovalForAll(user3.address, true);
    await wrapper.connect(user3).safeTransferFrom(user1.address, user2.address, erc20Mock.address, parseEther("100"), []);
    expect(await wrapper.balanceOf(user1.address, erc20Mock.address)).to.equal(parseEther("600"));
    expect(await wrapper.balanceOf(user2.address, erc20Mock.address)).to.equal(parseEther("400"));

    // TODO: Check for two different users.
    wrapper.connect(user1).returnToERC20(erc20Mock.address, parseEther("600"), user1.address);
    expect(await erc20Mock.balanceOf(user1.address)).to.equal(parseEther("600"));

    // TODO: Check that can't transfer for other users without their approval.
  });
});
