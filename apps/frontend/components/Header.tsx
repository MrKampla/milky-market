import { Flex, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import MilkyMarketLogo from './MilkyMarketLogo';

function Header() {
  return (
    <Flex
      margin="auto"
      maxW="container.xl"
      direction={['column', 'row']}
      justify="center"
      align="center"
    >
      <Link href="/">
        <MilkyMarketLogo width="196px" />
      </Link>
      <Flex mt={[2, 0]} w="full" justify={['center', 'end']}>
        <ConnectButton />
      </Flex>
    </Flex>
  );
}

export default Header;
