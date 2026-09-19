import { useState } from "react";
import { Box, Icon, Text, Flex, IconButton, Badge, HStack } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { TbHomeFilled } from "react-icons/tb";
import { IoNewspaper } from "react-icons/io5";
import { TbBrandYoutubeFilled } from "react-icons/tb";
import { FiAward } from "react-icons/fi";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import { usePointsSystem } from "../hooks/usePointsSystem";
import type { IconType } from "react-icons";
import type { StudentPage } from "../../store/usenavigationStore";

const Sidebar = () => {
  const { currentStudentPage, setCurrentStudentPage } = useNavigationStore();
  const { t } = useTranslation();
  const { pointsBalance } = usePointsSystem();
  const [hoveredItem, setHoveredItem] = useState<StudentPage | null>(null);
  const [clickedItem, setClickedItem] = useState<StudentPage | null>(null);

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: StudentPage;
  }[] = [
    { icon: TbHomeFilled, label: t("nav_home"), value: "home" },
    { icon: IoNewspaper, label: t("nav_quiz"), value: "quiz" },
    { icon: TbBrandYoutubeFilled, label: t("nav_learn"), value: "learn" },
    { icon: FiAward, label: "IGG Points", value: "rewards" },
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
          const isActive = currentStudentPage === item.value;
          const isRewards = item.value === "rewards";
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
              justifyContent={{ base: "flex-start", md: "center", lg: "space-between" }}
              mb={3}
              p={{ base: 3, md: 2, lg: 3 }}
              minH={{ md: "52px", lg: "auto" }}
              borderRadius="lg"
              cursor="pointer"
              color={
                isActive
                  ? isRewards
                    ? "amber.700"
                    : "primaryColor"
                  : "fieldTextColor"
              }
              bg={
                isActive
                  ? isRewards
                    ? "amber.50"
                    : "#206CE11A"
                  : "transparent"
              }
              _hover={{ bg: isRewards ? "amber.50" : "gray.50" }}
              fontWeight={"400"}
              onMouseEnter={() => setHoveredItem(item.value)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                setCurrentStudentPage(item.value);
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
                <Icon as={item.icon} size="sm" color={isRewards ? "amber.600" : undefined} />
                <Text fontSize={"sm"} fontWeight={500}>
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
                <Icon
                  as={item.icon}
                  boxSize="20px"
                  color={isRewards ? "amber.600" : undefined}
                />

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

              {/* Rewards points badge */}
              {isRewards && (
                <>
                  {/* Desktop badge */}
                  <Badge
                    display={{ base: "none", lg: "inline-flex" }}
                    colorPalette="amber"
                    variant="solid"
                    borderRadius="full"
                    px={1.5}
                    fontSize="10px"
                    fontWeight="bold"
                  >
                    {pointsBalance.toLocaleString()} Pts
                  </Badge>

                  {/* Tablet mini indicator */}
                  <Box
                    display={{ base: "none", md: "block", lg: "none" }}
                    position="absolute"
                    top="4px"
                    right="8px"
                    w="6px"
                    h="6px"
                    bg="amber.500"
                    borderRadius="full"
                  />
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* mobile devices ONLY floating nav */}
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
        <Flex justify="space-between" align="center">
          {parentsAsideElem.map(({ icon, label, value }) => {
            const isActive = currentStudentPage === value;
            const isRewards = value === "rewards";

            return (
              <Flex
                key={label}
                direction="column"
                align="center"
                flex="1"
                p={1}
                cursor="pointer"
                fontWeight={"normal"}
                position="relative"
                onClick={() => setCurrentStudentPage(value)}
              >
                <Box position="relative">
                  <IconButton
                    aria-label={label}
                    variant="ghost"
                    size="lg"
                    fontSize="xl"
                    color={
                      isActive
                        ? isRewards
                          ? "amber.700"
                          : "blue.700"
                        : "fieldTextColor"
                    }
                    bg={
                      isActive
                        ? isRewards
                          ? "amber.100"
                          : "blue.50"
                        : "transparent"
                    }
                    borderRadius="xl"
                  >
                    <Icon as={icon} color={isRewards ? "amber.600" : undefined} />
                  </IconButton>

                  {isRewards && (
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-6px"
                      bg="amber.500"
                      color="white"
                      fontSize="9px"
                      fontWeight="bold"
                      px={1}
                      py={0.2}
                      borderRadius="full"
                      shadow="xs"
                    >
                      {pointsBalance > 999 ? `${(pointsBalance / 1000).toFixed(1)}k` : pointsBalance}
                    </Box>
                  )}
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight={isActive ? "bold" : "normal"}
                  color={isActive ? (isRewards ? "amber.800" : "blue.700") : "gray.600"}
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
