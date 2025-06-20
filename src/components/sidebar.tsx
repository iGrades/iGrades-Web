import React from "react";
import { Box, Icon, Text } from "@chakra-ui/react";
import { RiHome5Fill } from "react-icons/ri";
import { useNavigationStore } from "../store/usenavigationStore";
import type { IconType } from "react-icons";
import type { Page } from "../store/usenavigationStore";

type Props = []

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useNavigationStore();
  const parentsAsideElem: {icon: IconType, label: string, value: Page}[]  = [
    { icon: RiHome5Fill, label: "Home", value: "home" },
    { icon: RiHome5Fill, label: "Students", value: "student" },
    { icon: RiHome5Fill, label: "Settings", value: "settings" },
  ];

  
  
  return (
    <Box
      as="aside"
      width="250px"
      height="100vh"
      bg="gray.100"
      p={4}
      boxShadow="md"
      top={0}
      left={0}
    >
      {parentsAsideElem.map((item, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          mb={4}
          cursor="pointer"
          _hover={{ bg: "gray.200", borderRadius: "md" }}
          bg={currentPage === item.value ? "gray.300" : "transparent"}
          onClick={() => setCurrentPage(item.value)}
        >
          <Icon as={item.icon} size="sm" />
          <Text>{item.label}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;
