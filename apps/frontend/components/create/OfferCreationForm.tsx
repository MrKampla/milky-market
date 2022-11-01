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
} from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApproveToken } from '../../utils/hooks/useApproveToken';
import { OrderCreationData, useCreateOffer } from '../../utils/hooks/useCreateOffer';
import { TokenListModal } from '../TokenListModal';
import { Token } from '../../utils/hooks/useTokenList';

function OfferCreationForm() {
  const account = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState<OrderCreationData>({
    offeredToken: '0x',
    amountOffered: BigNumber.from(0),
    wantedToken: '0x',
    amountWanted: BigNumber.from(0),
    recipient: ethers.constants.AddressZero,
    isPrivate: false,
  });
  const [selectedTokenData, setSelectedTokenData] = useState<{
    offeredToken?: Token | undefined;
    wantedToken?: Token | undefined;
  }>({});

  const { createOrder, createOrderStatus, refetchAllowance, isEnoughAllowance } =
    useCreateOffer({
      orderCreationData: formData,
    });

  const { approveStatus, approveToken } = useApproveToken({
    tokenAddress: formData.offeredToken,
    amount: formData.amountOffered,
    onSuccess: () => refetchAllowance(),
  });
  const [selectedTokenForModal, setSelectedTokenForModal] = useState<
    'offeredToken' | 'wantedToken' | undefined
  >();

  return (
    <div>
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
          <TextInput
            label="Offered token amount"
            name="amountOffered"
            onChange={setFormData}
            formData={formData}
          />
          <TokenInput
            label="Wanted token address"
            name="wantedToken"
            formData={formData}
            selectedTokenData={selectedTokenData['wantedToken']}
            openModal={() => setSelectedTokenForModal('wantedToken')}
          />
          <TextInput
            label="Wanted token amount"
            name="amountWanted"
            onChange={setFormData}
            formData={formData}
          />
          <Checkbox
            onChange={() => {
              setFormData((form) => ({ ...form, isPrivate: !form.isPrivate }));
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
              onClick={async () => {
                await createOrder?.();
                router.push('/');
              }}
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
    </div>
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
          />
          <Box position="absolute" right={2}>
            {selectedTokenData && (
              <Badge borderRadius="lg">
                <Flex align="center">
                  <Image src={selectedTokenData.logoURI} w="24px" h="24px" mr={1} />
                  <Text>{selectedTokenData.name}</Text>
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
}: {
  label: string;
  formData: OrderCreationData;
  name: keyof OrderCreationData;
  onChange: (value: (values: OrderCreationData) => OrderCreationData) => any;
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
    </FormControl>
  );
};

export default OfferCreationForm;
