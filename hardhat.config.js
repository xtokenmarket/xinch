require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('ethereum-waffle')

const config = {
  solidity: {
    version: '0.6.2',
  },
  networks: {
    hardhat: {
    },
  },
  mocha: {
    timeout: 0,
  },
};

module.exports = config;