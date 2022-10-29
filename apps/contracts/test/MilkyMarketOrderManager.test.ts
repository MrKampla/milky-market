import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumberish } from 'ethers';
import { ethers } from 'hardhat';
import { test } from 'mocha';
import { MilkyMarket, MilkyMarketOrderManager, IERC20 } from '../typechain-types';
import { deployMilkyMarket } from '../utils/testHelpers/fixtures/deployMilkyMarket';
import { distributeTokens } from '../utils/testHelpers/fixtures/distributeTokens';

describe('MilkyMarketOrderManager', async () => {
  let milkyMarket: MilkyMarket;
  let ordersManagerContract: MilkyMarketOrderManager;
  let micToken: IERC20;
  let usdcToken: IERC20;
  let wethToken: IERC20;

  before(async () => {
    const { milkyMarket: mm, ordersManagerContract: omc } = await loadFixture(
      deployMilkyMarket,
    );
    milkyMarket = mm;
    ordersManagerContract = omc;
    const {
      micToken: m,
      usdcToken: u,
      wethToken: w,
    } = await loadFixture(distributeTokens);
    micToken = m;
    usdcToken = u;
    wethToken = w;
  });

  test('should return order', async () => {
    await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

    const tx = await milkyMarket.createOrder({
      amountOffered: ethers.utils.parseUnits('1', 'ether'),
      amountWanted: ethers.utils.parseUnits('2', 6),
      offeredToken: micToken.address,
      wantedToken: usdcToken.address,
      recipient: ethers.constants.AddressZero,
    });

    const receipt = await tx.wait();
    const tokenId = receipt.events!.at(-1)!.args![0] as BigNumberish;

    const order = await ordersManagerContract.getOrder(tokenId);
    expect(order.offeredToken).to.equal(micToken.address);
    expect(order.wantedToken).to.equal(usdcToken.address);
    expect(order.amountOffered).to.equal(ethers.utils.parseUnits('1', 'ether'));
    expect(order.amountWanted).to.equal(ethers.utils.parseUnits('2', 6));
    expect(order.recipient).to.equal(ethers.constants.AddressZero);
  });

  test('should not allow to burn order directly', async () => {
    await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

    const tx = await milkyMarket.createOrder({
      amountOffered: ethers.utils.parseUnits('1', 'ether'),
      amountWanted: ethers.utils.parseUnits('2', 6),
      offeredToken: micToken.address,
      wantedToken: usdcToken.address,
      recipient: ethers.constants.AddressZero,
    });
    const receipt = await tx.wait();
    const tokenId = receipt.events!.at(-1)!.args![0] as BigNumberish;

    await expect(ordersManagerContract.burn(tokenId)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  test('should not allow to mint order directly', async () => {
    const [user] = await ethers.getSigners();

    await expect(
      ordersManagerContract.safeMint(user.address, {
        amountOffered: ethers.utils.parseUnits('1', 'ether'),
        amountWanted: ethers.utils.parseUnits('2', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      }),
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
