import { ethers } from 'hardhat';

async function main() {
  const MilkyMarketFactory = await ethers.getContractFactory('MilkyMarket');
  const milkyMarket = await MilkyMarketFactory.deploy();

  await milkyMarket.deployed();

  console.log(
    `MilkyMarket deployed to ${
      milkyMarket.address
    } and MilkyMarketOrderManager deployed to ${await milkyMarket.ordersManagerContract()}`,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
