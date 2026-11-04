import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { TbHomeFilled } from "react-icons/tb";
import { PiStudentDuotone } from "react-icons/pi";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { AiTwotoneSetting } from "react-icons/ai";
import { useNavigationStore, type ParentPage } from "@/store/usenavigationStore";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { hapticsService } from "@/services/hapticsService";

interface NavItem {
  icon: IconType;
  label: string;
  value: ParentPage;
  badge?: number | string;
}

export const ParentFloatingBottomBar = () => {
  const { currentParentPage, setCurrentParentPage, setParentSettingsTab } = useNavigationStore();
  const { studentsData } = useStudentsData();
  const { t } = useTranslation();

  const childrenCount = studentsData?.length || 0;

  // 4 primary parent destinations:
  // 1. Home (Intelligence Dashboard)
  // 2. Children / Students Directory
  // 3. Weekly Reports
  // 4. Settings
  const navItems: NavItem[] = [
    {
      icon: TbHomeFilled,
      label: t("nav_home") || "Home",
      value: "home",
    },
    {
      icon: PiStudentDuotone,
      label: t("nav_students") || "Children",
      value: "student",
      badge: childrenCount > 0 ? childrenCount : undefined,
    },
    {
      icon: BsFileEarmarkBarGraphFill,
      label: t("Reports") || "Reports",
      value: "weekly_report",
    },
    {
      icon: AiTwotoneSetting,
      label: t("nav_settings") || "Settings",
      value: "settings",
    },
  ];

  return (
    <Box
      as="nav"
      aria-label="Parent Mobile Bottom Navigation"
      role="tablist"
      display={{ base: "block", md: "none" }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      w="full"
      bg={{ base: "rgba(255, 255, 255, 0.98)", _dark: "rgba(18, 18, 18, 0.96)" }}
      backdropFilter="blur(20px)"
      borderTop="1px solid"
      borderColor={{ base: "gray.200", _dark: "#262626" }}
      boxShadow={{ base: "0 -2px 12px rgba(0, 0, 0, 0.06)", _dark: "0 -4px 16px rgba(0, 0, 0, 0.7)" }}
      px={1}
      pt={1.5}
      pb="max(calc(env(safe-area-inset-bottom, 0px) + 8px), 8px)"
      zIndex={1000}
    >
      <Flex justify="space-around" align="center" w="full" maxW="480px" mx="auto">
        {navItems.map((item) => {
          const isActive = currentParentPage === item.value;
          const isReports = item.value === "weekly_report";

          // Dynamic colors per tab
          const activeBg = isReports
            ? { base: "purple.50", _dark: "rgba(168, 85, 247, 0.15)" }
            : { base: "blue.50", _dark: "rgba(59, 130, 246, 0.15)" };
          const activeColor = isReports ? { base: "purple.600", _dark: "purple.300" } : { base: "#206CE1", _dark: "#60A5FA" };
          const activeDotBg = isReports ? { base: "purple.600", _dark: "purple.400" } : { base: "#206CE1", _dark: "#3B82F6" };

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
              onClick={() => {
                hapticsService.triggerNavigationTap();
                if (item.value === "settings") {
                  setParentSettingsTab("menu");
                }
                setCurrentParentPage(item.value);
              }}
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
                  color={isActive ? activeColor : { base: "gray.500", _dark: "gray.400" }}
                  transition="color 0.15s ease"
                />

                {/* Badge for Children count on student tab */}
                {item.value === "student" && item.badge !== undefined && (
                  <Box
                    position="absolute"
                    top="-3px"
                    right="-6px"
                    bg="#206CE1"
                    color="white"
                    fontSize="9px"
                    fontWeight="bold"
                    px={1.5}
                    py={0.2}
                    borderRadius="full"
                    boxShadow="0 1px 3px rgba(32, 108, 225, 0.4)"
                    lineHeight="1.2"
                  >
                    {item.badge}
                  </Box>
                )}
              </Box>

              <Text
                fontSize="11px"
                fontWeight={isActive ? "700" : "500"}
                letterSpacing="-0.01em"
                color={isActive ? activeColor : { base: "gray.500", _dark: "gray.400" }}
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

export default ParentFloatingBottomBar;
