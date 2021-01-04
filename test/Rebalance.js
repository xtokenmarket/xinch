const { expect, assert } = require('chai');
const { utils, BigNumber } = require('ethers');
const { xInchFixture } = require('./fixtures');
const { expectGreaterThanZero, expectGreaterThan, expectEqual } = require('./utils');

describe("xINCH: Rebalance", async() => {
    let xinch
    let inch
    let deployer, user1, user2

    let oldAdminActiveTimestamp
    let oldWithdrawableFees
    
    before(async() => {
      ({ xinch, accounts, inch } = await xInchFixture())
      ;[deployer, user1, user2] = accounts

      oldAdminActiveTimestamp = await xinch.adminActiveTimestamp() 
      oldWithdrawableFees = await xinch.withdrawableOneInchFees() 
    })

    it('should stake the correct proportion of token', async () => {
        await xinch.mint('0', { value: utils.parseEther('0.01') });
        await xinch.rebalance()
        
        const stakedBal = await xinch.getStakedBalance();
        const bufferBal = await xinch.getBufferBalance()
        expectGreaterThanZero(stakedBal)
        expectGreaterThanZero(bufferBal)
        
        const BUFFER_TARGET = BigNumber.from(20)
        expectEqual(bufferBal.add(stakedBal), bufferBal.mul(BUFFER_TARGET))
    });
    
    it('should update admin active timestamp if permissioned rebalance func is called', async () => {
        const adminActiveTimestamp = await xinch.adminActiveTimestamp() 
        expectGreaterThan(adminActiveTimestamp, oldAdminActiveTimestamp)
    });
    
    it('should not allow non-admin to use permissioned rebalance function', async () => {
        await expect(xinch.connect(user1).rebalance()).to.be.revertedWith('Non-admin caller')
    });
    
    it('should allow non-admin to use external rebalance function', async () => {
        await xinch.mint('0', { value: utils.parseEther('0.01') });
        await xinch.connect(user1).rebalanceExternal()
        
        const stakedBal = await xinch.getStakedBalance();
        const bufferBal = await xinch.getBufferBalance()
        expectGreaterThanZero(stakedBal)
        expectGreaterThanZero(bufferBal)
        
        const BUFFER_TARGET = BigNumber.from(20)
        expectEqual(bufferBal.add(stakedBal), bufferBal.mul(BUFFER_TARGET))
    });
    
    it('should register an increase in withdrawable INCH fees', async () => {
        const withdrawableFees = await xinch.withdrawableOneInchFees() 
        expectGreaterThan(withdrawableFees, oldWithdrawableFees)
    });
    
    it('should register an increase in INCH balance (rewards)', async () => {
        const bufferBalBefore = await xinch.getBufferBalance()
        await xinch.rebalance()
        const bufferBalAfter = await xinch.getBufferBalance()
        expectGreaterThan(bufferBalAfter, bufferBalBefore)
    });
    

})