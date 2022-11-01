import {
  chakra,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Flex,
  Checkbox,
  InputGroup,
  Badge,
  Image,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApproveToken } from '../../utils/hooks/useApproveToken';
import { OrderCreationData, useCreateOffer } from '../../utils/hooks/useCreateOffer';
import { TokenListModal } from '../TokenListModal';
import { Token } from '../../utils/hooks/useTokenList';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useBlockchainExplorerLinkGenerator } from '../../utils/hooks/useBlockchainExplorerLinkGenerator';
import { useTokenBalanceOfUser } from '../../utils/hooks/useTokenBalanceOfUser';

function OfferCreationForm() {
  const account = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState<OrderCreationData>({
    offeredToken: '0x',
    amountOffered: '',
    wantedToken: '0x',
    amountWanted: '',
    recipient: ethers.constants.AddressZero,
    isPrivate: false,
  });
  const [selectedTokenData, setSelectedTokenData] = useState<{
    offeredToken?: Token | undefined;
    wantedToken?: Token | undefined;
  }>({});

  const { data: offeredTokenBalance, status: offeredTokenBalanceStatus } =
    useTokenBalanceOfUser({
      address: formData.offeredToken,
    });
  const { data: wantedTokenBalance, status: wantedTokenBalanceStatus } =
    useTokenBalanceOfUser({
      address: formData.wantedToken,
    });

  const { createOrder, createOrderStatus, refetchAllowance, isEnoughAllowance } =
    useCreateOffer({
      orderCreationData: formData,
    });

  const { approveStatus, approveToken } = useApproveToken({
    tokenAddress: formData.offeredToken,
    amount: BigNumber.from(
      ethers.utils.parseUnits(
        formData.amountOffered || '0',
        selectedTokenData.offeredToken?.decimals || 18,
      ),
    ),
    onSuccess: () => refetchAllowance(),
  });
  const [selectedTokenForModal, setSelectedTokenForModal] = useState<
    'offeredToken' | 'wantedToken' | undefined
  >();

  const doesUserHaveEnoughOfferedTokens =
    offeredTokenBalance?.gte(
      BigNumber.from(
        ethers.utils.parseUnits(
          formData.amountOffered || '0',
          selectedTokenData.offeredToken?.decimals || 18,
        ),
      ),
    ) ?? true;

  return (
    <Box mt={4}>
      <chakra.form
        shadow="base"
        rounded={[null, 'md']}
        overflow={{
          sm: 'hidden',
        }}
      >
        <Stack
          px={4}
          py={5}
          p={[null, 6]}
          bg="white"
          _dark={{
            bg: '#141517',
          }}
          spacing={6}
        >
          <TokenInput
            label="Offered token address"
            name="offeredToken"
            formData={formData}
            selectedTokenData={selectedTokenData['offeredToken']}
            openModal={() => setSelectedTokenForModal('offeredToken')}
          />
          <Skeleton isLoaded={offeredTokenBalanceStatus !== 'loading'}>
            {offeredTokenBalance ? (
              <Text>{`Your balance of offered token: ${ethers.utils.formatUnits(
                offeredTokenBalance?.toString() ?? 0,
                selectedTokenData.offeredToken?.decimals,
              )} ${selectedTokenData.offeredToken?.symbol}`}</Text>
            ) : (
              <Text />
            )}
          </Skeleton>
          <TextInput
            label="Offered token amount"
            name="amountOffered"
            onChange={setFormData}
            formData={formData}
            isInvalid={!doesUserHaveEnoughOfferedTokens}
          />
          <TokenInput
            label="Wanted token address"
            name="wantedToken"
            formData={formData}
            selectedTokenData={selectedTokenData['wantedToken']}
            openModal={() => setSelectedTokenForModal('wantedToken')}
          />
          <Skeleton isLoaded={wantedTokenBalanceStatus !== 'loading'}>
            {wantedTokenBalance ? (
              <Text>{`Your balance of wanted token: ${ethers.utils.formatUnits(
                wantedTokenBalance?.toString() ?? 0,
                selectedTokenData.wantedToken?.decimals,
              )} ${selectedTokenData.wantedToken?.symbol}`}</Text>
            ) : (
              <Text />
            )}
          </Skeleton>
          <TextInput
            label="Wanted token amount"
            name="amountWanted"
            onChange={setFormData}
            formData={formData}
            isInvalid={false}
          />
          <Checkbox
            onChange={() => {
              setFormData((form) => ({
                ...form,
                isPrivate: !form.isPrivate,
                recipient: ethers.constants.AddressZero,
              }));
            }}
          >
            Is private?
          </Checkbox>
          {formData.isPrivate && (
            <TextInput
              label="Recipient address"
              name="recipient"
              onChange={setFormData}
              formData={formData}
              isInvalid={false}
            />
          )}
        </Stack>
        <Box
          px={{
            base: 4,
            sm: 6,
          }}
          py={3}
          bg="gray.50"
          _dark={{
            bg: '#121212',
          }}
          textAlign="right"
        >
          <Flex direction="column">
            <Button
              isLoading={approveStatus === 'loading'}
              disabled={
                !formData.offeredToken ||
                !+formData.amountOffered ||
                !approveToken ||
                !account.address ||
                approveStatus === 'loading' ||
                approveStatus === 'success' ||
                isEnoughAllowance
              }
              colorScheme="blue"
              onClick={async () => approveToken?.()}
            >
              {['idle', 'error'].includes(approveStatus) &&
                (account.address
                  ? isEnoughAllowance
                    ? 'Milky market is approved to use your tokens'
                    : 'Approve Milky Market to use your tokens'
                  : 'Connect wallet in order to proceed')}
              {approveStatus === 'success' && 'Approved'}
            </Button>
            <Button
              colorScheme="pink"
              disabled={!createOrder || !isEnoughAllowance}
              isLoading={createOrderStatus === 'loading'}
              mt={2}
              onClick={() =>
                createOrder?.()
                  .then(() => router.push('/'))
                  .catch(() => {})
              }
            >
              {['idle', 'error'].includes(createOrderStatus) && 'Create order'}
              {createOrderStatus === 'success' && 'Order created!'}
            </Button>
          </Flex>
        </Box>
      </chakra.form>
      <TokenListModal
        isOpen={!!selectedTokenForModal}
        onClose={() => setSelectedTokenForModal(undefined)}
        onSelect={(token) => {
          setFormData((data) => ({
            ...data,
            [selectedTokenForModal!]: token.address,
          }));
          setSelectedTokenData((data) => ({
            ...data,
            [selectedTokenForModal!]: token,
          }));
        }}
      />
    </Box>
  );
}

