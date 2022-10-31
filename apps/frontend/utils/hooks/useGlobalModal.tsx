import { Flex, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useAtom } from 'jotai';
import {
  isModalVisibleAtom,
  modalContentAtom,
  modalTitleAtom,
} from '../../components/GlobalModal';
import { useBlockchainExplorerLinkGenerator } from './useBlockchainExplorerLinkGenerator';

export function useGlobalModal() {
  const [, setIsModalVisible] = useAtom(isModalVisibleAtom);
  const [, setContent] = useAtom(modalContentAtom);
  const [, setTitle] = useAtom(modalTitleAtom);
  const linkGenerator = useBlockchainExplorerLinkGenerator();

  const launchModalWith = ({
    label,
    title,
    transactionHash,
  }: {
    title: string;
    label: string;
    transactionHash: string;
  }) => {
    setIsModalVisible(true);
    setTitle(title);
    setContent(
      <Flex alignItems="center">
        <Text>
          {label} Transaction hash:{' '}
          <Link
            href={linkGenerator({
              address: transactionHash,
              type: 'tx',
            })}
            target="_blank"
          >
            <Flex wordBreak="break-all" w="full" alignItems="center">
              <Text>
                {transactionHash}
                <ExternalLinkIcon ml={1} mb={1.5} />
              </Text>
            </Flex>
          </Link>
        </Text>
      </Flex>,
    );
  };

  return { launchModalWith };
}
