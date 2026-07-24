import { Box, Heading, Flex, Text, Icon, Switch, VStack } from "@chakra-ui/react";
import { BiSolidNotification } from "react-icons/bi";
import { useState } from "react";

const Notification = () => {
  const [checked, setChecked] = useState(false);
  
  return (
    <Box 
      bg="white" 
      rounded="2xl" 
      shadow="sm" 
      p={{ base: 4, md: 6 }} 
      h={{ base: "auto", md: "70vh" }} 
      minH={{ base: "300px", md: "500px" }}
      mb={{ base: "100px", lg: 10 }}
    >
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={2}
        mb={{ base: 6, md: 10 }}
        fontSize={{ base: "lg", md: "xl" }}
      >
        Notifications
      </Heading>

      <Flex
        direction={{ base: "column", sm: "row" }} 
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        p={{ base: 4, md: 8 }}
        bg="textFieldColor"
        rounded="xl"
        gap={4}
      >
        <Flex align="center" gap={4} flex="1">
          <Icon
            bg="green.100"
            boxSize={{ base: "40px", md: "48px" }}
            color="green.500"
            rounded="xl"
            p={2.5}
            flexShrink={0}
          >
            <BiSolidNotification />
          </Icon>
          <VStack align="start" gap={0} overflow="hidden">
            <Heading as="h4" fontSize={{ base: "md", md: "lg" }}>
              App Notifications
            </Heading>
            <Text 
              fontSize="xs" 
              color="gray.500" 
              lineHeight="tall"
              maxW={{ base: "full", md: "80%" }}
            >
              Toggle notifications on or off to control the alerts you receive.
            </Text>
          </VStack>
        </Flex>

        <Box py={{ base: 2, sm: 0 }} alignSelf={{ base: "flex-end", sm: "center" }}>
          <Switch.Root
            checked={checked}
            onCheckedChange={(e) => setChecked(e.checked)}
            colorPalette='blue'
            size="lg" 
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </Box>
      </Flex>
    </Box>
  );
};

export default Notification;