const TokenInput = ({
  name,
  label,
  formData,
  openModal,
  selectedTokenData,
}: {
  label: string;
  formData: OrderCreationData;
  name: keyof OrderCreationData;
  openModal: () => void;
  selectedTokenData: Token | undefined;
}) => {
  const generateLink = useBlockchainExplorerLinkGenerator();
  return (
    <FormControl>
      <FormLabel
        htmlFor={name}
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
};

const TextInput = ({
  onChange,
  name,
  label,
  formData,
  isInvalid,
}: {
  label: string;
  formData: OrderCreationData;
  name: keyof OrderCreationData;
  onChange: (value: (values: OrderCreationData) => OrderCreationData) => any;
  isInvalid: boolean;
}) => {
  return (
    <FormControl>
      <FormLabel
        htmlFor={name}
        fontSize="sm"
        fontWeight="md"
        color="gray.700"
        _dark={{
          color: 'gray.50',
        }}
      >
        {label}
      </FormLabel>
      <Input
        isInvalid={!!isInvalid}
        type={typeof formData[name] === 'string' ? 'text' : 'number'}
        onChange={(e) => {
          onChange((form) => ({
            ...form,
            [name]: BigNumber.isBigNumber(formData[name])
              ? BigNumber.from(e.target.value || 0)
              : e.target.value,
          }));
        }}
        value={formData[name] as any}
        mt={1}
        shadow="sm"
        size="sm"
        w="full"
        rounded="md"
      />
      {isInvalid && <Text color="red">You don't have enough tokens</Text>}
    </FormControl>
  );
};

export default OfferCreationForm;
