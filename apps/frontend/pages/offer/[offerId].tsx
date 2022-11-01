import { GetStaticPropsContext } from 'next/types';
import InferNextPropsType from 'infer-next-props-type';
import CommonLayout from '../../components/CommonLayout';
import { Heading, Flex, Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Link from 'next/link';

const OfferPreview = dynamic(() => import('../../components/offer/OfferPreview'), {
  ssr: false,
});

function OfferPage({ offerId }: InferNextPropsType<typeof getStaticProps>) {
  return (
    <CommonLayout>
      <Box mt={2} maxW="fit-content">
        <Link href="/">
          <Flex align="center">
            <ArrowBackIcon mr={1} /> Go back to offer list
          </Flex>
        </Link>
      </Box>
      <Heading size="lg" textAlign="center">
        Offer #{offerId}
      </Heading>
      <OfferPreview orderId={offerId} />
    </CommonLayout>
  );
}

export function getStaticProps({ params }: GetStaticPropsContext) {
  if (!params || !params.offerId) {
    return {
      notFound: true,
    };
  }

  const offerId = parseInt(params.offerId as string, 10);
  if (isNaN(offerId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      offerId: offerId,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export default OfferPage;
