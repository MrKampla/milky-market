import { Container } from '@chakra-ui/react';
import Header from './Header';

const CommonLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Container maxW="container.xl" p={[1, 4]}>
      <Header />
      {children}
    </Container>
  );
};

export default CommonLayout;
