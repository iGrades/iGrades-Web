import React from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  renderPage: () => React.ReactNode;
};

const Dashboard = ({ renderPage }: Props) => {
  return (
    <>
      <Box as="main" w="full" h="screen" p={{ base: "1", md: "4" }}>
        {renderPage()}
      </Box>
    </>
  );
};

export default Dashboard;
