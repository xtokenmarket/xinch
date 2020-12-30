// const { Contract, utils } = require('ethers');
const { deployContract } = require('ethereum-waffle');
const { deployments } = require('hardhat');

const xInchFixture = deployments.createFixture(async ({ ethers }, options) => {
	const [deployer, user1, user2] = await ethers.getSigners();

	const OneInch = await ethers.getContractFactory('MockOneInch');
	const oneInch = await OneInch.deploy();

	const StakedOneInch = await ethers.getContractFactory('MockStakedOneInch');
	const stakedOneInch = await StakedOneInch.deploy();

	const GovernanceMothership = await ethers.getContractFactory('MockGovernanceMothership');
	const governanceMothership = await GovernanceMothership.deploy();

	const KyberNetworkProxy = await ethers.getContractFactory('MockKyberNetworkProxy');
	const kyberNetworkProxy = await KyberNetworkProxy.deploy();

	const xINCH = await ethers.getContractFactory('xINCH');
	const xinch = await xINCH.deploy();

	const xINCHProxy = await ethers.getContractFactory('xINCHProxy');
	const xinchProxy = await xINCHProxy.deploy(xinch.address, deployer.address, user1.address, user2.address);
	const xinchProxyCast = await ethers.getContractAt('xINCH', xinchProxy.address);

	await xinchProxyCast.initialize(
		'xINCHa',
		oneInch.address,
		stakedOneInch.address,
		governanceMothership.address,
		kyberNetworkProxy.address
	);

	return {
		xinch: xinchProxyCast,
	};
});

module.exports = { xInchFixture };
