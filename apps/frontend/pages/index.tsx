import { Button, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import CommonLayout from '../components/CommonLayout';
import UserOffers from '../components/offer/userOffers/UserOffers';
import SearchBar from '../components/SearchBar';
import TokenFilter from '../components/TokenFilter';
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
      <Flex justify="center" align="center" mt={6}>
        <SearchBar />
        <Button colorScheme="pink" px={6} onClick={() => router.push('/create')}>
          Create offer
        </Button>
      </Flex>
      <Flex justify="center" align="center" mt={6}>
        <TokenFilter />
      </Flex>
      <Tabs colorScheme="pink" isFitted mt={2}>
        <TabList>
          <Tab>Latest Offers</Tab>
          <Tab>My offers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <LatestOffers />
          </TabPanel>
          <TabPanel px={0}>
            <UserOffers />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </CommonLayout>
  );
}
