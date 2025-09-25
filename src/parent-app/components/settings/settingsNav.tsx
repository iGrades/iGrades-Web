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
    { text: "Notifications", state: "notification" },
  ];
  return (
    <Flex
      as="nav"
      justify="start"
      align="center"
      gap={4}
      p={1}
      shadow='md'
      bg='white'
      rounded="sm"
      w="full"
      m="auto"
      mb={5}
      mt={{ base: 5, md: 0 }}
    >
      {navItems.map((item, idx) => (
        <Box
          key={idx}
          bg={settingsState === item.state ? "#f6f4ffff" : "transparent"}
          p={2}
          rounded="md"
          w={28}
          textAlign="center"
          cursor="pointer"
          onClick={() => setSettingsState(item.state)}
        >
          <Text
            color="primaryColor"
            fontSize={{ base: "xs", md: "xs" }}
            fontWeight={settingsState === item.state ? 600 : 500}
            // color={
            //   settingsState === item.state ? "primaryColor" : "fieldTextColor"
            // }
          >
            {item.text}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

export default SettingsNav;
