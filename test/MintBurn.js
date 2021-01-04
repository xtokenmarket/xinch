const { expect } = require("chai");
const { utils, BigNumber } = require("ethers");
const { xInchFixture } = require("./fixtures");
const { expectGreaterThanZero, expectGreaterThan } = require("./utils");

describe("xINCH: MintBurn", async () => {
  const provider = ethers.provider;

  let xinch;
  let inch;
  let deployer, user1, user2;

  before(async () => {
    ({ xinch, accounts, inch } = await xInchFixture());
    [deployer, user1, user2] = accounts;
  });

  it("should mint xINCH tokens to user sending ETH", async () => {
    await xinch.mint("0", { value: utils.parseEther("0.01") });
    const xinchBal = await xinch.balanceOf(deployer.address);
    expectGreaterThanZero(xinchBal);
  });

  it("should register a fee in ETH", async () => {
    const ethBal = await provider.getBalance(xinch.address);
    expectGreaterThanZero(ethBal);
  });

  it("should mint xINCH tokens to user sending INCH", async () => {
    const inchAmount = utils.parseEther("10");
    await inch.transfer(user1.address, inchAmount);
    await inch.connect(user1).approve(xinch.address, inchAmount);
    await xinch.connect(user1).mintWithToken(inchAmount);
    const xinchBal = await xinch.balanceOf(user1.address);
    expectGreaterThanZero(xinchBal);
  });

  it("should register a fee in INCH", async () => {
    const inchBal = await xinch.withdrawableOneInchFees();
    expectGreaterThanZero(inchBal);
  });

  it("should burn xINCH tokens for INCH", async () => {
    const inchBalBefore = await inch.balanceOf(deployer.address);
    const xinchBal = await xinch.balanceOf(deployer.address);
    const bnBal = BigNumber.from(xinchBal);

    const xinchToRedeem = bnBal.div(BigNumber.from(100));
    await xinch.burn(xinchToRedeem.toString(), false, 0);

    const inchBalAfter = await inch.balanceOf(deployer.address);
    expectGreaterThan(inchBalAfter, inchBalBefore);
  });

  it("should burn xINCH tokens for ETH", async () => {
    await xinch.mint("0", { value: utils.parseEther("0.1") });
    const ethBalBefore = await provider.getBalance(deployer.address);
    const xinchBal = await xinch.balanceOf(deployer.address);
    const bnBal = BigNumber.from(xinchBal);

    const xinchToRedeem = bnBal.div(BigNumber.from(100));
    await xinch.burn(xinchToRedeem.toString(), true, 0);

    const ethBalAfter = await provider.getBalance(deployer.address);
    expectGreaterThan(ethBalAfter, ethBalBefore);
  });

  it("should revert if burn requirements exceed available liquidity", async () => {
    await xinch.rebalance();

    const totalSupply = await xinch.totalSupply();
    const xinchToRedeem = totalSupply.div(BigNumber.from(2));
    await expect(xinch.burn(xinchToRedeem, false, "0")).to.be.revertedWith(
      "Insufficient exit liquidity"
    );
  });

  it("should not mint with ETH if contract is paused", async () => {
    await xinch.pauseContract();
    await expect(
      xinch.mint("0", { value: utils.parseEther("0.01") })
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should not mint with INCH if contract is paused", async () => {
    const inchAmount = utils.parseEther("10");
    await inch.transfer(user1.address, inchAmount);
    await inch.connect(user1).approve(xinch.address, inchAmount);
    await expect(
      xinch.connect(user1).mintWithToken(inchAmount)
    ).to.be.revertedWith("Pausable: paused");
  });
});
