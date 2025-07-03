import { Box, Button, Text, Icon, Heading } from "@chakra-ui/react";
import { FaCircleCheck } from "react-icons/fa6";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setShowBox: Dispatch<SetStateAction<boolean>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const AddGraderSuccessPopover = ({ setShowBox, setShowModal }: Props) => {

    const handleBoxes = ()=> {
        setShowBox(false)
        setShowModal(false)
    }
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex={1000}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: "2", md: "4" }}
    >
      <Box
        position="relative"
        width={{ base: "95%", md: "80%", lg: "50%" }}
        maxH="90vh"
        overflowY="auto"
        bg="white"
        borderRadius="2xl"
        boxShadow="lg"
        p={{ base: "5", md: "10" }}
      >
        {/* success texts */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
          alignItems="center"
        >
          <Icon
            bg="green.100"
            boxSize="70px"
            color="green.400"
            rounded="full"
            mb={5}
            p={2}
          >
            <FaCircleCheck />
          </Icon>
          <Heading as="h1" fontSize="2xl" color="backgroundColor2" my={2}>
            Yes, Grader added!
          </Heading>
          <Text
            fontSize="xs"
            color="on_containerColor"
            textAlign="center"
            w={{ base: "100%", md: "80%" }}
            mb="2"
          >
            You have successfully added a grader
          </Text>
        </Box>

        {/* Buttons */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space between"
          alignItems="center"
          w={{ base: "100%", md: "90%" }}
          m="auto"
          my={5}
          gap={4}
        >
          {/* View grader button */}
          <Button
            bg="primaryColor"
            color="white"
            borderColor="primaryColor"
            borderRadius="3xl"
            outline="none"
            p={6}
            w={"100%"}
            fontSize={"sm"}
            fontWeight={500}
            onClick={handleBoxes}
          >
            View your Graders
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddGraderSuccessPopover;
