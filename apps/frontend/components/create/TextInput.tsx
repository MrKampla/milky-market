import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { OrderCreationData } from '../../utils/hooks/useCreateOffer';

export const TextInput = ({
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
