const { expect, assert } = require("chai");

const expectGreaterThanZero = (val) => expect(val).to.be.gt(0);
const expectGreaterThan = (val1, val2) => expect(val1).to.be.gt(val2);
const expectEqual = (val1, val2) => expect(val1).to.be.equal(val2);

async function increaseTime(time) {
  let provider = ethers.provider;
  await provider.send("evm_increaseTime", [time]);
  await provider.send("evm_mine", []);
}

/**
 * Mine several blocks in network
 * @param {Number} blockCount how many blocks to mine
 */
 async function mineBlocks(blockCount) {
  for(let i = 0 ; i < blockCount ; ++i) {
      await hre.ethers.provider.send("evm_mine");
  }
}

module.exports = {
  expectGreaterThanZero,
  expectGreaterThan,
  expectEqual,
  increaseTime,
  mineBlocks
};
