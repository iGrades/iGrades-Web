import {  Box, Heading } from "@chakra-ui/react";
import ProgressBar from "./progress";


const Analytics = () => {
  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w="full" m={5} p={4}>
      <Heading as="h2" mb={4} fontSize="xl">
        Learning Analytics
      </Heading>
      <ProgressBar
        value={80}
        size="sm"
        hasStripe
        isAnimated
        mb={4}
        text="Use of English"
      />
      <ProgressBar
        value={50}
        size="sm"
        hasStripe
        isAnimated
        mb={4}
        text="Chemistry"
      />
    </Box>
  );
};

export default Analytics;
