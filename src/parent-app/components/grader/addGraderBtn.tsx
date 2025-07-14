import React from "react";
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@chakra-ui/react";
import { AiOutlineUserAdd } from "react-icons/ai";
import { LiaUserTimesSolid } from "react-icons/lia";

type Props = {
  showBox: boolean;
  setShowBox: Dispatch<SetStateAction<boolean>>;
  basePageWidth: number;
  mdPageWidth: number;
  lgPageWidth: number;
};

const AddGraderBtn = ({ showBox, setShowBox, basePageWidth, mdPageWidth, lgPageWidth}: Props) => {
  return (
    <>
      {!showBox && (
        <Button
          bg="white"
          color="blue.600"
          borderColor="blue.600"
          borderRadius="3xl"
          outline="none"
          boxShadow='md'
          p={5}
          w={{
            base: `${basePageWidth}%`,
            md: `${mdPageWidth}%`,
            lg: `${lgPageWidth}%`,
          }}
          fontSize={"xs"}
          onClick={() => setShowBox(!showBox)}
        >
          <AiOutlineUserAdd fontSize={"xs"} />
          Add New Child
        </Button>
      )}
    </>
  );
};

export default AddGraderBtn;
