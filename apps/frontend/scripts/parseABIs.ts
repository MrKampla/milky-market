#!/usr/bin/env ts-node -r tsconfig-paths/register
import { writeFile } from 'fs/promises';
import milkyMarketArtifact from '@milky-market/contracts/artifacts/contracts/MilkyMarket.sol/MilkyMarket.json';
import milkyMarketOrderManagerArtifact from '@milky-market/contracts/artifacts/contracts/MilkyMarketOrderManager.sol/MilkyMarketOrderManager.json';
import ERC20Artifact from '@milky-market/contracts/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';

async function createTypescriptABIFile(filename: string, abi: string) {
  return writeFile(filename, `export default ${abi} as const;`);
}

[milkyMarketArtifact, milkyMarketOrderManagerArtifact, ERC20Artifact].forEach(
  async (artifact) => {
    await createTypescriptABIFile(
      `./abis/${artifact.contractName}ABI.ts`,
      JSON.stringify(artifact.abi, null, 2),
    );
  },
);
