require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('@nomiclabs/hardhat-waffle');
require('hardhat-contract-sizer');
require('dotenv').config()

const config = {
	solidity: {
		version: '0.6.2',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		hardhat: {
			forking: {
				url: process.env.ALCHEMY_KEY,
				enabled: false
			}
		},
	},
	mocha: {
		timeout: 0,
	},
	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
	},
};

module.exports = config;
