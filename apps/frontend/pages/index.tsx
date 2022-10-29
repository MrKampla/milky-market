import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <Flex p={8} justify="center">
      <Button colorScheme="pink">
        <Text p={2}>Home</Text>
      </Button>
      <Box>
        <ConnectButton />
      </Box>
    </Flex>
  );
}
