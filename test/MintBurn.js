const { expect, assert } = require('chai');
const { utils, ethers } = require('ethers');
const { xInchFixture } = require('./fixtures');

describe("xINCH: MintBurn", async() => {
  let xinch

  before(async() => {
    ({ xinch } = await xInchFixture())
  })

  it("should register a token symbol", async() => {
    const symbol = await xinch.symbol()
    console.log('symbol', symbol)
  })

});
