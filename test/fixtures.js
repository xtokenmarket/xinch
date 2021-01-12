const { deployments } = require("hardhat");
const { utils } = require("ethers");

const xInchFixture = deployments.createFixture(async ({ ethers }, options) => {
  const accounts = await ethers.getSigners();
  const [deployer, user1, user2] = accounts;

  const OneInch = await ethers.getContractFactory("MockOneInch");
  const oneInch = await OneInch.deploy();

  const GovernanceMothership = await ethers.getContractFactory(
    "MockGovernanceMothership"
  );
  const governanceMothership = await GovernanceMothership.deploy(
    oneInch.address
  );

  const FactoryGovernance = await ethers.getContractFactory(
    "MockFactoryGovernance"
  );
  const factoryGovernance = await FactoryGovernance.deploy();

  const GovernanceRewards = await ethers.getContractFactory(
    "MockGovernanceRewards"
  );
  const governanceRewards = await GovernanceRewards.deploy(oneInch.address);

  const ExchangeGovernance = await ethers.getContractFactory(
    "MockExchangeGovernance"
  );
  const exchangeGovernance = await ExchangeGovernance.deploy();

  const OneInchLiquidityProtocol = await ethers.getContractFactory(
    "MockOneInchLiquidityProtocol"
  );
  const oneInchLiquidityProtocol = await OneInchLiquidityProtocol.deploy(oneInch.address);

  const xINCH = await ethers.getContractFactory("xINCH");
  const xinch = await xINCH.deploy();

  const xINCHProxy = await ethers.getContractFactory("xINCHProxy");
  const xinchProxy = await xINCHProxy.deploy(xinch.address, user2.address); // transfer ownership to multisig
  const xinchProxyCast = await ethers.getContractAt(
    "xINCH",
    xinchProxy.address
  );

  const FEE_DIVISORS = {
    MINT_FEE: "500",
    BURN_FEE: "500",
    CLAIM_FEE: "100",
  };

  await xinchProxyCast.initialize(
    "xINCHa",
    oneInch.address,
    governanceMothership.address,
    oneInchLiquidityProtocol.address,
    FEE_DIVISORS.MINT_FEE,
    FEE_DIVISORS.BURN_FEE,
    FEE_DIVISORS.CLAIM_FEE
  );

  await xinchProxyCast.approveInch(governanceMothership.address);
  await xinchProxyCast.approveInch(oneInchLiquidityProtocol.address);

  await xinchProxyCast.setFactoryGovernanceAddress(factoryGovernance.address);
  await xinchProxyCast.setGovernanceRewardsAddress(governanceRewards.address);
  await xinchProxyCast.setExchangeGovernanceAddress(exchangeGovernance.address);

  await oneInch.transfer(oneInchLiquidityProtocol.address, utils.parseEther("100"));
  await oneInch.transfer(deployer.address, utils.parseEther("100"));
  await oneInch.transfer(governanceRewards.address, utils.parseEther("10"));

  return {
    xinch: xinchProxyCast,
    inch: oneInch,
    accounts,
    FEE_DIVISORS,
  };
});

module.exports = { xInchFixture };
