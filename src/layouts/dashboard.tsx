import React from "react";
import { Button, HStack, Box, Flex } from "@chakra-ui/react";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";

type Props = {
  renderPage: () => React.ReactNode;
};

const DashboardLayout = ({renderPage}: Props) => {  

  return (
    <StudentsDataProvider>
      <Box as="main" w="full" bg="textFieldColor">

        {renderPage()}
      </Box>
    </StudentsDataProvider>
  );
};

export default DashboardLayout;
 