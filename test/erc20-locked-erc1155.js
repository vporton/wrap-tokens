const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

describe("ERC20LockedERC1155", async function() {
  it("ERC1155 locked in ERC20", async function() {
    const tokenId = 124;
    const [deployer, user1, user2, user3] = await ethers.getSigners();

    beforeEach(async function() {
      const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
      this.erc1155Mock = await ERC1155Mock.deploy("https://example.com");
      await this.erc1155Mock.deployed();
      this.erc1155Mock.mint(user1.address, tokenId, parseEther("1000"), []);
      
      const ERC20OverERC1155 = await ethers.getContractFactory("ERC20LockedERC1155");
      this.wrapper = await ERC20OverERC1155.deploy(this.erc1155Mock.address, tokenId);
      await this.wrapper.deployed();

      await this.erc1155Mock.connect(user1).setApprovalForAll(this.wrapper.address, true);
    });

    it("ERC1155 locked in ERC20", async function() {
      // TODO: Check for two different users.
      this.wrapper.connect(user1).borrowERC1155(parseEther("1000"), user1.address, user1.address);
      expect(await this.erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("0"));
      expect(await this.wrapper.balanceOf(user1.address)).to.equal(parseEther("1000"));

      await this.wrapper.connect(user1).transfer(user2.address, parseEther("300"));
      expect(await this.wrapper.balanceOf(user1.address)).to.equal(parseEther("700"));
      expect(await this.wrapper.balanceOf(user2.address)).to.equal(parseEther("300"));

      await this.wrapper.connect(user1).approve(user3.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1)));
      await this.wrapper.connect(user3).transferFrom(user1.address, user2.address, parseEther("100"));
      expect(await this.wrapper.balanceOf(user1.address)).to.equal(parseEther("600"));
      expect(await this.wrapper.balanceOf(user2.address)).to.equal(parseEther("400"));

      // TODO: Check for two different users.
      this.wrapper.connect(user1).returnToERC1155(parseEther("600"), user1.address);
      expect(await this.erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("600"));

      // TODO: Check that can't transfer for other users without their approval.
    });
  });
});
