const { ethers } = require('hardhat');
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

/**
 * Mainnet deployment script
 * Deploys implementation only, and initializes it
 */
async function main() {
	const xInch = await ethers.getContractFactory('xINCH');
	const xinch = await xInch.deploy();
	await xinch.deployed();
	console.log('xinch deployed at address:', xinch.address);

	const FEE_DIVISORS = {
		MINT_FEE: '500',
		BURN_FEE: '500',
		CLAIM_FEE: '100',
	};

	let tx = await xinch.initialize(
		'xINCHa',
		'Buchanan',
		ADDRESSES.oneInch,
		ADDRESSES.stakedInch,
		ADDRESSES.oneInchLiquidityProtocol,
		FEE_DIVISORS.MINT_FEE,
		FEE_DIVISORS.BURN_FEE,
		FEE_DIVISORS.CLAIM_FEE
	);
	await tx.wait();
	console.log('xinch initialized');
}
  

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});