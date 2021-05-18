const { expect } = require("chai");
const { utils } = require("ethers");
const { xInchFixture } = require("./fixtures");
const { mineBlocks } = require("./utils");

describe("xINCH: BlockLock", async () => {
  const provider = ethers.provider;

  let xinch;
  let inch;
  let deployer, user1, user2;

  beforeEach(async () => {
    ({ xinch, accounts, inch } = await xInchFixture());
    [deployer, user1, user2] = accounts;
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount});
    await mineBlocks(5);
    await xinch.transfer(user1.address, amount);
    await mineBlocks(5);
    await xinch.transfer(user2.address, amount);
    await mineBlocks(5);
  });

  it('account shouldn\'t be able to call mint, burn and transfer before 6 blocks have been mined', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount });
    await expect(xinch.mintWithToken(amount)).
        to.be.reverted;
    await expect(xinch.burn(amount, true, 0)).
        to.be.reverted;
    await expect(xinch.transfer(user1.address, amount)).
        to.be.reverted;
  }),

  it('account shouldn\'t be able to call transfer, mint and burn before 6 blocks have been mined', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.transfer(user1.address, amount);
    await expect(xinch.mint(0, { value: amount })).
        to.be.reverted;
    await expect(xinch.mintWithToken(amount)).
        to.be.reverted;
    await expect(xinch.burn(amount, true, 0)).
        to.be.reverted;
    await expect(xinch.transfer(user1.address, amount)).
        to.be.reverted;
  }),

  it(`no account should be able to call transferFrom from sender address
        which has called mint before 6 blocks have been mined`, async () => {
    await xinch.approve(user1.address, 1);
    await xinch.approve(user2.address, 1);
    await xinch.mint('0', { value: utils.parseEther('0.01') });
    await expect(xinch.connect(user1).transferFrom(deployer.address, user1.address, 1)).
        to.be.reverted;
    await expect(xinch.connect(user2).transferFrom(deployer.address, user1.address, 1)).
        to.be.reverted;
  }),

  it('account should be able to call mint, burn, transfer or transferFrom if >= 6 blocks have been mined', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount });
    await mineBlocks(5);
    await xinch.burn(amount, true, 0);
    await mineBlocks(5);
    await xinch.transfer(user1.address, amount);
    await mineBlocks(5);
    await xinch.approve(user1.address, 1);
    await xinch.connect(user1).transferFrom(deployer.address, user1.address, 1);
  }),

  it('other accounts should be able to call mint even if one is locked', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount });
    await expect(xinch.mint('0', { value: amount })).
        to.be.reverted;
    await xinch.connect(user1).mint('0', { value: amount });
  }),

  it('other accounts should be able to call burn even if one is locked', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.burn(amount, true, 0);
    await expect(xinch.burn(amount, true, 0)).
        to.be.reverted;
    await xinch.connect(user1).burn(amount, true, 0);
  }),

  it('other accounts should be able to call transfer even if one is locked', async () => {
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount });
    await expect(xinch.transfer(user1.address, amount)).
        to.be.reverted;
    await xinch.connect(user1).transfer(user2.address, amount);
  }),

  it('other accounts should be able to call transferFrom even if one is locked', async () => {
    await xinch.connect(user1).approve(user1.address, 1);
    await xinch.approve(user1.address, 1);
    const amount = utils.parseEther('0.01');
    await xinch.mint('0', { value: amount });
    await expect(xinch.connect(user1).transferFrom(deployer.address, user1.address, 1)).
        to.be.reverted;
    await xinch.connect(user1).transferFrom(user1.address, user2.address, 1);
  })
});
