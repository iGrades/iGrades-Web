import { Box, Heading, Text, Button, Icon, Alert } from "@chakra-ui/react"
import { LuLogOut } from "react-icons/lu";
import { useState } from "react";

type Props = {
head: string;
info: string;
firstBtnText: string;
secondBtnText: string;
clickFunc: ()=> void;
setIsPopOver?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Popover = ({head, info, firstBtnText, secondBtnText, clickFunc, setIsPopOver }: Props) => {
     const [alert, setAlert] = useState<{
        type: "success" | "error";
        message: string;
      } | null>(null);
    
  return (
    <>
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
          {/* warning texts */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
            alignItems="center"
          >
            <Icon
              bg="blue.100"
              boxSize="70px"
              color="primaryColor"
              rounded="full"
              mb={5}
              p={2}
            >
              <LuLogOut />
            </Icon>
            <Heading as="h1" color="backgroundColor2" my={2}>
             {head}
            </Heading>
            <Text
              fontSize="xs"
              color="on_containerColor"
              textAlign="center"
              w={{ base: "100%", md: "80%" }}
              mb="2"
            >
             {info}
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
            {/* Logout button */}
            <Button
              bg="white"
              color="primaryColor"
              borderColor="primaryColor"
              borderRadius="3xl"
              outline="none"
              p={6}
              w={"100%"}
              fontSize={"sm"}
              fontWeight={500}
              _hover={{ bg: "primaryColor", color: "white" }}
              onClick={clickFunc}
            >
              {firstBtnText}
            </Button>

            {/* Cancel button */}
            <Button
              bg="white"
              color="blue.600"
              borderColor="blue.600"
              borderRadius="3xl"
              outline="none"
              p={6}
              w={"100%"}
              fontSize={"sm"}
              fontWeight={500}
              _hover={{ bg: "primaryColor", color: "white" }}
              onClick={() => setIsPopOver && setIsPopOver(false)}
            >
              {secondBtnText}
            </Button>
          </Box>
        </Box>
      </Box>

      {alert && (
        <Alert.Root status={alert.type} variant="subtle" mt={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {alert.type === "error" ? "Error!" : "Success!"}
            </Alert.Title>
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
};

export default Popover