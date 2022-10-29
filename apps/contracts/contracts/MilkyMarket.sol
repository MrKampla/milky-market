// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@prb/math/contracts/PRBMathUD60x18.sol';
import './MilkyMarketOrderManager.sol';

error MilkyMarket__AmountOfferedIsZero();
error MilkyMarket__TransferFailed();
error MilkyMarket__NotAnOwner();
error MilkyMarket__NotARecipient();
error MilkyMarket__NoSuitableOffers();

contract MilkyMarket {
  using PRBMathUD60x18 for uint256;

  event OrderCreated(
    uint256 indexed tokenId,
    address indexed offeredToken,
    address indexed wantedToken
  );

  event OrderFilled(
    uint256 indexed tokenId,
    address indexed offeredToken,
    address indexed wantedToken,
    address taker
  );

  event OrderCancelled(
    uint256 indexed tokenId,
    address indexed offeredToken,
    address indexed wantedToken,
    address owner
  );

  // token1 => token2 => order IDs
  mapping(address => mapping(address => uint256[])) public orderIdsForPair;

  MilkyMarketOrderManager public immutable ordersManagerContract;

  constructor() {
    ordersManagerContract = new MilkyMarketOrderManager();
  }

  function createOrder(MilkyMarketOrderManager.Order calldata order) external {
    if (order.amountOffered == 0) revert MilkyMarket__AmountOfferedIsZero();

    bool isSucces = IERC20(order.offeredToken).transferFrom(
      msg.sender,
      address(this),
      order.amountOffered
    );
    if (!isSucces) revert MilkyMarket__TransferFailed();

    uint256 tokenId = ordersManagerContract.safeMint(msg.sender, order);

    (address token1, address token2) = _getPairInOrder(
      order.offeredToken,
      order.wantedToken
    );
    orderIdsForPair[token1][token2].push(tokenId);
    emit OrderCreated(tokenId, order.offeredToken, order.wantedToken);
  }

  function cancelOrder(uint256 orderId) external {
    MilkyMarketOrderManager.Order memory order = ordersManagerContract.getOrder(orderId);
    address owner = ordersManagerContract.ownerOf(orderId);
    if (owner != msg.sender) revert MilkyMarket__NotAnOwner();

    _deleteOrder(orderId, order);

    bool isSucces = IERC20(order.offeredToken).transfer(msg.sender, order.amountOffered);
    if (!isSucces) revert MilkyMarket__TransferFailed();

    emit OrderCancelled(orderId, order.offeredToken, order.wantedToken, owner);
  }

  function fillOrder(uint256 orderId) external {
    MilkyMarketOrderManager.Order memory order = ordersManagerContract.getOrder(orderId);
    if (order.recipient != address(0) && order.recipient != msg.sender)
      revert MilkyMarket__NotARecipient();

    address owner = ordersManagerContract.ownerOf(orderId);

    _deleteOrder(orderId, order);

    // transfer tokens on behalf of the order filler to the order owner
    bool isTransferToOwnerSucces = IERC20(order.wantedToken).transferFrom(
      msg.sender,
      owner,
      order.amountWanted
    );
    if (!isTransferToOwnerSucces) revert MilkyMarket__TransferFailed();

    // transfer tokens to the taker on behalf of the order owner that were
    // deposited to this contract when the order was created
    bool isTransferToFillerSucces = IERC20(order.offeredToken).transfer(
      msg.sender,
      order.amountOffered
    );

    if (!isTransferToFillerSucces) revert MilkyMarket__TransferFailed();

    emit OrderFilled(orderId, order.offeredToken, order.wantedToken, msg.sender);
  }

  function getOrderIdsForPair(address token1, address token2)
    external
    view
    returns (uint256[] memory)
  {
    (address t1, address t2) = _getPairInOrder(token1, token2);
    return orderIdsForPair[t1][t2];
  }

  function getOrdersForPair(address token1, address token2)
    external
    view
    returns (MilkyMarketOrderManager.Order[] memory pairOrders)
  {
    (address t1, address t2) = _getPairInOrder(token1, token2);
    uint256[] memory orderIds = orderIdsForPair[t1][t2];
    pairOrders = new MilkyMarketOrderManager.Order[](orderIds.length);
    for (uint256 i = 0; i < orderIds.length; i++) {
      pairOrders[i] = ordersManagerContract.getOrder(orderIds[i]);
    }
  }

  function getOrderIdsByUser(address owner)
    external
    view
    returns (uint256[] memory userOrderIds)
  {
    uint256 amountOfOrdersOfUser = ordersManagerContract.balanceOf(owner);
    userOrderIds = new uint256[](amountOfOrdersOfUser);
    for (uint256 i = 0; i < amountOfOrdersOfUser; i++) {
      userOrderIds[i] = ordersManagerContract.tokenOfOwnerByIndex(owner, i);
    }
  }

  function getOrdersByUser(address owner)
    external
    view
    returns (MilkyMarketOrderManager.Order[] memory userOrders)
  {
    uint256 amountOfOrdersOfUser = ordersManagerContract.balanceOf(owner);
    userOrders = new MilkyMarketOrderManager.Order[](amountOfOrdersOfUser);
    for (uint256 i = 0; i < amountOfOrdersOfUser; i++) {
      userOrders[i] = ordersManagerContract.getOrder(
        ordersManagerContract.tokenOfOwnerByIndex(owner, i)
      );
    }
  }

  function getAskPrice(address offeredToken, address wantedToken)
    external
    view
    returns (uint256)
  {
    (address t1, address t2) = _getPairInOrder(offeredToken, wantedToken);
    uint256[] memory orderIds = orderIdsForPair[t1][t2];
    if (orderIds.length == 0) return 0;

    bool isFound = false;
    uint256 lowestPrice = type(uint256).max;
    for (uint256 i = 0; i < orderIds.length; i++) {
      MilkyMarketOrderManager.Order memory order = ordersManagerContract.getOrder(
        orderIds[i]
      );
      if (order.offeredToken != offeredToken) {
        continue;
      }
      uint256 price = type(uint256).max;
      uint256 offeredTokenDecimals = ERC20(offeredToken).decimals();
      uint256 wantedTokenDecimals = ERC20(wantedToken).decimals();

      if (wantedTokenDecimals == offeredTokenDecimals) {
        price = order.amountWanted.div(order.amountOffered);
        if (price < lowestPrice) {
          lowestPrice = price;
          isFound = true;
        }
        continue;
      }

      (
        uint256 decimalsDifference,
        uint256 offeredTokenInWei,
        uint256 wantedTokenInWei
      ) = offeredTokenDecimals > wantedTokenDecimals
          ? (
            offeredTokenDecimals - wantedTokenDecimals,
            order.amountOffered,
            order.amountWanted * (10**(offeredTokenDecimals - wantedTokenDecimals))
          )
          : (
            wantedTokenDecimals - offeredTokenDecimals,
            order.amountOffered,
            order.amountWanted * (10**(wantedTokenDecimals - offeredTokenDecimals))
          );

      price = wantedTokenInWei.div(offeredTokenInWei);
      price = price / (10**decimalsDifference);

      if (price < lowestPrice) {
        lowestPrice = price;
        isFound = true;
      }
    }

    if (!isFound) revert MilkyMarket__NoSuitableOffers();

    return lowestPrice;
  }

  function getBidPrice(address offeredToken, address wantedToken)
    external
    view
    returns (uint256)
  {
    (address t1, address t2) = _getPairInOrder(offeredToken, wantedToken);
    uint256[] memory orderIds = orderIdsForPair[t1][t2];
    if (orderIds.length == 0) return 0;

    bool isFound = false;
    uint256 highiestPrice = 0;
    for (uint256 i = 0; i < orderIds.length; i++) {
      MilkyMarketOrderManager.Order memory order = ordersManagerContract.getOrder(
        orderIds[i]
      );
      if (order.offeredToken != offeredToken) {
        continue;
      }
      uint256 price = 0;
      uint256 offeredTokenDecimals = ERC20(offeredToken).decimals();
      uint256 wantedTokenDecimals = ERC20(wantedToken).decimals();

      if (wantedTokenDecimals == offeredTokenDecimals) {
        price = order.amountWanted.div(order.amountOffered);
        if (price > highiestPrice) {
          highiestPrice = price;
          isFound = true;
        }
        continue;
      }

      (
        uint256 decimalsDifference,
        uint256 offeredTokenInWei,
        uint256 wantedTokenInWei
      ) = offeredTokenDecimals > wantedTokenDecimals
          ? (
            offeredTokenDecimals - wantedTokenDecimals,
            order.amountOffered,
            order.amountWanted * (10**(offeredTokenDecimals - wantedTokenDecimals))
          )
          : (
            wantedTokenDecimals - offeredTokenDecimals,
            order.amountOffered,
            order.amountWanted * (10**(wantedTokenDecimals - offeredTokenDecimals))
          );

      price = wantedTokenInWei.div(offeredTokenInWei);
      price = price / (10**decimalsDifference);

      if (price > highiestPrice) {
        highiestPrice = price;
        isFound = true;
      }
    }

    if (!isFound) revert MilkyMarket__NoSuitableOffers();

    return highiestPrice;
  }

  // PRIVATE METHODS
  function _getPairInOrder(address token1, address token2)
    internal
    pure
    returns (address, address)
  {
    return token1 > token2 ? (token2, token1) : (token1, token2);
  }

  function _removeOrderIdFromList(uint256[] storage list, uint256 orderId)
    internal
    returns (uint256[] memory)
  {
    // find tokenId index in list
    uint256 index = 0;
    while (list[index] != orderId) {
      index++;
    }

    // remove tokenId from list by shifting all elements after it to the left
    for (uint256 i = index; i < list.length - 1; i++) {
      list[i] = list[i + 1];
    }
    list.pop();
    return list;
  }

  function _deleteOrder(uint256 orderId, MilkyMarketOrderManager.Order memory order)
    internal
  {
    ordersManagerContract.burn(orderId);
    (address token1, address token2) = _getPairInOrder(
      order.offeredToken,
      order.wantedToken
    );
    orderIdsForPair[token1][token2] = _removeOrderIdFromList(
      orderIdsForPair[token1][token2],
      orderId
    );
  }
}
