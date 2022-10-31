import { Flex, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import React from 'react';
import { BigNumber, ethers } from 'ethers';
import { useBlockchainExplorerLinkGenerator } from '../../utils/hooks/useBlockchainExplorerLinkGenerator';
import { shortenAddress } from '../../utils/shortenAddress';

function OfferSide({
  amount,
  tokenSymbol,
  tokenName,
  tokenAddress,
  decimals,
}: {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: BigNumber;
  decimals: number;
}) {
  const linkGenerator = useBlockchainExplorerLinkGenerator();
  return (
    <Flex px={2} direction="column" align="center">
      <Text>{tokenName}</Text>
      <Link
        target="_blank"
        rel="noreferrer"
        href={linkGenerator({
          address: tokenAddress,
          type: 'token',
        })}
      >
        <Flex align="center">
          <Text mr="1">{shortenAddress(tokenAddress)}</Text>
          <ExternalLinkIcon w={5} h={5} />
        </Flex>
      </Link>
      <Text>{`${ethers.utils.formatUnits(
        amount.toString(),
        decimals,
      )} ${tokenSymbol}`}</Text>
    </Flex>
  );
}

export default OfferSide;
