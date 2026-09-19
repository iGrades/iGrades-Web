import { Box, Text } from "@chakra-ui/react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Initializing quiz...",
}: LoadingStateProps) => {
  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      h="auto"
      py={16}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text>{message}</Text>
    </Box>
  );
};
