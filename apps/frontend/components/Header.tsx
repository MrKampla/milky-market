import { Flex, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

function Header() {
  return (
    <Flex
      margin="auto"
      maxW="container.xl"
      p={[0, 4]}
      direction={['column', 'row']}
      justify="center"
      align="center"
    >
      <Link href="/">
        <Text color="pink.400" fontSize={32} fontWeight="bold">
          MilkyMarket
        </Text>
      </Link>
      <Flex w="full" justify={['center', 'end']}>
        <ConnectButton />
      </Flex>
    </Flex>
  );
}

export default Header;
