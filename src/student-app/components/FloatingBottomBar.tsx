import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { TbHomeFilled } from "react-icons/tb";
import { IoNewspaper } from "react-icons/io5";
import { TbBrandYoutubeFilled } from "react-icons/tb";
import { PiSparkleFill } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
import { useNavigationStore, type StudentPage } from "@/store/usenavigationStore";
import { useTranslation } from "react-i18next";
import { usePointsSystem } from "../hooks/usePointsSystem";
import type { IconType } from "react-icons";

interface NavItem {
  icon: IconType;
  label: string;
  value: StudentPage;
  badge?: string | number;
}

export const FloatingBottomBar = () => {
  const { currentStudentPage, setCurrentStudentPage } = useNavigationStore();
  const { t } = useTranslation();
  const { pointsBalance } = usePointsSystem();

  const formattedPoints =
    pointsBalance > 999 ? `${(pointsBalance / 1000).toFixed(1)}k` : pointsBalance;

  // The 5 primary destinations in exact requested order:
  // 1. Home, 2. Quiz, 3. Learn, 4. Chat, 5. IGG Points
  const navItems: NavItem[] = [
    {
      icon: TbHomeFilled,
      label: t("nav_home") || "Home",
      value: "home",
    },
    {
      icon: IoNewspaper,
      label: t("nav_quiz") || "Quiz",
      value: "quiz",
    },
    {
      icon: TbBrandYoutubeFilled,
      label: t("nav_learn") || "Learn",
      value: "learn",
    },
    {
      icon: PiSparkleFill,
      label: "Chat",
      value: "chat",
    },
    {
      icon: FiAward,
      label: "IGG Points",
      value: "rewards",
      badge: formattedPoints,
    },
  ];

  return (
    <Box
      as="nav"
      aria-label="Mobile Bottom Navigation"
      role="tablist"
      display={{ base: "block", md: "none" }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      w="full"
      bg="rgba(255, 255, 255, 0.98)"
      backdropFilter="blur(20px)"
      borderTop="1px solid"
      borderColor="gray.200"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
      px={1}
      pt={1.5}
      pb="max(env(safe-area-inset-bottom, 8px), 8px)"
      zIndex={1000}
    >
      <Flex justify="space-around" align="center" w="full">
        {navItems.map((item) => {
          const isActive = currentStudentPage === item.value;
          const isChat = item.value === "chat";
          const isRewards = item.value === "rewards";

          // Dynamic colors per tab type
          let activeBg = "blue.50";
          let activeColor = "blue.600";
          let activeDotBg = "blue.600";

          if (isChat) {
            activeBg = "purple.50";
            activeColor = "purple.600";
            activeDotBg = "purple.600";
          } else if (isRewards) {
            activeBg = "amber.50";
            activeColor = "amber.700";
            activeDotBg = "amber.600";
          }

          return (
            <Flex
              key={item.value}
              as="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              direction="column"
              align="center"
              justify="center"
              flex="1"
              minH="50px"
              py={1}
              px={1}
              cursor="pointer"
              border="none"
              bg="transparent"
              outline="none"
              position="relative"
              transition="transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease"
              _active={{ transform: "scale(0.92)" }}
              onClick={() => setCurrentStudentPage(item.value)}
            >
              <Box
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="38px"
                h="28px"
                borderRadius="full"
                bg={isActive ? activeBg : "transparent"}
                transition="all 0.2s ease"
              >
                <Icon
                  as={item.icon}
                  boxSize="20px"
                  color={isActive ? activeColor : "gray.500"}
                  transition="color 0.15s ease"
                />

                {/* Points badge on IGG Points tab */}
                {isRewards && item.badge !== undefined && (
                  <Box
                    position="absolute"
                    top="-3px"
                    right="-7px"
                    bg="amber.500"
                    color="white"
                    fontSize="9px"
                    fontWeight="bold"
                    px={1.5}
                    py={0.2}
                    borderRadius="full"
                    boxShadow="0 1px 3px rgba(217, 119, 6, 0.4)"
                    lineHeight="1.2"
                  >
                    {item.badge}
                  </Box>
                )}

                {/* Subtle sparkle indicator on Chat tab */}
                {isChat && !isActive && (
                  <Box
                    position="absolute"
                    top="0px"
                    right="2px"
                    w="5px"
                    h="5px"
                    borderRadius="full"
                    bg="purple.400"
                    boxShadow="0 0 4px rgba(168, 85, 247, 0.6)"
                  />
                )}
              </Box>

              <Text
                fontSize="11px"
                fontWeight={isActive ? "700" : "500"}
                letterSpacing="-0.01em"
                color={isActive ? activeColor : "gray.500"}
                mt={0.5}
                lineHeight="1.2"
                transition="color 0.15s ease"
              >
                {item.label}
              </Text>

              {/* Active pill indicator dot */}
              {isActive && (
                <Box
                  position="absolute"
                  bottom="1px"
                  w="14px"
                  h="2.5px"
                  borderRadius="full"
                  bg={activeDotBg}
                />
              )}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default FloatingBottomBar;
