# Milky Market

Milky market is a decentralized spot OTC (over-the-counter) exchange for ERC-20 tokens compatible with EVM chains.
This solution is targeted for projects that don't have the money required to create a reasonable liquidity pool for classic DEX like Uniswap, but they still want to give their users a way to exchange tokens peer-to-peer in a permissionless way, without a need of intermediaries.

Milky market consists of a set of smart contracts that allow for settlements on-chain (currently only deployed to polygon mumbai testnet) and a webpage interface accessible from [milkymarket.com](milkymarket.com).

# Repository overview

This monorepo contains contracts (`apps/contracts`) and a frontend interface (`apps/frontend`). Contracts are written in Solidity language with use of Hardhat environment and the frontend interface uses Next.js.

# Running Milky Market locally

In order to run Milky Market locally, first you have to compile contracts, then run a local hardhat node, deploy the contracts to your local testnet and then run `yarn dev` command

# How it works

The logic behind exchange is divided into two contracts: `MilkyMarket.sol` and `MilkyMarketOrderManager.sol`. MilkyMarket is an actual exchange where all the mutations happen i.e., creating an order, filling an existing order or cancelling an order. MilkyMarketOrderManager is an ERC-721 contract and each NFT represents a single order containing all the data specific for a particular order.
