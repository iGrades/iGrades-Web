import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useUser } from "./context/parentDataContext";
import { Spinner } from "@chakra-ui/react";

type Props = {
  renderPage: () => React.ReactNode;
};

const DashboardLayout = ({ renderPage }: Props) => {
  const { loading } = useUser();

  return (
    <>
      <Box as="main" w="full" h="screen" p={{ base: "1", md: "4" }}>
        {renderPage()}
      </Box>
    </>
  );
};

export default DashboardLayout;
