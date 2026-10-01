import React from "react";
import { Box } from "@chakra-ui/react";
import { PointsWidget } from "../components/rewards/PointsWidget";

export const RewardsPage: React.FC = () => {
  return (
    <Box w={{ base: "full", md: "95%" }} m="auto" py={4} mb={10}>
      <PointsWidget />
    </Box>
  );
};

export default RewardsPage;
