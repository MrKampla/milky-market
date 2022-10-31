import { GetStaticPropsContext } from 'next/types';
import InferNextPropsType from 'infer-next-props-type';
import CommonLayout from '../../components/CommonLayout';
import { Heading } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const OfferPreview = dynamic(() => import('../../components/offer/OfferPreview'), {
  ssr: false,
});

function OfferPage({ offerId }: InferNextPropsType<typeof getStaticProps>) {
  return (
    <CommonLayout>
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
