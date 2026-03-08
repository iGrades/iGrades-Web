import { Box, Button, Text, Icon, Heading, VStack } from "@chakra-ui/react";
import { FaCircleCheck } from "react-icons/fa6";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setShowBox: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
};

const UpdateParentSuccessPopover = ({ setShowBox, onClose }: Props) => {
  const handleBoxes = () => {
    setShowBox(false);
    setTimeout(() => onClose(), 500); 
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={5000}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: 4, md: 8 }}
    >
      <Box
        position="relative"
        width={{ base: "100%", sm: "85%", md: "60%", lg: "35%" }}
        maxH="90vh"
        bg="white"
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 6, md: 10 }}
        textAlign="center"
      >
        <VStack spacing={4}>
          <Icon
            bg="green.50"
            boxSize={{ base: "60px", md: "70px" }}
            color="green.500"
            rounded="full"
            p={3}
          >
            <FaCircleCheck size="100%" />
          </Icon>

          <Heading 
            as="h1" 
            fontSize={{ base: "xl", md: "2xl" }} 
            color="backgroundColor2"
          >
            Profile Updated
          </Heading>

          <Text
            fontSize={{ base: "sm", md: "xs" }}
            color="gray.600"
            maxW="90%"
            lineHeight="tall"
          >
            You have successfully updated your profile details.
          </Text>

          <Box w="full" pt={4}>
            <Button
              bg="primaryColor"
              color="white"
              borderRadius="3xl"
              h="55px"
              w="full"
              fontSize="sm"
              fontWeight="bold"
              _active={{ transform: "scale(0.97)" }}
              onClick={handleBoxes}
            >
              Done
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default UpdateParentSuccessPopover;