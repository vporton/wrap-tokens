const chai = require("chai");
const { expect } = chai;
const { BigNumber } = ethers;
const { parseEther } = ethers.utils;

// chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')());

describe("ERC20Registry", function() {
  beforeEach(async function() {
    [this.deployer] = await ethers.getSigners();
    this.token1 = 123;
    this.token2 = 321;

    const ERC20OverERC1155 = await ethers.getContractFactory("ERC20OverERC1155");
    const erc20OverErc1155 = await ERC20OverERC1155.deploy();
    await erc20OverErc1155.deployed();

    const ERC20LockedERC1155 = await ethers.getContractFactory("ERC20LockedERC1155");
    const erc20LockedErc1155 = await ERC20LockedERC1155.deploy();
    await erc20LockedErc1155.deployed();

    const Registry = await ethers.getContractFactory("ERC20Registry");
    this.registry = await Registry.deploy(erc20OverErc1155.address, erc20LockedErc1155.address);
    await this.registry.deployed();

    const ERC1155 = await ethers.getContractFactory("ERC1155Mock");
    this.erc1155 = await ERC1155.deploy();
    await this.erc1155.deployed();
  });

  it("empty registry", async function() {
    expect(await this.registry.getWrapper(this.erc1155.address, this.token1)).to.be.bignumber.equal("0");
    expect(await this.registry.getLocker(this.erc1155.address, this.token1)).to.be.bignumber.equal("0");
  });

  it("registration", async function() {
    await this.registry.registerWrapper(this.erc1155.address, this.token1);
    const wrapper1 = await this.registry.getWrapper(this.erc1155.address, this.token1);
    await this.registry.registerLocker(this.erc1155.address, this.token1);
    const locker1 = await this.registry.getLocker(this.erc1155.address, this.token1);
    await this.registry.registerWrapper(this.erc1155.address, this.token2);
    const wrapper2 = await this.registry.getWrapper(this.erc1155.address, this.token2);
    await this.registry.registerLocker(this.erc1155.address, this.token2);
    const locker2 = await this.registry.getLocker(this.erc1155.address, this.token2);

    await this.registry.registerWrapper(this.erc1155.address, this.token1);
    const wrapper3 = await this.registry.getWrapper(this.erc1155.address, this.token1);
    await this.registry.registerLocker(this.erc1155.address, this.token1);
    const locker3 = await this.registry.getLocker(this.erc1155.address, this.token1);
    await this.registry.registerWrapper(this.erc1155.address, this.token2);
    const wrapper4 = await this.registry.getWrapper(this.erc1155.address, this.token2);
    await this.registry.registerLocker(this.erc1155.address, this.token2);
    const locker4 = await this.registry.getLocker(this.erc1155.address, this.token2);

    const wrappers = [
      [this.erc1155.address, this.token1],
      [this.erc1155.address, this.token2],
      [this.erc1155.address, this.token1],
      [this.erc1155.address, this.token2],
    ];

    const lockers = [
      [this.erc1155.address, this.token1],
      [this.erc1155.address, this.token2],
      [this.erc1155.address, this.token1],
      [this.erc1155.address, this.token2],
    ];

    for (let p of wrappers) {
      expect(BigNumber.from(await this.registry.getWrapper(p[0], p[1])).toString()).to.be.bignumber.not.equal("0");
      expect(BigNumber.from(await this.registry.getLocker(p[0], p[1])).toString()).to.be.bignumber.not.equal("0");
    }

    for (let p of lockers) {
      expect(BigNumber.from(await this.registry.getLocker(p[0], p[1])).toString()).to.be.bignumber.not.equal("0");
      expect(BigNumber.from(await this.registry.getWrapper(p[0], p[1])).toString()).to.be.bignumber.not.equal("0");
    }

    expect(wrapper1).to.be.not.equal(locker1);
    expect(wrapper2).to.be.not.equal(locker2);
    expect(wrapper3).to.be.not.equal(locker3);
    expect(wrapper4).to.be.not.equal(locker4);

    expect(wrapper1).to.be.equal(wrapper3);
    expect(wrapper2).to.be.equal(wrapper4);
    expect(locker1).to.be.equal(locker3);
    expect(locker2).to.be.equal(locker4);
  });
});
