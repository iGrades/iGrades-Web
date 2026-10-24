import { useState } from "react";
import { Box, Icon, Text, Flex, Badge, HStack } from "@chakra-ui/react";
import { TbHomeFilled } from "react-icons/tb";
import { IoNewspaper } from "react-icons/io5";
import { TbBrandYoutubeFilled } from "react-icons/tb";
import { PiSparkleFill } from "react-icons/pi";
import { FiAward } from "react-icons/fi";
import { AiTwotoneSetting } from "react-icons/ai";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useSparkStore } from "../../store/useSparkStore";
import { useTranslation } from "react-i18next";
import { usePointsSystem } from "../hooks/usePointsSystem";
import type { IconType } from "react-icons";
import type { StudentPage } from "../../store/usenavigationStore";

interface NavDestination {
  icon: IconType;
  label: string;
  value: StudentPage;
}

const Sidebar = () => {
  const { currentStudentPage, setCurrentStudentPage, setStudentSettingsTab } = useNavigationStore();
  const hasUnread = useSparkStore((s) => s.hasUnread);
  const { t } = useTranslation();
  const { pointsBalance } = usePointsSystem();
  const [hoveredItem, setHoveredItem] = useState<StudentPage | null>(null);

  const formattedPoints =
    pointsBalance > 999 ? `${(pointsBalance / 1000).toFixed(1)}k` : pointsBalance;

  // Complete student destinations list:
  // 1. Home, 2. Quiz, 3. Learn, 4. Chat, 5. IGG Points, 6. Settings
  const studentNavItems: NavDestination[] = [
    { icon: TbHomeFilled, label: t("nav_home") || "Home", value: "home" },
    { icon: IoNewspaper, label: t("nav_quiz") || "Quiz", value: "quiz" },
    { icon: TbBrandYoutubeFilled, label: t("nav_learn") || "Learn", value: "learn" },
    { icon: PiSparkleFill, label: "Chat", value: "chat" },
    { icon: FiAward, label: "IGG Points", value: "rewards" },
    { icon: AiTwotoneSetting, label: t("nav_settings") || "Settings", value: "settings" },
  ];

  return (
    <Box
      as="aside"
      aria-label="Student Navigation Rail"
      display={{ base: "none", md: "block" }}
      width="full"
      h="full"
      overflowY="auto"
      overflowX="hidden"
      bg="white"
      px={{ base: 4, md: 1.5, lg: 3 }}
      py={{ base: 6, md: 4, lg: 6 }}
      borderRight="1px solid"
      borderColor="gray.100"
      shadow="xs"
      left={0}
      position="sticky"
      top="0"
      css={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Flex direction="column" gap={{ base: 2, md: 1.5, lg: 2 }}>
        {studentNavItems.map((item) => {
          const isActive = currentStudentPage === item.value;
          const isRewards = item.value === "rewards";
          const isChat = item.value === "chat";
          const isHovered = hoveredItem === item.value;

          // Theme colors
          let activeBg = "#206CE11A";
          let activeColor = "#206CE1";
          let activePillBg = "blue.50";

          if (isChat) {
            activeBg = "purple.50";
            activeColor = "purple.600";
            activePillBg = "purple.100";
          } else if (isRewards) {
            activeBg = "amber.50";
            activeColor = "amber.700";
            activePillBg = "amber.100";
          }

          const hoverBg = isRewards
            ? "amber.50"
            : isChat
            ? "purple.50"
            : "gray.50";

          return (
            <Box
              key={item.value}
              as="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              position="relative"
              display="flex"
              flexDirection={{ base: "row", md: "column", lg: "row" }}
              alignItems="center"
              justifyContent={{ base: "flex-start", md: "center", lg: "space-between" }}
              w="full"
              minH={{ md: "56px", lg: "44px" }}
              p={{ base: 3, md: "6px 2px", lg: "10px 14px" }}
              borderRadius="xl"
              cursor="pointer"
              border="none"
              outline="none"
              color={isActive ? activeColor : "gray.600"}
              bg={isActive ? activeBg : isHovered ? hoverBg : "transparent"}
              transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              _active={{ transform: "scale(0.93)" }}
              onMouseEnter={() => setHoveredItem(item.value)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                if (item.value === "chat") {
                  useSparkStore.getState().setHasUnread(false);
                } else if (item.value === "settings") {
                  setStudentSettingsTab("menu");
                }
                setCurrentStudentPage(item.value);
              }}
            >
              {/* ── Desktop View (lg: 1024px+) ── */}
              <HStack
                gap={3}
                display={{ base: "none", lg: "flex" }}
                align="center"
                w="full"
                justify="space-between"
              >
                <HStack gap={3} align="center">
                  <Box position="relative" display="flex" alignItems="center">
                    <Icon
                      as={item.icon}
                      boxSize="18px"
                      color={
                        isActive
                          ? activeColor
                          : isRewards
                          ? "amber.600"
                          : isChat
                          ? "purple.600"
                          : "gray.500"
                      }
                    />
                    {isChat && hasUnread && !isActive && (
                      <Box
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg="red.500"
                        border="1px solid white"
                      />
                    )}
                  </Box>
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? "700" : "500"}
                    color={isActive ? activeColor : "gray.700"}
                  >
                    {item.label}
                  </Text>
                </HStack>

                {isRewards && (
                  <Badge
                    colorPalette="amber"
                    variant="solid"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="10px"
                    fontWeight="bold"
                  >
                    {formattedPoints} Pts
                  </Badge>
                )}
              </HStack>

              {/* ── Tablet Navigation Rail (md: 768px - 1023px) ── */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                display={{ base: "none", md: "flex", lg: "none" }}
                w="full"
                position="relative"
              >
                {/* Icon Container Pill */}
                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="42px"
                  h="28px"
                  borderRadius="full"
                  bg={isActive ? activePillBg : "transparent"}
                  transition="all 0.2s ease"
                >
                  <Icon
                    as={item.icon}
                    boxSize="20px"
                    color={
                      isActive
                        ? activeColor
                        : isRewards
                        ? "amber.600"
                        : isChat
                        ? "purple.600"
                        : "gray.500"
                    }
                  />

                  {/* Rewards compact point badge on tablet rail */}
                  {isRewards && (
                    <Box
                      position="absolute"
                      top="-4px"
                      right="-6px"
                      bg="amber.500"
                      color="white"
                      fontSize="9px"
                      fontWeight="bold"
                      px={1}
                      py={0.2}
                      borderRadius="full"
                      boxShadow="0 1px 3px rgba(217, 119, 6, 0.4)"
                      lineHeight="1.2"
                    >
                      {formattedPoints}
                    </Box>
                  )}

                  {/* Chat unread or sparkle dot on tablet rail */}
                  {isChat && !isActive && (
                    <Box
                      position="absolute"
                      top="-1px"
                      right="-1px"
                      w={hasUnread ? "8px" : "5px"}
                      h={hasUnread ? "8px" : "5px"}
                      borderRadius="full"
                      bg={hasUnread ? "red.500" : "purple.400"}
                      border={hasUnread ? "1.5px solid white" : "none"}
                      boxShadow={
                        hasUnread
                          ? "0 0 6px rgba(239, 68, 68, 0.7)"
                          : "0 0 4px rgba(168, 85, 247, 0.6)"
                      }
                    />
                  )}
                </Box>

                {/* Permanent Touch-Friendly Tablet Label (no hover jump, no floating flyouts) */}
                <Text
                  fontSize="10.5px"
                  fontWeight={isActive ? "700" : "500"}
                  lineHeight="1.15"
                  mt={1}
                  textAlign="center"
                  whiteSpace="nowrap"
                  maxW="68px"
                  truncate
                  color={isActive ? activeColor : "gray.600"}
                  transition="color 0.15s ease"
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
                    bg={activeColor}
                  />
                )}
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default Sidebar;
