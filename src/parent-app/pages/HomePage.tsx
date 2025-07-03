
import { Flex } from '@chakra-ui/react'
import Children from '../layouts/children'
import MyChildren from '../layouts/myChildren'


const HomePage = () => {
  
  return (
    <Flex w="95%" m="auto" direction="column">
      <Children />
      <MyChildren />
    </Flex>
  );
}

export default HomePage