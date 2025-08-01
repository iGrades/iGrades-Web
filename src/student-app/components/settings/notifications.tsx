import { Box, Heading, Flex, Text, Icon, Switch } from "@chakra-ui/react";
import { BiSolidNotification } from "react-icons/bi";
import { useState } from "react";

const Notifications = () => {
  // const [notificationOn, setNotificationOn] = useState(false)
  const [checked, setChecked] = useState(false);
  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">


      <Flex
        justify="space-between"
        align="center"
        p={{ base: "3", md: "8", lg: "10" }}
        bg="textFieldColor"
        rounded="lg"
        shadow="xs"
      >
        <Flex align="center" justify="center" gap={4}>
          <Icon
            bg="green.100"
            boxSize="40px"
            color="green.400"
            rounded="lg"
            p={2}
          >
            <BiSolidNotification />
          </Icon>
          <Box>
            <Heading as="h4" fontSize="lg">
              Notifications
            </Heading>
            <Text fontSize="xs">
              Toggle notifications on or off to control the notifications coming
              in
            </Text>
          </Box>
        </Flex>

        <Switch.Root
          checked={checked}
          onCheckedChange={(e) => setChecked(e.checked)}
          colorPalette='blue'
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
      </Flex>
    </Box>
  );
};

export default Notifications;
