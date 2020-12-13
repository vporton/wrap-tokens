const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

describe("ERC20LockedERC1155", function() {
  it("ERC1155 locked in ERC20", async function() {
    const [deployer, user1, user2, user3] = await ethers.getSigners();

    const tokenId = 124;

    const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
    const erc1155Mock = await ERC1155Mock.deploy("https://example.com");
    await erc1155Mock.deployed();
    erc1155Mock.mint(user1.address, tokenId, parseEther("1000"), []);
    
    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20LockedERC1155");
    const wrapper = await ERC20OverERC1155.deploy(erc1155Mock.address, tokenId);
    await wrapper.deployed();

    await erc1155Mock.connect(user1).setApprovalForAll(wrapper.address, true);
    // TODO: Check for two different users.
    wrapper.connect(user1).borrowERC1155(parseEther("1000"), user1.address, user1.address);
    expect(await erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("0"));
    expect(await wrapper.balanceOf(user1.address)).to.equal(parseEther("1000"));

    await wrapper.connect(user1).transfer(user2.address, parseEther("300"));
    expect(await wrapper.balanceOf(user1.address)).to.equal(parseEther("700"));
    expect(await wrapper.balanceOf(user2.address)).to.equal(parseEther("300"));

    await wrapper.connect(user1).approve(user3.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
    await wrapper.connect(user3).transferFrom(user1.address, user2.address, parseEther("100"));
    expect(await wrapper.balanceOf(user1.address)).to.equal(parseEther("600"));
    expect(await wrapper.balanceOf(user2.address)).to.equal(parseEther("400"));

    // TODO: Check for two different users.
    wrapper.connect(user1).returnToERC1155(parseEther("600"), user1.address);
    expect(await erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("600"));

    // TODO: Check that can't transfer for other users without their approval.
  });
});
