import { Flex, Box, Text } from "@chakra-ui/react";
import type React from "react";

type Props = {
  settingsState: string | null;
  setSettingsState: React.Dispatch<React.SetStateAction<string | null>>;
};

const SettingsNav = ({ settingsState, setSettingsState }: Props) => {
  const navItems = [
    { text: "Profile", state: "profile" },
    { text: "Security", state: "security" },
    { text: "Notifications", state: "notification" },
    { text: "Subscription", state: "subscription" },
  ];
  return (
    <Flex
      as="nav"
      justify="start"
      align="center"
      gap={4}
      p={4}
      bg="white"
      shadow="sm"
      rounded="md"
      w="full"
      m="auto"
      mb={5}
    >
      {navItems.map((item, idx) => (
        <Box
          key={idx}
          bg={settingsState === item.state ? "#206CE11A" : 'transparent'}
          p={2}
          rounded="md"
          w={28}
          textAlign="center"
          cursor="pointer"
          onClick={() => setSettingsState(item.state)}
        >
          <Text color="primaryColor" fontSize="xs" fontWeight={600}>
            {item.text}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

export default SettingsNav;
