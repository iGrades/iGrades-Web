import { Box, Button, Text, Icon, Heading } from "@chakra-ui/react";
import { FaCircleCheck } from "react-icons/fa6";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setShowBox: Dispatch<SetStateAction<boolean>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const AddGraderSuccessPopover = ({ setShowBox, setShowModal }: Props) => {
  const handleBoxes = () => {
    setShowBox(false);
    setShowModal(false);
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={3000} 
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: "4", md: "8" }}
    >
      <Box
        position="relative"
        width={{ base: "100%", sm: "80%", md: "60%", lg: "35%" }} 
        maxH="90vh"
        bg="white"
        borderRadius="3xl" 
        boxShadow="2xl"
        p={{ base: "6", md: "10" }}
        textAlign="center"
      >
        {/* success content */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Icon
            bg="green.100"
            boxSize={{ base: "60px", md: "70px" }}
            color="green.500"
            rounded="full"
            mb={4}
            p={3}
          >
            <FaCircleCheck />
          </Icon>
          
          <Heading 
            as="h1" 
            fontSize={{ base: "xl", md: "2xl" }} 
            color="backgroundColor2" 
            mb={2}
          >
            Yes, Student added!
          </Heading>
          
          <Text
            fontSize={{ base: "sm", md: "xs" }} 
            color="on_containerColor"
            maxW={{ base: "100%", md: "80%" }}
            mb={6}
          >
            You have successfully added a student.
          </Text>
        </Box>

        {/* Action Button */}
        <Box w="full" px={{ base: 0, md: 4 }}>
          <Button
            bg="primaryColor"
            color="white"
            borderRadius="3xl"
            p={6}
            w="full"
            fontSize="sm"
            fontWeight={600}
            _active={{ transform: "scale(0.97)" }} 
            onClick={handleBoxes}
          >
            View your Students
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddGraderSuccessPopover;