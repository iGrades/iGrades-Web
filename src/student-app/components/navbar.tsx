import { useState } from "react";
import {
  Flex,
  Box,
  IconButton,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useNavigationStore } from "../../store/usenavigationStore";
import { FiBell, FiAward } from "react-icons/fi";
import { usePointsSystem } from "../hooks/usePointsSystem";
import AvatarComp from "../../components/avatar";
import { SwipeUpNavGreeting } from "@/components/SwipeUpNavGreeting";
import { useStudentNotifications } from "@/hooks/useStudentNotifications";

export const getPlanBadge = (sub?: string) => {
  const s = (sub || "basic").toLowerCase().trim();
  if (s.includes("prem")) {
    return {
      letter: "P",
      label: "Premium",
      bg: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      color: "#FFFFFF",
      border: "1.5px solid #FFFFFF",
      boxShadow: "0 1px 4px rgba(217, 119, 6, 0.45)",
    };
  }
  if (s.includes("stand")) {
    return {
      letter: "S",
      label: "Standard",
      bg: "linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)",
      color: "#0F172A",
      border: "1.5px solid #FFFFFF",
      boxShadow: "0 1px 4px rgba(100, 116, 139, 0.4)",
    };
  }
  // Default to Basic
  return {
    letter: "B",
    label: "Basic",
    bg: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    color: "#FFFFFF",
    border: "1.5px solid #FFFFFF",
    boxShadow: "0 1px 4px rgba(29, 78, 216, 0.45)",
  };
};

const Navbar = () => {
  const { authdStudent } = useAuthdStudentData();
  const { currentStudentPage, setCurrentStudentPage, setStudentSettingsTab } = useNavigationStore();
  const { unreadCount } = useStudentNotifications();

  const pageTitleMap: Record<string, string> = {
    home: "Home",
    learn: "Learn",
    quiz: "Practice Quiz",
    chat: "AI Tutor",
    rewards: "Rewards",
    settings: "Settings",
    notifications: "Notifications",
  };
  const currentPageTitle = pageTitleMap[currentStudentPage] || "Home";

  const { pointsBalance } = usePointsSystem();
  const formattedPoints = pointsBalance.toLocaleString();

  const currentStudent = authdStudent || null;
  const studentFirstName = currentStudent?.firstname || "Student";
  const fullName = `${currentStudent?.firstname ?? ""} ${currentStudent?.lastname ?? ""}`.trim() || "Student";
  const badgeConfig = getPlanBadge(currentStudent?.subscription);

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="1000"
      bg={{ base: "white", _dark: "#121212" }}
      shadow="none"
      boxShadow="none"
      borderBottom="1px solid"
      borderColor={{ base: "gray.100", _dark: "#262626" }}
      pt="env(safe-area-inset-top, 0px)"
    >
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        h={{ base: "52px", md: "58px" }}
        px={{ base: 3.5, md: 6 }}
      >
        {/* Left Section: Profile Avatar with Plan Badge & Greeting 'Hello {userfirstname}' */}
        <HStack gap={{ base: 4, sm: 5 }} align="center">
          {/* Clicking profile avatar opens Profile page directly */}
          <Box
            position="relative"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={() => {
              setCurrentStudentPage("settings");
              setStudentSettingsTab("profile");
            }}
            transition="transform 0.15s ease"
            _hover={{ transform: "scale(1.05)" }}
            aria-label="Open student profile"
          >
            <Box
              borderRadius="full"
              boxSize="34px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              <AvatarComp username={fullName} profileImage={currentStudent?.profile_image} size="sm" />
            </Box>

            {/* Plan Badge crafted at bottom-right */}
            <Flex
              position="absolute"
              bottom="-2px"
              right="-2px"
              boxSize="15px"
              borderRadius="full"
              align="center"
              justify="center"
              bg={badgeConfig.bg}
              color={badgeConfig.color}
              border={badgeConfig.border}
              boxShadow={badgeConfig.boxShadow}
              fontSize="9px"
              fontWeight="800"
              lineHeight="1"
              userSelect="none"
              title={`${badgeConfig.label} Plan`}
            >
              {badgeConfig.letter}
            </Flex>
          </Box>

          {/* Greeting: 'Hello {studentFirstName} 👋' and Current Page Name Swipe-Up Sequence */}
          <SwipeUpNavGreeting
            firstName={studentFirstName}
            pageTitle={currentPageTitle}
            subtitleGreeting={currentStudent?.class}
            subtitlePage={currentStudent?.class}
          />
        </HStack>

        {/* Right Section: IGG Points + Notifications Bell Icon */}
        <HStack gap={{ base: 2, sm: 2.5 }} align="center">
          {/* Top Navbar IGG Points Badge */}
          <Box
            as="button"
            onClick={() => setCurrentStudentPage("rewards")}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            px={{ base: 2.5, sm: 3 }}
            py={1}
            borderRadius="full"
            bg={{ base: "#FEF3C7", _dark: "rgba(245, 158, 11, 0.16)" }}
            border="1px solid"
            borderColor={{ base: "#F59E0B", _dark: "#D97706" }}
            cursor="pointer"
            _hover={{ transform: "scale(1.03)", bg: { base: "#FDE68A", _dark: "rgba(245, 158, 11, 0.24)" } }}
            transition="all 0.15s ease"
            aria-label="View IGG Points"
          >
            <FiAward color="#D97706" size={15} />
            <Text fontSize="xs" fontWeight="700" color={{ base: "#92400E", _dark: "#FDE68A" }} lineHeight="1">
              {formattedPoints} <Text as="span" fontSize="10px" fontWeight="600" color={{ base: "#B45309", _dark: "#FCD34D" }}>IGG</Text>
            </Text>
          </Box>

          <Box position="relative">
            <IconButton
              aria-label="Open notifications"
              variant="ghost"
              borderRadius="full"
              size="sm"
              h="36px"
              w="36px"
              bg={currentStudentPage === "notifications" ? { base: "#EBF3FF", _dark: "rgba(32, 108, 225, 0.2)" } : "transparent"}
              color={currentStudentPage === "notifications" ? "#206CE1" : { base: "gray.600", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.100", _dark: "gray.800" }, color: "blue.500" }}
              onClick={() => setCurrentStudentPage("notifications")}
            >
              <FiBell size={20} />
            </IconButton>
            {unreadCount > 0 && (
              <Box
                position="absolute"
                top="4px"
                right="4px"
                w="8px"
                h="8px"
                bg="#206CE1"
                borderRadius="full"
                border="2px solid white"
              />
            )}
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
