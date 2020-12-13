const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

describe("ERC20LockedERC1155", function() {
  const tokenId = 124;

  beforeEach(async function() {
    [this.deployer, this.user1, this.user2, this.user3] = await ethers.getSigners();

    const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
    this.erc1155Mock = await ERC1155Mock.deploy("https://example.com");
    await this.erc1155Mock.deployed();
    this.erc1155Mock.mint(this.user1.address, tokenId, parseEther("1000"), []);
    
    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20LockedERC1155");
    this.wrapper = await ERC20OverERC1155.deploy(this.erc1155Mock.address, tokenId);
    await this.wrapper.deployed();

    await this.erc1155Mock.connect(this.user1).setApprovalForAll(this.wrapper.address, true);
  });

  it("ERC1155 locked in ERC20", async function() {
    // TODO: Check for two different users.
    this.wrapper.connect(this.user1).borrowERC1155(parseEther("1000"), this.user1.address, this.user1.address);
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

    // TODO: Check that can't transfer for other users without their approval.
  });
});
