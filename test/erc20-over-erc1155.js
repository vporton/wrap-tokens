const { expect } = require("chai");
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

describe("ERC20OverERC1155", async function() {
  it("Transferring ERC1155 through ERC20", async function() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const tokenId = 124;

    beforeEach(async function() {
      const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
      this.erc1155Mock = await ERC1155Mock.deploy("https://example.com");
      await this.erc1155Mock.deployed();
      this.erc1155Mock.mint(user1.address, tokenId, parseEther("1000"), []);
      
      const ERC20OverERC1155 = await ethers.getContractFactory("ERC20OverERC1155");
      this.wrapper = await ERC20OverERC1155.deploy(this.erc1155Mock.address, tokenId);
      await this.wrapper.deployed();
  
      await this.erc1155Mock.connect(user1).setApprovalForAll(this.wrapper.address, true);
    });

    it("ERC20 over ERC1155", async function() {
      await this.wrapper.connect(user1).transfer(user2.address, parseEther("300"));
      expect(await this.erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("700"));
      expect(await this.wrapper.balanceOf(user1.address)).to.equal(parseEther("700"));
      expect(await this.erc1155Mock.balanceOf(user2.address, tokenId)).to.equal(parseEther("300"));
      expect(await this.wrapper.balanceOf(user2.address)).to.equal(parseEther("300"));

      await this.wrapper.connect(user1).transferFrom(user1.address, user2.address, parseEther("100"));
      expect(await this.erc1155Mock.balanceOf(user1.address, tokenId)).to.equal(parseEther("600"));
      expect(await this.wrapper.balanceOf(user1.address)).to.equal(parseEther("600"));
      expect(await this.erc1155Mock.balanceOf(user2.address, tokenId)).to.equal(parseEther("400"));
      expect(await this.wrapper.balanceOf(user2.address)).to.equal(parseEther("400"));
    });

    // TODO: Check that can't transfer for other users without their approval.
  });
});
