import { Box, Heading, Flex, Text, Icon } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { BiSolidNotification } from "react-icons/bi";
import { LiaToggleOffSolid } from "react-icons/lia";
import { LiaToggleOnSolid } from "react-icons/lia";
import { useState } from "react";

type Props = {};

const Notification = (props: Props) => {
  const [notificationOn, setNotificationOn] = useState(false)
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
        <LuArrowLeft />
        Notifications
      </Heading>

      <Flex
        justify="space-between"
        align="center"
        p={{ base: "3", md: "8", lg: "10" }}
        bg="textFieldColor"
        rounded="lg"
        shadow='xs'
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

        <Box>
          {notificationOn ? (
            <Icon
              boxSize={{ base: "40px", md: "45px" }}
              color="primaryColor"
              rounded="lg"
              p={2}
              cursor="pointer"
              fontSize="2xl"
            >
              <LiaToggleOnSolid onClick={() => setNotificationOn(false)} />
            </Icon>
          ) : (
            <Icon
              boxSize={{ base: "40px", md: "45px" }}
              color="fieldTextColor"
              rounded="lg"
              p={2}
              cursor="pointer"
            >
              <LiaToggleOffSolid onClick={() => setNotificationOn(true)} />
            </Icon>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Notification;
