import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { test } from 'mocha';
import { IERC20, MilkyMarket, MilkyMarketOrderManager } from '../typechain-types';
import { deployMilkyMarket } from '../utils/testHelpers/fixtures/deployMilkyMarket';
import { distributeTokens } from '../utils/testHelpers/fixtures/distributeTokens';

describe('MilkyMarket public orders', async () => {
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

  describe('public orders', () => {
    test('should be deployed', async () => {
      expect(milkyMarket.address).to.be.properAddress;
      expect(await milkyMarket.ordersManagerContract()).to.be.properAddress;
    });

    test('should create a public order', async () => {
      const [user] = await ethers.getSigners();

      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

      await expect(
        milkyMarket.createOrder({
          amountOffered: ethers.utils.parseUnits('1', 'ether'),
          amountWanted: ethers.utils.parseUnits('2', 6),
          offeredToken: micToken.address,
          wantedToken: usdcToken.address,
          recipient: ethers.constants.AddressZero,
        }),
      ).to.emit(milkyMarket, 'OrderCreated');

      const orders = await milkyMarket.getOrdersByUser(user.address);
      expect(orders.length).to.equal(1);
      expect(orders[0].amountOffered).to.equal(ethers.utils.parseUnits('1', 'ether'));
      expect(orders[0].amountWanted).to.equal(ethers.utils.parseUnits('2', 6));
      expect(orders[0].offeredToken).to.equal(micToken.address);
      expect(orders[0].wantedToken).to.equal(usdcToken.address);
      expect(orders[0].recipient).to.equal(ethers.constants.AddressZero);
    });

    test('should allow to accept a public offer by anyone', async () => {
      const [orderCreator, taker] = await ethers.getSigners();

      const orderId = await ordersManagerContract.tokenOfOwnerByIndex(
        orderCreator.address,
        0,
      );

      const usdcBalanceBefore = await usdcToken.balanceOf(taker.address);
      const micBalanceBefore = await micToken.balanceOf(taker.address);

      await usdcToken
        .connect(taker)
        .approve(milkyMarket.address, ethers.utils.parseUnits('2', 6));

      await expect(milkyMarket.connect(taker).fillOrder(orderId)).to.emit(
        milkyMarket,
        'OrderFilled',
      );

      const usdcBalanceAfter = await usdcToken.balanceOf(taker.address);
      const micBalanceAfter = await micToken.balanceOf(taker.address);

      expect(usdcBalanceAfter.add(ethers.utils.parseUnits('2', 6))).to.equal(
        usdcBalanceBefore,
      );
      expect(micBalanceAfter.sub(ethers.utils.parseUnits('1', 'ether'))).to.equal(
        micBalanceBefore,
      );

      const order = await ordersManagerContract.getOrder(orderId);
      expect(order.amountOffered).to.equal(0);
      expect(order.amountWanted).to.equal(0);
    });

    test('should remove an accepted offer', async () => {
      const [orderCreator] = await ethers.getSigners();

      const orders = await milkyMarket.getOrdersByUser(orderCreator.address);
      expect(orders.length).to.equal(0);
      expect(await ordersManagerContract.balanceOf(orderCreator.address)).to.equal(0);

      expect(await ordersManagerContract.totalSupply()).to.equal(0);
    });
  });

  describe('private orders', () => {
    test('should create a private order', async () => {
      const [user, recipient] = await ethers.getSigners();

      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('1', 'ether'),
        amountWanted: ethers.utils.parseUnits('2', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: recipient.address,
      });

      const orders = await milkyMarket.getOrdersByUser(user.address);
      expect(orders[0].recipient).to.equal(recipient.address);
    });

    test('should not allow to accept a private offer by other person than recipient', async () => {
      const [orderCreator] = await ethers.getSigners();

      const orderId = await ordersManagerContract.tokenOfOwnerByIndex(
        orderCreator.address,
        0,
      );

      const order = await ordersManagerContract.getOrder(orderId);
      expect(order.recipient).to.not.equal(orderCreator.address);

      // in this case, creator (who is not a recipient) wants to fill own order
      await expect(
        milkyMarket.connect(orderCreator).fillOrder(orderId),
      ).to.be.revertedWithCustomError(milkyMarket, 'MilkyMarket__NotARecipient');
    });

    test('should allow to accept a private offer only by recipient', async () => {
      const [orderCreator, recipient] = await ethers.getSigners();

      const orderId = await ordersManagerContract.tokenOfOwnerByIndex(
        orderCreator.address,
        0,
      );

      const usdcBalanceBefore = await usdcToken.balanceOf(recipient.address);
      const micBalanceBefore = await micToken.balanceOf(recipient.address);

      await usdcToken
        .connect(recipient)
        .approve(milkyMarket.address, ethers.utils.parseUnits('2', 6));

      await milkyMarket.connect(recipient).fillOrder(orderId);

      const usdcBalanceAfter = await usdcToken.balanceOf(recipient.address);
      const micBalanceAfter = await micToken.balanceOf(recipient.address);

      expect(usdcBalanceAfter.add(ethers.utils.parseUnits('2', 6))).to.equal(
        usdcBalanceBefore,
      );
      expect(micBalanceAfter.sub(ethers.utils.parseUnits('1', 'ether'))).to.equal(
        micBalanceBefore,
      );

      const order = await ordersManagerContract.getOrder(orderId);
      expect(order.amountOffered).to.equal(0);
      expect(order.amountWanted).to.equal(0);
    });

    test('should remove an accepted offer', async () => {
      const [orderCreator] = await ethers.getSigners();

      const orders = await milkyMarket.getOrdersByUser(orderCreator.address);
      expect(orders.length).to.equal(0);
      expect(await ordersManagerContract.balanceOf(orderCreator.address)).to.equal(0);

      expect(await ordersManagerContract.totalSupply()).to.equal(0);
    });
  });

  describe('cancel order', () => {
    test('should allow to cancel an order', async () => {
      const [user] = await ethers.getSigners();

      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('1', 'ether'),
        amountWanted: ethers.utils.parseUnits('2', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const orderId = await ordersManagerContract.tokenOfOwnerByIndex(user.address, 0);

      await expect(milkyMarket.cancelOrder(orderId)).to.emit(
        milkyMarket,
        'OrderCancelled',
      );

      const order = await ordersManagerContract.getOrder(orderId);
      expect(order.amountOffered).to.equal(0);
      expect(order.amountWanted).to.equal(0);
      expect(await ordersManagerContract.balanceOf(user.address)).to.equal(0);
    });

    test('should not allow to cancel order of someone else', async () => {
      const [user, otherPerson] = await ethers.getSigners();

      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('1', 'ether'),
        amountWanted: ethers.utils.parseUnits('2', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const orderId = await ordersManagerContract.tokenOfOwnerByIndex(user.address, 0);

      await expect(
        milkyMarket.connect(otherPerson).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(milkyMarket, 'MilkyMarket__NotAnOwner');
      expect(await ordersManagerContract.balanceOf(user.address)).to.equal(1);

      await milkyMarket.cancelOrder(orderId);
    });
  });

  describe('fetching orders', () => {
    before(async () => {
      const [, user2] = await ethers.getSigners();

      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('1', 'ether'));
      await usdcToken
        .connect(user2)
        .approve(milkyMarket.address, ethers.utils.parseUnits('4', 6));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('1', 'ether'),
        amountWanted: ethers.utils.parseUnits('2', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      });

      await milkyMarket.connect(user2).createOrder({
        amountOffered: ethers.utils.parseUnits('4', 6),
        amountWanted: ethers.utils.parseUnits('2', 'ether'),
        offeredToken: usdcToken.address,
        wantedToken: micToken.address,
        recipient: ethers.constants.AddressZero,
      });
    });

    test('should return order ids for pair', async () => {
      const [user, user2] = await ethers.getSigners();
      const orders = await milkyMarket.getOrderIdsForPair(
        micToken.address,
        usdcToken.address,
      );
      expect(orders.length).to.equal(2);
      const [order1, order2] = await Promise.all([
        ordersManagerContract.getOrder(orders[0]),
        ordersManagerContract.getOrder(orders[1]),
      ]);
      expect(order1.amountOffered).to.equal(ethers.utils.parseUnits('1', 'ether'));
      expect(order2.amountOffered).to.equal(ethers.utils.parseUnits('4', 6));
      expect(await ordersManagerContract.ownerOf(orders[0])).to.equal(user.address);
      expect(await ordersManagerContract.ownerOf(orders[1])).to.equal(user2.address);
    });

    test("should return particular user's order ids", async () => {
      const [user, user2] = await ethers.getSigners();

      const ordersOfUser1 = await milkyMarket.getOrderIdsByUser(user.address);
      expect(ordersOfUser1.length).to.equal(1);
      const order1 = await ordersManagerContract.getOrder(ordersOfUser1[0]);
      expect(order1.amountOffered).to.equal(ethers.utils.parseUnits('1', 'ether'));
      expect(await ordersManagerContract.ownerOf(ordersOfUser1[0])).to.equal(
        user.address,
      );

      const ordersOfUser2 = await milkyMarket.getOrderIdsByUser(user2.address);
      expect(ordersOfUser2.length).to.equal(1);
      const order2 = await ordersManagerContract.getOrder(ordersOfUser2[0]);
      expect(order2.amountOffered).to.equal(ethers.utils.parseUnits('4', 6));
      expect(await ordersManagerContract.ownerOf(ordersOfUser2[0])).to.equal(
        user2.address,
      );
    });
  });

  describe('fetching prices', () => {
    test('get ask price for a specific pair with same decimals', async () => {
      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('2', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('2', 'ether'),
        amountWanted: ethers.utils.parseUnits('2.5', 'ether'),
        offeredToken: micToken.address,
        wantedToken: wethToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const price = await milkyMarket.getAskPrice(micToken.address, wethToken.address);
      expect(price).to.equal(ethers.utils.parseUnits('1.25', 'ether'));
    });

    test('get ask price for a specific pair with different decimals', async () => {
      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('2', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('2', 'ether'),
        amountWanted: ethers.utils.parseUnits('2.5', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const price = await milkyMarket.getAskPrice(micToken.address, usdcToken.address);
      expect(price).to.equal(ethers.utils.parseUnits('1.25', 6));
    });

    test('get bid price for a specific pair with same decimals', async () => {
      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('2', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('2', 'ether'),
        amountWanted: ethers.utils.parseUnits('5', 'ether'),
        offeredToken: micToken.address,
        wantedToken: wethToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const price = await milkyMarket.getBidPrice(micToken.address, wethToken.address);
      expect(price).to.equal(ethers.utils.parseUnits('2.5', 'ether'));
    });

    test('get bid price for a specific pair with different decimals', async () => {
      await micToken.approve(milkyMarket.address, ethers.utils.parseUnits('2', 'ether'));

      await milkyMarket.createOrder({
        amountOffered: ethers.utils.parseUnits('2', 'ether'),
        amountWanted: ethers.utils.parseUnits('6', 6),
        offeredToken: micToken.address,
        wantedToken: usdcToken.address,
        recipient: ethers.constants.AddressZero,
      });

      const price = await milkyMarket.getBidPrice(micToken.address, usdcToken.address);
      expect(price).to.equal(ethers.utils.parseUnits('3', 6));
    });
  });
});
