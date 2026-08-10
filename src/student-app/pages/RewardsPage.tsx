import React from "react";
import { Box, Container } from "@chakra-ui/react";
import { PointsWidget } from "../components/rewards/PointsWidget";

export const RewardsPage: React.FC = () => {
  return (
    <Box py={4} px={{ base: 2, md: 6 }}>
      <Container maxW="7xl">
        <PointsWidget />
      </Container>
    </Box>
  );
};

export default RewardsPage;
