import { Flex, Box, Text } from "@chakra-ui/react";
import type React from "react";

type Props = {
  settingsState: string | null;
  setSettingsState: React.Dispatch<React.SetStateAction<string | null>>;
};

const SettingsNav = ({ settingsState, setSettingsState }: Props) => {
  const navItems = [
    { text: "My Profile", state: "profile" },
    { text: "Language", state: "language" },
    { text: "Subscription", state: "subscription" },
    { text: "Security", state: "security" },
    { text: "Notifications", state: "notification" },
    { text: "Help & FAQs", state: "support" },
  ];

  return (
    <Flex
      as="nav"
      justify="start"
      align="center"
      gap={1.5} 
      p={1.5}
      shadow="xs"
      border="1px solid"
      borderColor={{ base: "gray.100", _dark: "#262626" }}
      bg={{ base: "white", _dark: "#121212" }}
      rounded="xl"
      w="full"
      overflowX="auto"
      whiteSpace="nowrap"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {navItems.map((item, idx) => {
        const isActive =
          settingsState === item.state ||
          (item.state === "igrade" && settingsState === "profile") ||
          (item.state === "support" && (settingsState === "help" || settingsState === "faqs"));
        return (
          <Box
            key={idx}
            bg={isActive ? { base: "blue.50", _dark: "rgba(37, 99, 235, 0.25)" } : "transparent"}
            py={2}
            px={3.5} 
            rounded="lg"
            minW={{ base: "max-content", md: "100px" }}
            textAlign="center"
            cursor="pointer"
            transition="all 0.15s ease"
            _active={{ transform: "scale(0.95)" }}
            onClick={() => setSettingsState(item.state)}
          >
            <Text
              color={isActive ? { base: "#206CE1", _dark: "#60A5FA" } : { base: "gray.600", _dark: "gray.400" }} 
              fontSize="xs"
              fontWeight={isActive ? 700 : 500}
            >
              {item.text}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
};

export default SettingsNav;