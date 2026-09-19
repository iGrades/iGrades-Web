import { useState } from "react";
import { Box, Icon, Text, Flex, IconButton, HStack } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PiStudentDuotone } from "react-icons/pi";
import { TbHomeFilled } from "react-icons/tb";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { ParentPage } from "../../store/usenavigationStore";

const Sidebar = () => {
  const { currentParentPage, setCurrentParentPage } = useNavigationStore();
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState<ParentPage | null>(null);
  const [clickedItem, setClickedItem] = useState<ParentPage | null>(null);

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: ParentPage;
  }[] = [
    { icon: TbHomeFilled, label: t("nav_home"), value: "home" },
    { icon: PiStudentDuotone, label: t("nav_students"), value: "student" },
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
          const isClicked = clickedItem === item.value;
          const showTabletText = isHovered || isClicked;

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
              bg={isActive ? "#206CE11A" : "transparent"}
              _hover={{ bg: "#206CE10D" }} 
              transition="all 0.2s"
              onMouseEnter={() => setHoveredItem(item.value)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                setCurrentParentPage(item.value);
                setClickedItem(item.value);
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

              {/* Tablet layout: Icon centered, with text shown only on hover and clicking */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                display={{ base: "none", md: "flex", lg: "none" }}
                w="full"
                position="relative"
              >
                <Icon as={item.icon} boxSize="20px" />

                {/* On tablet: text label shown only on hover or clicking */}
                {showTabletText && (
                  <Text
                    fontSize="10px"
                    fontWeight="600"
                    lineHeight="1.1"
                    mt={1}
                    textAlign="center"
                    whiteSpace="nowrap"
                    maxW="64px"
                    noOfLines={1}
                  >
                    {item.label}
                  </Text>
                )}

                {/* Floating pill flyout on tablet hover/click for clear readability */}
                {showTabletText && (
                  <Box
                    position="absolute"
                    left="calc(100% + 12px)"
                    top="50%"
                    transform="translateY(-50%)"
                    bg="gray.900"
                    color="white"
                    px={2.5}
                    py={1.5}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="600"
                    whiteSpace="nowrap"
                    boxShadow="md"
                    zIndex={1200}
                    pointerEvents="none"
                  >
                    {item.label}
                  </Box>
                )}
              </Flex>
            </Box>
          );
        })}
      </Box>

      {/* Mobile devices ONLY bottom navigation */}
      <Box
        as="aside"
        display={{ base: "block", md: "none" }}
        position="fixed"
        bottom={0}
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        borderRadius="none"
        boxShadow="none"
        borderTop="1px solid"
        borderColor="gray.200"
        px={0}
        py={0}
        width="100%"
        zIndex={1000}
      >
        <Flex 
          justify="space-around" 
          align="center" 
          maxW="md" 
          mx="auto"
        >
          {parentsAsideElem.map(({ icon, label, value }) => {
            const isActive = currentParentPage === value;
            return (
              <Flex
                key={label}
                direction="column"
                align="center"
                justify="center"
                flex="1"
                cursor="pointer"
                py={1}
                onClick={() => setCurrentParentPage(value)}
              >
                <IconButton
                  aria-label={label}
                  variant="ghost"
                  size="md" 
                  fontSize="22px"
                  color={isActive ? "blue.700" : "fieldTextColor"}
                  bg={isActive ? "blue.50" : "transparent"}
                  borderRadius="xl"
                  mb={1}
                  _active={{ bg: "blue.100" }}
                >
                  <Icon as={icon} />
                </IconButton>
                <Text 
                  fontSize="10px" 
                  fontWeight={isActive ? "bold" : "medium"}
                  color={isActive ? "blue.700" : "fieldTextColor"}
                >
                  {label}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;