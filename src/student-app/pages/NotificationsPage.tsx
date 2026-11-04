import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  IconButton,
  Button,
  Icon,
} from "@chakra-ui/react";
import {
  FiBell,
  FiCheck,
  FiArrowLeft,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiBookOpen,
  FiAward,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useStudentNotifications, type StudentNotificationItem } from "@/hooks/useStudentNotifications";
import { useBackButton } from "@/hooks/useBackButton";

type FilterTab = "all" | "unread" | "quiz" | "award" | "system";

const NotificationsPage: React.FC = () => {
  const { setCurrentStudentPage } = useNavigationStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useStudentNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Hardware/mobile browser back button returns to 'home'
  useBackButton("student-notifications-page", 35, () => {
    setCurrentStudentPage("home");
    return true;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (notif: StudentNotificationItem) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
  };

  const handleActionClick = (notif: StudentNotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notif.id);
    if (notif.actionPage) {
      setCurrentStudentPage(notif.actionPage);
    }
  };

  const getNotifIcon = (notif: StudentNotificationItem) => {
    if (notif.type === "award" || notif.title.toLowerCase().includes("reward") || notif.title.toLowerCase().includes("streak")) {
      return { icon: FiAward, color: "#D97706", bg: "#FEF3C7" };
    }
    if (notif.type === "quiz" || notif.title.toLowerCase().includes("quiz") || notif.title.toLowerCase().includes("past question")) {
      return { icon: FiBookOpen, color: "#206CE1", bg: "#EBF3FF" };
    }
    if (notif.type === "class_change") {
      return { icon: FiAlertCircle, color: "#7C3AED", bg: "#F3E8FF" };
    }
    return { icon: FiBell, color: "#059669", bg: "#D1FAE5" };
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "quiz") return n.type === "quiz";
    if (activeFilter === "award") return n.type === "award";
    if (activeFilter === "system") return n.type === "system";
    return true;
  });

  const filterTabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "quiz", label: "Quizzes & Tests" },
    { id: "award", label: "Rewards & Streaks" },
    { id: "system", label: "System Alerts" },
  ];

  return (
    <Box w="100%" minH="100vh" bg={{ base: "#F8FAFC", _dark: "#0F172A" }} pb={28}>
      {/* ─── Top Sticky Bar with Back Button & Title ─── */}
      <Box
        position="sticky"
        top="0"
        zIndex={10}
        bg={{ base: "white", _dark: "#1E293B" }}
        borderBottom="1px solid"
        borderColor={{ base: "#E2E8F0", _dark: "#334155" }}
        px={{ base: 3.5, md: 6 }}
        py={3.5}
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
      >
        <Flex justify="space-between" align="center" maxW="840px" mx="auto">
          <HStack gap={3} align="center">
            <IconButton
              aria-label="Back to home"
              variant="ghost"
              size="sm"
              borderRadius="full"
              h="36px"
              w="36px"
              color={{ base: "#0F172A", _dark: "#F8FAFC" }}
              _hover={{ bg: { base: "#F1F5F9", _dark: "#334155" } }}
              onClick={() => setCurrentStudentPage("home")}
            >
              <FiArrowLeft size={20} />
            </IconButton>

            <Box>
              <HStack gap={2} align="center">
                <Heading fontSize={{ base: "18px", md: "20px" }} fontWeight="800" color={{ base: "#0F172A", _dark: "#F8FAFC" }}>
                  Notifications
                </Heading>
                {unreadCount > 0 && (
                  <Badge
                    bg="#206CE1"
                    color="white"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="11px"
                    fontWeight="700"
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </HStack>
              <Text fontSize="12px" color={{ base: "#64748B", _dark: "#94A3B8" }} mt={0.5}>
                Quizzes, streak updates, and school announcements
              </Text>
            </Box>
          </HStack>

          {/* Quick Action: Mark all as read */}
          <HStack gap={2}>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="subtle"
                colorPalette="blue"
                borderRadius="full"
                px={3}
                py={1.5}
                fontSize="12px"
                fontWeight="700"
                onClick={markAllRead}
              >
                <FiCheck size={14} style={{ marginRight: 4 }} />
                Mark all read
              </Button>
            )}

            {notifications.length > 0 && (
              <IconButton
                aria-label="Clear all notifications"
                variant="ghost"
                size="xs"
                borderRadius="full"
                color={{ base: "#64748B", _dark: "#94A3B8" }}
                _hover={{ color: "#EF4444", bg: { base: "#FEE2E2", _dark: "rgba(239, 68, 68, 0.2)" } }}
                title="Clear all notifications"
                onClick={clearAll}
              >
                <FiTrash2 size={15} />
              </IconButton>
            )}
          </HStack>
        </Flex>

        {/* ─── Filter Tabs Row ─── */}
        <Box maxW="840px" mx="auto" mt={3} overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
          <HStack gap={1.5} pb={1}>
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <Box
                  key={tab.id}
                  as="button"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight={isActive ? "700" : "500"}
                  bg={isActive ? "#206CE1" : { base: "#F1F5F9", _dark: "#334155" }}
                  color={isActive ? "white" : { base: "#475569", _dark: "#CBD5E1" }}
                  cursor="pointer"
                  transition="all 0.15s ease"
                  whiteSpace="nowrap"
                  onClick={() => setActiveFilter(tab.id)}
                  _hover={{ bg: isActive ? "#1D4ED8" : { base: "#E2E8F0", _dark: "#475569" } }}
                >
                  {tab.label}
                  {typeof tab.count === "number" && tab.count > 0 && (
                    <Text as="span" ml={1.5} opacity={isActive ? 0.9 : 0.7} fontWeight="600">
                      ({tab.count})
                    </Text>
                  )}
                </Box>
              );
            })}
          </HStack>
        </Box>
      </Box>

      {/* ─── Notification List Content ─── */}
      <Box maxW="840px" mx="auto" px={{ base: 3.5, md: 6 }} pt={4}>
        {filteredNotifs.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="45vh"
            py={12}
            textAlign="center"
            bg={{ base: "white", _dark: "#1E293B" }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={{ base: "#E2E8F0", _dark: "#334155" }}
            px={6}
          >
            <Box
              boxSize="68px"
              borderRadius="full"
              bg={{ base: "#F1F5F9", _dark: "#334155" }}
              color="#206CE1"
              display="flex"
              align="center"
              justify="center"
              mb={4}
            >
              <FiCheckCircle size={32} />
            </Box>
            <Heading fontSize="18px" fontWeight="800" color={{ base: "#0F172A", _dark: "#F8FAFC" }} mb={1.5}>
              {activeFilter === "unread" ? "No unread notifications" : "You're all caught up!"}
            </Heading>
            <Text fontSize="13px" color={{ base: "#64748B", _dark: "#94A3B8" }} maxW="360px" mb={5}>
              {activeFilter === "unread"
                ? "You have reviewed all your study updates and alerts."
                : "No notifications match this filter. Take quizzes and practice questions to get daily updates."}
            </Text>
            <Button
              size="sm"
              bg="#206CE1"
              color="white"
              borderRadius="xl"
              px={5}
              fontWeight="700"
              _hover={{ bg: "#1D4ED8" }}
              onClick={() => setCurrentStudentPage("quiz")}
            >
              Take a Practice Quiz
            </Button>
          </Flex>
        ) : (
          <VStack gap={3} align="stretch">
            {filteredNotifs.map((notif) => {
              const { icon: NotifIcon, color: iconColor, bg: iconBg } = getNotifIcon(notif);
              const isExpanded = !!expandedIds[notif.id];

              return (
                <Box
                  key={notif.id}
                  bg={{ base: "white", _dark: "#1E293B" }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={notif.read ? { base: "#E2E8F0", _dark: "#334155" } : { base: "#BFDBFE", _dark: "#1E3A8A" }}
                  p={{ base: 3.5, sm: 4 }}
                  cursor="pointer"
                  transition="all 0.18s ease"
                  boxShadow={notif.read ? "none" : "0 2px 8px rgba(32, 108, 225, 0.08)"}
                  _hover={{
                    borderColor: "#206CE1",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  }}
                  onClick={() => handleCardClick(notif)}
                  position="relative"
                >
                  {/* Unread Indicator Bar */}
                  {!notif.read && (
                    <Box
                      position="absolute"
                      left="0"
                      top="12px"
                      bottom="12px"
                      w="4px"
                      borderRightRadius="full"
                      bg="#206CE1"
                    />
                  )}

                  <Flex gap={3} align="flex-start">
                    {/* Visual Icon Badge */}
                    <Box
                      boxSize="40px"
                      borderRadius="xl"
                      bg={iconBg}
                      color={iconColor}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon as={NotifIcon} boxSize="18px" />
                    </Box>

                    {/* Notification Body */}
                    <Box flex={1} minW={0}>
                      <Flex justify="space-between" align="flex-start" gap={2}>
                        <HStack gap={2} align="center" flexWrap="wrap">
                          <Text
                            fontSize="14px"
                            fontWeight={notif.read ? "600" : "800"}
                            color={{ base: "#0F172A", _dark: "#F8FAFC" }}
                            lineHeight="1.3"
                          >
                            {notif.title}
                          </Text>
                          {!notif.read && (
                            <Badge
                              bg="#206CE1"
                              color="white"
                              borderRadius="full"
                              px={1.5}
                              py={0.2}
                              fontSize="9.5px"
                              fontWeight="700"
                            >
                              New
                            </Badge>
                          )}
                        </HStack>

                        <Text fontSize="11px" color={{ base: "#94A3B8", _dark: "#64748B" }} flexShrink={0}>
                          {notif.time}
                        </Text>
                      </Flex>

                      {/* Description Text */}
                      <Text
                        fontSize="12.5px"
                        color={{ base: "#475569", _dark: "#CBD5E1" }}
                        mt={1.5}
                        lineHeight="1.5"
                        noOfLines={isExpanded ? undefined : 2}
                      >
                        {notif.desc}
                      </Text>

                      {/* Action Links & Footer Buttons */}
                      <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid" borderColor={{ base: "#F1F5F9", _dark: "#263548" }}>
                        <HStack gap={2}>
                          {notif.actionPage && (
                            <Button
                              size="xs"
                              bg="#206CE1"
                              color="white"
                              borderRadius="lg"
                              px={3}
                              py={1}
                              fontSize="11.5px"
                              fontWeight="700"
                              _hover={{ bg: "#1D4ED8" }}
                              onClick={(e) => handleActionClick(notif, e)}
                            >
                              {notif.actionLabel || "View"}
                            </Button>
                          )}

                          {notif.desc.length > 90 && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color={{ base: "#64748B", _dark: "#94A3B8" }}
                              fontSize="11px"
                              p={1}
                              onClick={(e) => toggleExpand(notif.id, e)}
                            >
                              {isExpanded ? (
                                <HStack gap={1}>
                                  <Text>Show less</Text>
                                  <FiChevronUp size={12} />
                                </HStack>
                              ) : (
                                <HStack gap={1}>
                                  <Text>Read more</Text>
                                  <FiChevronDown size={12} />
                                </HStack>
                              )}
                            </Button>
                          )}
                        </HStack>

                        {/* Individual Dismiss / Delete */}
                        <HStack gap={1}>
                          {!notif.read && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="#206CE1"
                              fontSize="11px"
                              px={2}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                            >
                              Mark read
                            </Button>
                          )}

                          <IconButton
                            aria-label="Delete notification"
                            variant="ghost"
                            size="xs"
                            borderRadius="full"
                            color={{ base: "#94A3B8", _dark: "#64748B" }}
                            _hover={{ color: "#EF4444", bg: { base: "#FEE2E2", _dark: "rgba(239, 68, 68, 0.2)" } }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                          >
                            <FiTrash2 size={13} />
                          </IconButton>
                        </HStack>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;
