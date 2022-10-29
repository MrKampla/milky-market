import { ethers } from 'hardhat';

export async function deployMilkyMarket() {
  const MilkyMarketFactory = await ethers.getContractFactory('MilkyMarket');
  const milkyMarket = await MilkyMarketFactory.deploy();
  await milkyMarket.deployed();

  const ordersManagerContractAddress = await milkyMarket.ordersManagerContract();
  const ordersManagerContract = await ethers.getContractAt(
    'MilkyMarketOrderManager',
    ordersManagerContractAddress,
  );

  return { milkyMarket, ordersManagerContract };
}
