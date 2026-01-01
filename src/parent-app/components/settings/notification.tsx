import { Box, Heading, Flex, Text, Icon, Switch } from "@chakra-ui/react";
import { BiSolidNotification } from "react-icons/bi";
import { useState } from "react";

const Notification = () => {
  // const [notificationOn, setNotificationOn] = useState(false)
  const [checked, setChecked] = useState(false);
  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={10}
        mx={2}
      >
        {/* <LuArrowLeft /> */}
        Notifications
      </Heading>

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

export default Notification;
