import React from "react";
import { Button, HStack, Box, Flex } from "@chakra-ui/react";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";

type Props = {
  renderPage: () => React.ReactNode;
};

const DashboardLayout = ({renderPage}: Props) => {  

  return (
    <UserProvider>
    <StudentsDataProvider>
      <Box as="main" w="full" h='screen' p={{base: '1', md:'4'}}>
        {renderPage()}
      </Box>
    </StudentsDataProvider>
    </UserProvider>
  );
};

export default DashboardLayout;
 