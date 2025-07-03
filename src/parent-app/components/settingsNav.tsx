import { Flex, Box, Text } from "@chakra-ui/react";
import type React from "react";

type Props = {
  settingsState: string | null;
  setSettingsState: React.Dispatch<React.SetStateAction<string | null>>;
};

const SettingsNav = ({ settingsState, setSettingsState }: Props) => {
  const navItems = [
    { text: "My iGrade", state: "igrade" },
    { text: "Security", state: "security" },
    { text: "Notification", state: "notification" },
  ];
  return (
    <Flex as="nav" justify="start" align="center" gap={4} p={4}>
      {navItems.map((item, idx) => (
        <Box
          key={idx}
          bg="blue.100"
          p={2}
          rounded="xl"
          w={32}
          textAlign="center"
          cursor='pointer'
          onClick={() => setSettingsState(item.state)}
        >
          <Text color="primaryColor" fontSize="sm" fontWeight={400}>
            {item.text}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

export default SettingsNav;
