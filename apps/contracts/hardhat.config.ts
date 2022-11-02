import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    localhost: {
      forking: {
        url: process.env.POLYGON_MAINNET_RPC!,
        blockNumber: 34881158,
      },
      chainId: 31337,
    },
    hardhat: {
      forking: {
        url: process.env.POLYGON_MAINNET_RPC!,
        blockNumber: 34881158,
      },
      chainId: 31337,
      accounts: [
        {
          privateKey: process.env.PRIVATE_KEY!,
          balance: '100315414324631460577',
        },
        {
          privateKey: process.env.PRIVATE_KEY_2!,
          balance: '100000000000000000000',
        },
      ],
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC!,
      chainId: 137,
      accounts: [process.env.PRIVATE_KEY!],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC!,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
