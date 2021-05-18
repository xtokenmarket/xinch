const { expect, assert } = require("chai");
const { utils, BigNumber } = require("ethers");
const { xInchFixture } = require("./fixtures");
const {
  expectGreaterThanZero,
  expectGreaterThan,
  expectEqual,
  increaseTime,
  mineBlocks
} = require("./utils");

describe("xINCH: Util Functions", async () => {
  let xinch;
  let inch;
  let deployer, user1, user2, user3;

  let FEE_DIVISORS;

  before(async () => {
    ({ xinch, accounts, inch, FEE_DIVISORS } = await xInchFixture());
    [deployer, user1, user2, user3] = accounts;
  });

  it("should register correct fee divisors", async () => {
    const feeDivisors = await xinch.feeDivisors();
    expectEqual(feeDivisors.mintFee, FEE_DIVISORS.MINT_FEE);
    expectEqual(feeDivisors.burnFee, FEE_DIVISORS.BURN_FEE);
    expectEqual(feeDivisors.claimFee, FEE_DIVISORS.CLAIM_FEE);
  });

  it("should let admin unstake full quantity if necessary", async () => {
    await xinch.mint("0", { value: utils.parseEther("0.01") });
    await xinch.rebalance();

    const stakedBal = await xinch.getStakedBalance();
    expectGreaterThanZero(stakedBal);

    await xinch.adminUnstake(stakedBal);
    const stakedBalAfter = await xinch.getStakedBalance();
    expectEqual(stakedBalAfter, "0");
  });

  it("should not let non-admin unstake full quantity before liquidation period has elapsed", async () => {
    await mineBlocks(5);
    await xinch.mint("0", { value: utils.parseEther("0.01") });
    await xinch.rebalance();

    const stakedBal = await xinch.getStakedBalance();
    expectGreaterThanZero(stakedBal);

    await expect(
      xinch.connect(user1).emergencyUnstake(stakedBal)
    ).to.be.revertedWith("Liquidation time not elapsed");
  });

  it("should let non-admin unstake full quantity once liquidation period has elapsed", async () => {
    const stakedBal = await xinch.getStakedBalance();
    expectGreaterThanZero(stakedBal);

    const FOUR_WEEKS = 60 * 60 * 24 * 7 * 4 + 1;
    await increaseTime(FOUR_WEEKS);

    await xinch.connect(user1).emergencyUnstake(stakedBal);

    const stakedBalAfter = await xinch.getStakedBalance();
    expectEqual(stakedBalAfter, "0");
  });

  it("should allow for a permissioned manager to be set", async () => {
    await xinch.setManager(user3.address);
    await xinch.connect(user3).rebalance();

    assert(true); // if no revert, test passes
  });
});
