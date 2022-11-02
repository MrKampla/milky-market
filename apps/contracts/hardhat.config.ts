import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_RANDOM_PRIVATE_KEY =
  '0xf4e8d0152e29b2741d26d1ed0c325b41e33fce30e6b2d4deae4a712afd322e37';

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
          privateKey: process.env.PRIVATE_KEY ?? DEFAULT_RANDOM_PRIVATE_KEY,
          balance: '100315414324631460577',
        },
        {
          privateKey: process.env.PRIVATE_KEY_2 ?? DEFAULT_RANDOM_PRIVATE_KEY,
          balance: '100000000000000000000',
        },
      ],
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC!,
      chainId: 137,
      accounts: [process.env.PRIVATE_KEY ?? DEFAULT_RANDOM_PRIVATE_KEY],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC!,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY ?? DEFAULT_RANDOM_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY!,
      polygon: process.env.POLYGONSCAN_API_KEY!,
    },
  },
};

export default config;
