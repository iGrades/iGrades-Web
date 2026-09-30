import React from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  renderPage: () => React.ReactNode;
};

const Dashboard = ({ renderPage }: Props) => {
  return (
    <>
      <Box as="main" w="full" minH="100%" h="auto" p={{ base: "2", sm: "3", md: "4" }} pb={{ base: "24", md: "6" }}>
        {renderPage()}
      </Box>
    </>
  );
};

export default Dashboard;
