import { SearchIcon } from '@chakra-ui/icons';
import { InputGroup, InputLeftElement, Input, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

function SearchBar() {
  const router = useRouter();
  const [searchedId, setSearchedId] = useState('');
  return (
    <InputGroup colorScheme="pink" mr={[2, 6]}>
      <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
      <Input
        onChange={(e) => setSearchedId(e.target.value)}
        focusBorderColor="pink.500"
        type="number"
        placeholder="Find offer by ID..."
      />
      <Button
        disabled={!searchedId}
        ml={[1, 2]}
        colorScheme="pink"
        onClick={() => router.push(`/offer/${searchedId}`)}
      >
        <SearchIcon />
      </Button>
    </InputGroup>
  );
}

export default SearchBar;
