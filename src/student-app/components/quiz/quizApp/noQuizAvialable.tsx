import { Box, Heading, Text, Button } from "@chakra-ui/react";
import type { Subject } from "./types";

interface NoQuizAvailableProps {
  subject: Subject;
  onCancel: () => void;
}

export const NoQuizAvailable = ({
  subject,
  onCancel,
}: NoQuizAvailableProps) => {
  return (
    <Box p={4} bg="white" borderRadius="lg" minH="75vh">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={4}
        minH="60vh"
      >
        <Heading size="lg" color="gray.600">
          No Quiz Available
        </Heading>
        <Text fontSize="xl" textAlign="center">
          No quiz available for {subject.displayName} currently.
        </Text>
        <Button colorScheme="blue" onClick={onCancel}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};
