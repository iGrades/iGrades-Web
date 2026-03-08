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
      gap={2} 
      p={1.5}
      shadow="md"
      bg="white"
      rounded="md"
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
        const isActive = settingsState === item.state;
        return (
          <Box
            key={idx}
            bg={isActive ? "#206CE11A" : "transparent"}
            py={2}
            px={4} 
            rounded="md"
            minW={{ base: "max-content", md: "110px" }}
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s"
            _active={{ transform: "scale(0.95)" }}
            onClick={() => setSettingsState(item.state)}
          >
            <Text
              color={isActive ? "primaryColor" : "gray.500"} 
              fontSize={{ base: "xs", md: "sm" }}
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