import React, { useState } from "react";
import { Box, Icon, Text, Flex, IconButton } from "@chakra-ui/react";
import { PiHouseLineDuotone } from "react-icons/pi";
import { AiTwotoneSetting } from "react-icons/ai";
import { PiStudentDuotone } from "react-icons/pi";
import { RiUserCommunityLine } from "react-icons/ri";
import { useNavigationStore } from "../store/usenavigationStore";
import type { IconType } from "react-icons";
import type { Page } from "../store/usenavigationStore";

type Props = [];

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useNavigationStore();

  const parentsAsideElem: { icon: IconType; label: string; value: Page }[] = [
    { icon: PiHouseLineDuotone, label: "Home", value: "home" },
    { icon: PiStudentDuotone, label: "Grader", value: "student" },
    { icon: AiTwotoneSetting, label: "Settings", value: "settings" },
  ];

  return (
    <>
      <Box
        as="aside"
        display={{ base: "none", lg: "block" }}
        width="full"
        h='full'
        overflow="hidden"
        bg="white"
        p={4}
        boxShadow="md"
        left={0}
        position="sticky"
        top="0"
        zIndex="1000"
      >
        {parentsAsideElem.map((item, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            mb={4}
            p={3}
            borderRadius="lg"
            cursor="pointer"
            color={currentPage === item.value ? "blue.700" : "fieldTextColor"}
            bg={currentPage === item.value ? "blue.50" : "transparent"}
            fontWeight={"normal"}
            onClick={() => setCurrentPage(item.value)}
          >
            <Icon as={item.icon} size="sm" />
            <Text mx={2} fontSize={"sm"}>
              {item.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* medium and smaller screens floating nav */}
      <Box
        as="aside"
        display={{ base: "block", lg: "none" }}
        position="fixed"
        bottom="4"
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        px={1}
        py={1}
        maxW="sm"
        width="90%"
        zIndex={1000}
      >
        <Flex justify="space-between" align="center">
          {parentsAsideElem.map(({ icon, label, value }) => (
            <Flex
              key={label}
              direction="column"
              align="center"
              flex="1"
              p={1}
              fontWeight={"normal"}
              onClick={() => setCurrentPage(value)}
            >
              <IconButton
                aria-label={label}
                variant="ghost"
                size="lg"
                fontSize="xl"
                color={currentPage === value ? "blue.700" : "fieldTextColor"}
                bg={currentPage === value ? "blue.50" : "transparent"}
                borderRadius="xl"
              >
                <Icon as={icon} />
              </IconButton>
              {/* <Text fontSize="xs">{label}</Text> */}
            </Flex>
          ))}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;
