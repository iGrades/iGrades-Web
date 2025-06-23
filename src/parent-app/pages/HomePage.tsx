import React, {useState, useEffect} from 'react'
import { Flex } from '@chakra-ui/react'
import Children from '../layouts/children'
import MyChildren from '../layouts/myChildren'
import { supabase } from "@/lib/supabaseClient";
type Props = {}

const HomePage = (props: Props) => {
  
  return (
    <Flex w="95%" m="auto" direction="column">
      <Children />
      <MyChildren />
    </Flex>
  );
}

export default HomePage