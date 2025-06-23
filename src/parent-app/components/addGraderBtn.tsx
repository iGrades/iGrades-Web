import React from "react";
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@chakra-ui/react";
import { AiOutlineUserAdd } from "react-icons/ai";
type Props = {
  showBox: boolean;
  setShowBox: Dispatch<SetStateAction<boolean>>
};

const AddGraderBtn = ({showBox, setShowBox}: Props) => {
  return (
    <Button bg='white' color='blue.600' borderColor='blue.600' borderRadius='3xl' p={5} w='20%' fontSize={'xs'} onClick={()=> setShowBox(!showBox)}>
      <AiOutlineUserAdd fontSize={'xs'} />
      Add New Child
    </Button>
  );
};

export default AddGraderBtn;
