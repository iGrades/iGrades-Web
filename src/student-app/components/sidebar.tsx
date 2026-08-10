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
      <Box
        as="aside"
        display={{ base: "none", lg: "block" }}
        width="full"
        h="full"
        overflow="hidden"
        bg="white"
        px={4}
        py={10}
        shadow={"xs"}
        left={0}
        position="sticky"
        top="4px"
      >
        {parentsAsideElem.map((item, index) => {
          const isActive = currentStudentPage === item.value;
          const isRewards = item.value === "rewards";

          return (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={4}
              p={3}
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
              onClick={() => setCurrentStudentPage(item.value)}
            >
              <HStack gap={2}>
                <Icon as={item.icon} size="sm" color={isRewards ? "amber.600" : undefined} />
                <Text fontSize={"sm"} fontWeight={500}>
                  {item.label}
                </Text>
              </HStack>

              {isRewards && (
                <Badge
                  colorPalette="amber"
                  variant="solid"
                  borderRadius="full"
                  px={1.5}
                  fontSize="10px"
                  fontWeight="bold"
                >
                  {pointsBalance.toLocaleString()} Pts
                </Badge>
              )}
            </Box>
          );
        })}
      </Box>

      {/* medium and smaller screens floating nav */}
      <Box
        as="aside"
        display={{ base: "block", lg: "none" }}
        position="fixed"
        bottom={{ base: 0, md: 2 }}
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        borderRadius={{ base: "none", md: "2xl" }}
        boxShadow={{ base: "none", md: "xl" }}
        px={{ base: 0, md: 1 }}
        py={{ base: 0, md: 1 }}
        mt={40}
        maxW="lg"
        width={{ base: "100%", md: "90%" }}
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
