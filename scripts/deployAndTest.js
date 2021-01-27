// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

// mainnet
const ADDRESSES = {
	oneInch: '0x111111111117dc0aa78b770fa6a738034120c302',
	stakedInch: '0xA0446D8804611944F1B527eCD37d7dcbE442caba',
	oneInchLiquidityProtocol: '0x0EF1B8a0E726Fc3948E15b23993015eB1627f210', // ETH/INCH pool
	factoryGovernance: '0xbAF9A5d4b0052359326A6CDAb54BABAa3a3A9643',
	governanceRewards: '0x0F85A912448279111694F4Ba4F85dC641c54b594',
	exchangeGovernance: '0xB33839E05CE9Fc53236Ae325324A27612F4d110D',
};

// run on mainnet fork
async function main() {
	const accounts = await ethers.getSigners();
	const [deployer, user1, user2] = accounts;

	const xInch = await ethers.getContractFactory('xINCH');
	const xinch = await xInch.deploy();

	const xINCHProxy = await ethers.getContractFactory('xINCHProxy');
	const xinchProxy = await xINCHProxy.deploy(xinch.address, user2.address); // transfer ownership to multisig
	const xinchProxyCast = await ethers.getContractAt('xINCH', xinchProxy.address);

	const FEE_DIVISORS = {
		MINT_FEE: '500',
		BURN_FEE: '500',
		CLAIM_FEE: '100',
	};

	await xinchProxyCast.initialize(
		'xINCHa',
		'Buchanan',
		ADDRESSES.oneInch,
		ADDRESSES.stakedInch,
		ADDRESSES.oneInchLiquidityProtocol,
		FEE_DIVISORS.MINT_FEE,
		FEE_DIVISORS.BURN_FEE,
		FEE_DIVISORS.CLAIM_FEE
	);

	await xinchProxyCast.approveInch(ADDRESSES.stakedInch);
	await xinchProxyCast.approveInch(ADDRESSES.oneInchLiquidityProtocol);

	await xinchProxyCast.setFactoryGovernanceAddress(ADDRESSES.factoryGovernance);
	await xinchProxyCast.setGovernanceRewardsAddress(ADDRESSES.governanceRewards);
	await xinchProxyCast.setExchangeGovernanceAddress(ADDRESSES.exchangeGovernance);

	console.log('xinchProxyCast:', xinchProxyCast.address);

	// test

	await xinchProxyCast.mint('1', { value: ethers.utils.parseEther('0.01') });
	const totalSupply = await xinchProxyCast.totalSupply();
	console.log('totalSupply', totalSupply.toString());

	await xinchProxyCast.rebalance();

	const nav = await xinchProxyCast.getNav();
	console.log('nav', nav.toString());
	const stakedBal = await xinchProxyCast.getStakedBalance();
	console.log('stakedBal', stakedBal.toString());
	const bufferBal = await xinchProxyCast.getBufferBalance();
	console.log('bufferBal', bufferBal.toString());

	await xinchProxyCast.mint('1', { value: ethers.utils.parseEther('1') });

	const nav1 = await xinchProxyCast.getNav();
	console.log('nav1', nav1.toString());
	const stakedBal1 = await xinchProxyCast.getStakedBalance();
	console.log('stakedBal1', stakedBal1.toString());
	const bufferBal1 = await xinchProxyCast.getBufferBalance();
	console.log('bufferBal1', bufferBal1.toString());

	await xinchProxyCast.rebalance();

	const totalSupply2 = await xinchProxyCast.totalSupply();
	console.log('totalSupply2', totalSupply2.toString());
	const supplyToBurn = await totalSupply2.div(50);

	const inch = await ethers.getContractAt('ERC20', ADDRESSES.oneInch);

	const xinchHoldings = await xinchProxyCast.balanceOf(deployer.address);
	console.log('xinchHoldings', xinchHoldings.toString());
	
	// ETH redemption
	// const ethBal = await ethers.provider.getBalance(deployer.address);
	// console.log('ethBal', ethBal.toString());
	// await xinchProxyCast.burn(supplyToBurn, true, '0');
	// const ethBalAfter = await ethers.provider.getBalance(deployer.address);
	// console.log('ethBalAfter', ethBalAfter.toString());
		
	// INCH redemption
	const inchBal = await inch.balanceOf(deployer.address)
	console.log('inchBal', inchBal.toString())
	await xinchProxyCast.burn(supplyToBurn, false, '0')
	const inchBalAfter = await inch.balanceOf(deployer.address)
	console.log('inchBalAfter', inchBalAfter.toString())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});