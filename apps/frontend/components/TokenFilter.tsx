import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, Flex } from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';
import { useState } from 'react';
import { Token } from '../utils/hooks/useTokenList';
import { TokenInput } from './create/TokenInput';
import { TokenListModal } from './TokenListModal';

interface TokenFilterData {
  offeredTokenFilter: string;
  wantedTokenFilter: string;
}

export const offeredTokenAddressFilterAtom = atom('');
export const wantedTokenAddressFilterAtom = atom('');

function TokenFilter() {
  const [, setOfferedTokenAddressFilter] = useAtom(offeredTokenAddressFilterAtom);
  const [, setWantedTokenAddressFilterAtom] = useAtom(wantedTokenAddressFilterAtom);
  const [filterData, setFilterData] = useState<TokenFilterData>({
    offeredTokenFilter: '',
    wantedTokenFilter: '',
  });
  const [selectedTokenData, setSelectedTokenData] = useState<{
    offeredTokenFilter?: Token | undefined;
    wantedTokenFilter?: Token | undefined;
  }>({});
  const [selectedTokenForModal, setSelectedTokenForModal] = useState<
    'offeredTokenFilter' | 'wantedTokenFilter' | undefined
  >();

  return (
    <Flex w="full" direction={['column', 'column', 'row']}>
      <Flex w="full" align="end">
        <TokenInput
          label="Filter by offered token..."
          name="offeredTokenFilter"
          formData={filterData}
          selectedTokenData={selectedTokenData['offeredTokenFilter']}
          openModal={() => setSelectedTokenForModal('offeredTokenFilter')}
        />
        <Button
          ml={1}
          size="sm"
          onClick={() => {
            setFilterData((data) => ({
              ...data,
              offeredTokenFilter: '',
            }));
            setSelectedTokenData((data) => ({
              ...data,
              offeredTokenFilter: undefined,
            }));
            setOfferedTokenAddressFilter('');
          }}
        >
          <CloseIcon h={2} w={2} />
        </Button>
      </Flex>
      <Box m={2} />
      <Flex w="full" align="end">
        <TokenInput
          label="Filter by wanted token..."
          name="wantedTokenFilter"
          formData={filterData}
          selectedTokenData={selectedTokenData['wantedTokenFilter']}
          openModal={() => setSelectedTokenForModal('wantedTokenFilter')}
        />
        <Button
          ml={1}
          size="sm"
          onClick={() => {
            setFilterData((data) => ({
              ...data,
              wantedTokenFilter: '',
            }));
            setSelectedTokenData((data) => ({
              ...data,
              wantedTokenFilter: undefined,
            }));
            setWantedTokenAddressFilterAtom('');
          }}
        >
          <CloseIcon h={2} w={2} />
        </Button>
      </Flex>
      <TokenListModal
        isOpen={!!selectedTokenForModal}
        onClose={() => setSelectedTokenForModal(undefined)}
        onSelect={(token) => {
          setFilterData((data) => ({
            ...data,
            [selectedTokenForModal!]: token.address,
          }));
          setSelectedTokenData((data) => ({
            ...data,
            [selectedTokenForModal!]: token,
          }));
          if (selectedTokenForModal === 'offeredTokenFilter') {
            setOfferedTokenAddressFilter(token.address);
          } else {
            setWantedTokenAddressFilterAtom(token.address);
          }
        }}
      />
    </Flex>
  );
}

export default TokenFilter;
