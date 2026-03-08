import type { Dispatch, SetStateAction } from "react"
import { Button, Icon } from "@chakra-ui/react"; // Added Icon for better alignment
import { AiOutlineUserAdd } from "react-icons/ai";

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
          border="1px solid"
          borderColor="blue.600"
          borderRadius="3xl"
          boxShadow='md'
        
          p={{ base: 6, md: 5 }} 
          w={{
            base: `${basePageWidth}%`,
            md: `${mdPageWidth}%`,
            lg: `${lgPageWidth}%`,
          }}
        
          fontSize={{ base: "sm", md: "xs" }} 
          fontWeight="semibold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2} 
          _active={{ transform: "scale(0.96)" }} 
          onClick={() => setShowBox(!showBox)}
        >
          <Icon as={AiOutlineUserAdd} boxSize={{ base: "18px", md: "14px" }} />
          Add New Child
        </Button>
      )}
    </>
  );
};

export default AddGraderBtn;