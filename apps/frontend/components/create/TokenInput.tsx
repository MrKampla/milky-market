import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  InputGroup,
  Flex,
  Input,
  Badge,
  Box,
  Image,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useBlockchainExplorerLinkGenerator } from '../../utils/hooks/useBlockchainExplorerLinkGenerator';
import { Token } from '../../utils/hooks/useTokenList';

export function TokenInput<T>({
  name,
  label,
  formData,
  openModal,
  selectedTokenData,
}: {
  label: string;
  formData: T;
  name: keyof T;
  openModal: () => void;
  selectedTokenData: Token | undefined;
}) {
  const generateLink = useBlockchainExplorerLinkGenerator();
  return (
    <FormControl>
      <FormLabel
        htmlFor={name as string}
        fontSize="sm"
        fontWeight="md"
        color="gray.700"
        _dark={{
          color: 'gray.50',
        }}
      >
        {label}
      </FormLabel>
      <InputGroup>
        <Flex w="full" align="center">
          <Input
            type={typeof formData[name] === 'string' ? 'text' : 'number'}
            value={formData[name] as any}
            onChange={() => {}}
            onClick={openModal}
            mt={1}
            shadow="sm"
            size="sm"
            w="full"
            rounded="md"
            cursor="pointer"
          />
          <Box position="absolute" right={2} zIndex={10}>
            {selectedTokenData && (
              <Badge borderRadius="lg">
                <Flex align="center">
                  <Image src={selectedTokenData.logoURI} w="24px" h="24px" mr={1} />
                  <Text mt={1}>{selectedTokenData.name}</Text>
                  <Link
                    target="_blank"
                    href={generateLink({
                      address: selectedTokenData.address,
                      type: 'token',
                    })}
                  >
                    <ExternalLinkIcon ml={1} w={3} h={3} />
                  </Link>
                </Flex>
              </Badge>
            )}
          </Box>
        </Flex>
      </InputGroup>
    </FormControl>
  );
}
