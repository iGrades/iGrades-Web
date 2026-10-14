import { Flex, Box, Text } from "@chakra-ui/react";
import type React from "react";

type Props = {
  settingsState: string | null;
  setSettingsState: React.Dispatch<React.SetStateAction<string | null>>;
};

const SettingsNav = ({ settingsState, setSettingsState }: Props) => {
  const navItems = [
    { text: "My Profile", state: "igrade" },
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
      borderColor="gray.100"
      bg="white"
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
            bg={isActive ? "blue.50" : "transparent"}
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
              color={isActive ? "#206CE1" : "gray.600"} 
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