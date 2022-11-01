import { SearchIcon } from '@chakra-ui/icons';
import {
  Text,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
  Skeleton,
} from '@chakra-ui/react';
import { useState } from 'react';
import useTokenList, { Token } from '../utils/hooks/useTokenList';
import { shortenAddress } from '../utils/shortenAddress';

export const TokenListModal = ({
  onSelect,
  isOpen,
  onClose,
}: {
  onSelect: (token: Token) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [searchText, setSearchText] = useState('');
  const { tokenList, loading } = useTokenList();

  const filteredList = tokenList.filter((token) => {
    if (searchText === '') {
      return true;
    }
    return (
      token.name.toLowerCase().includes(searchText.toLowerCase()) ||
      token.address.toLowerCase().includes(searchText.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select token</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <InputGroup colorScheme="pink" mr={[2, 6]}>
              <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon color="gray.300" />}
              />
              <Input
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                focusBorderColor="pink.500"
                type="text"
                placeholder="Select token by name or address"
              />
            </InputGroup>
            <Skeleton h={loading ? 24 : undefined} isLoaded={!loading}>
              <Flex direction="column">
                {filteredList.map((token) => (
                  <Flex
                    mt={2}
                    key={token.address}
                    p={2}
                    border="1px"
                    borderRadius="xl"
                    align="center"
                    _hover={{ bg: 'gray.100', borderColor: 'pink.400' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => {
                      onSelect(token);
                      onClose();
                    }}
                  >
                    <Image src={token.logoURI} w="36px" height="36px" />

                    <Flex ml={2} direction="column">
                      <Text>{token.name}</Text>
                      <Text fontSize="sm" opacity="50%">
                        {token.symbol}
                      </Text>
                      <Text fontSize="sm" opacity="50%">
                        {shortenAddress(token.address)}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Skeleton>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button w="full" colorScheme="pink" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
