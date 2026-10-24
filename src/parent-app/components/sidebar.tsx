import { useState } from "react";
import { Box, Icon, Text, Flex, HStack } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PiStudentDuotone } from "react-icons/pi";
import { TbHomeFilled } from "react-icons/tb";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { ParentPage } from "../../store/usenavigationStore";

const Sidebar = () => {
  const { currentParentPage, setCurrentParentPage } = useNavigationStore();
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState<ParentPage | null>(null);

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: ParentPage;
  }[] = [
    { icon: TbHomeFilled, label: t("nav_home"), value: "home" },
    { icon: PiStudentDuotone, label: t("nav_students"), value: "student" },
    { icon: BsFileEarmarkBarGraphFill, label: "Reports", value: "weekly_report" },
    { icon: AiTwotoneSetting, label: t("nav_settings"), value: "settings" },
  ];

  return (
    <>
      {/* Tablet & Desktop Sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "block" }}
        width="full"
        h="full"
        overflow="visible"
        bg="white"
        px={{ base: 4, md: 2, lg: 4 }}
        py={{ base: 10, md: 6, lg: 10 }}
        shadow={"xs"}
        left={0}
        position="sticky"
        top="4px"
      >
        {parentsAsideElem.map((item, index) => {
          const isActive = currentParentPage === item.value;
          const isHovered = hoveredItem === item.value;

          return (
            <Box
              key={index}
              position="relative"
              display="flex"
              flexDirection={{ base: "row", md: "column", lg: "row" }}
              alignItems="center"
              justifyContent={{ base: "flex-start", md: "center", lg: "flex-start" }}
              mb={4}
              p={{ base: 3, md: 2.5, lg: 3 }}
              minH={{ md: "52px", lg: "auto" }}
              borderRadius="lg"
              cursor="pointer"
              color={
                isActive
                  ? "primaryColor"
                  : "fieldTextColor"
              }
              bg={isActive ? "#206CE11A" : isHovered ? "#206CE10D" : "transparent"}
              _hover={{ bg: "#206CE10D" }} 
              transition="all 0.2s"
              onMouseEnter={() => setHoveredItem(item.value)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                setCurrentParentPage(item.value);
              }}
            >
              {/* Desktop layout: Icon + Text in HStack */}
              <HStack
                gap={2}
                display={{ base: "none", lg: "flex" }}
                align="center"
                w="full"
              >
                <Icon as={item.icon} boxSize="20px" />
                <Text mx={1} fontSize={"sm"} fontWeight={500}>
                  {item.label}
                </Text>
              </HStack>

              {/* Tablet layout: Touch-friendly icon + always-visible label */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                display={{ base: "none", md: "flex", lg: "none" }}
                w="full"
                position="relative"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="42px"
                  h="28px"
                  borderRadius="full"
                  bg={isActive ? "blue.50" : "transparent"}
                  transition="all 0.2s ease"
                >
                  <Icon
                    as={item.icon}
                    boxSize="20px"
                    color={isActive ? "#206CE1" : "gray.500"}
                  />
                </Box>

                <Text
                  fontSize="10.5px"
                  fontWeight={isActive ? "700" : "500"}
                  lineHeight="1.15"
                  mt={1}
                  textAlign="center"
                  whiteSpace="nowrap"
                  maxW="68px"
                  truncate
                  color={isActive ? "#206CE1" : "gray.600"}
                >
                  {item.label}
                </Text>

                {/* Left Active indicator bar on tablet rail */}
                {isActive && (
                  <Box
                    position="absolute"
                    left="-6px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="3px"
                    h="22px"
                    borderRadius="full"
                    bg="#206CE1"
                  />
                )}
              </Flex>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default Sidebar;