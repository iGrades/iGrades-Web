import { Flex, Box, Text } from "@chakra-ui/react";
import type React from "react";

type Props = {
  learnState: string | null;
  setLearnState: React.Dispatch<React.SetStateAction<string | null>>;
};

const LearnNav = ({ learnState, setLearnState }: Props) => {
  const navItems = [
    { text: "Subjects", state: "subjects" },
    { text: "Past Questions", state: "pqs" },
    { text: "PDFs", state: "pdfs" },
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
      mt={2}
      mb={5}
    >
      {navItems.map((item, idx) => (
        <Box
          key={idx}
          bg={learnState === item.state ? "#206CE11A" : 'transparent'}
          p={2}
          rounded="md"
          w={32}
          textAlign="center"
          cursor="pointer"
          onClick={() => setLearnState(item.state)}
        >
          <Text color="primaryColor" fontSize="xs" fontWeight={600}>
            {item.text}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

export default LearnNav;
