import { Box, Alert, Button } from "@chakra-ui/react";

interface ErrorStateProps {
  error: string;
  onContinue: () => void;
}

export const ErrorState = ({ error, onContinue }: ErrorStateProps) => {
  return (
    <Box p={4} bg="white" borderRadius="lg" minH="75vh">
      <Alert.Root status="error" mb={4}>
        {error}
      </Alert.Root>
      <Button onClick={onContinue}>Continue</Button>
    </Box>
  );
};
