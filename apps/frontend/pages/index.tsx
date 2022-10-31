import { Button, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import CommonLayout from '../components/CommonLayout';
import UserOffers from '../components/offer/userOffers/UserOffers';
const LatestOffers = dynamic(
  () => import('../components/offer/latestOffers/LatestOffers'),
  {
    ssr: false,
  },
);

export default function Home() {
  const router = useRouter();
  return (
    <CommonLayout>
      <Flex justify="center">
        <Button mt={6} colorScheme="pink" onClick={() => router.push('/create')}>
          Create offer
        </Button>
      </Flex>
      <Tabs colorScheme="pink" isFitted mt={2}>
        <TabList>
          <Tab>Latest Offers</Tab>
          <Tab>My offers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <LatestOffers />
          </TabPanel>
          <TabPanel>
            <UserOffers />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </CommonLayout>
  );
}
