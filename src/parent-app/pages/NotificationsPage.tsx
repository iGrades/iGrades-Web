import React, { useState, useEffect } from "react";
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
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { classChangeService, type ClassChangeRequest } from "@/services/classChangeService";
import { ClassChangeNotificationModal } from "../components/grader/ClassChangeNotificationModal";
import { useBackButton } from "@/hooks/useBackButton";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: "system" | "quiz" | "report" | "award" | "class_change";
  request?: ClassChangeRequest;
}

const STORAGE_KEY_PARENT_READ = "igrade_read_notifications";

export const ParentNotificationsPage: React.FC = () => {
  const { setCurrentParentPage } = useNavigationStore();
  const { studentsData } = useStudentsData();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "welcome-1",
      title: "Welcome to iGrades Parent Portal",
      desc: "Track your children's real-time academic progress, quiz scores, and subject curriculums from this dashboard.",
      time: "Just now",
      read: false,
      type: "system",
    },
    {
      id: "weekly-report-2",
      title: "Weekly Performance Digest Ready",
      desc: "Weekly study summaries and practice metrics are updated. Review your children's top subjects and focus areas.",
      time: "1 hour ago",
      read: false,
      type: "report",
    },
    {
      id: "streak-3",
      title: "Daily Practice Goal Achieved",
      desc: "Your child completed their daily practice session and maintained their streak! Keep up the encouragement.",
      time: "1 day ago",
      read: true,
      type: "award",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "requests">("all");
  const [selectedDecisionRequest, setSelectedDecisionRequest] = useState<ClassChangeRequest | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  // Native phone back button returns to 'home'
  useBackButton("parent-notifications-page", 35, () => {
    setCurrentParentPage("home");
    return true;
  });

  // Load official class-change notifications for the parent's children
  useEffect(() => {
    const loadRequests = async () => {
      if (!studentsData || studentsData.length === 0) return;
      try {
        const studentIds = studentsData.map((s) => s.id);
        const requests = await classChangeService.getRequestsForParentStudents(studentIds);

        const readIds: string[] = (() => {
          try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_PARENT_READ) || "[]");
          } catch {
            return [];
          }
        })();

        const requestNotifs: NotificationItem[] = requests.map((req) => {
          const student = studentsData.find((s) => s.id === req.student_id);
          const studentName = student
            ? `${student.firstname} ${student.lastname}`.trim()
            : "Your child";

          let title = `Class Request: ${studentName}`;
          let desc = `A request was submitted to change class from ${req.current_class} to ${req.requested_class}.`;

          if (req.status === "approved") {
            title = `Class Change Approved: ${studentName}`;
            desc = `Great news! The request to update ${studentName}'s class to ${req.requested_class} has been officially approved.`;
          } else if (req.status === "declined") {
            title = `Class Change Declined: ${studentName}`;
            desc = `The request to update ${studentName}'s class was not approved. ${req.review_note ? `Note: "${req.review_note}"` : ""}`;
          }

          const createdAt = new Date(req.created_at);
          const time = isNaN(createdAt.getTime()) ? "Recently" : createdAt.toLocaleDateString();

          return {
            id: req.id,
            title,
            desc,
            time,
            read: readIds.includes(req.id),
            type: "class_change" as const,
            request: req,
          };
        });

        setNotifications((prev) => {
          const nonRequests = prev.filter((n) => !n.request && n.type !== "class_change");
          return [...requestNotifs, ...nonRequests];
        });
      } catch (err) {
        console.warn("Could not load class change notifications:", err);
      }
    };

    loadRequests();
  }, [studentsData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const allIds = notifications.map((n) => n.id);
      localStorage.setItem(STORAGE_KEY_PARENT_READ, JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    try {
      const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY_PARENT_READ) || "[]");
      if (!readIds.includes(item.id)) {
        localStorage.setItem(STORAGE_KEY_PARENT_READ, JSON.stringify([...readIds, item.id]));
      }
    } catch {
      // ignore
    }

    if (item.request) {
      setSelectedDecisionRequest(item.request);
      setIsDecisionModalOpen(true);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "requests") return !!n.request || n.type === "class_change";
    return true;
  });

  return (
    <Box w="100%" minH="100vh" bg={{ base: "#F8FAFC", _dark: "#0F172A" }} pb={28}>
      {/* ─── Top Sticky Bar ─── */}
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
              onClick={() => setCurrentParentPage("home")}
            >
              <FiArrowLeft size={20} />
            </IconButton>

            <Box>
              <HStack gap={2} align="center">
                <Heading fontSize={{ base: "18px", md: "20px" }} fontWeight="800" color={{ base: "#0F172A", _dark: "#F8FAFC" }}>
                  Parent Notifications
                </Heading>
                {unreadCount > 0 && (
                  <Badge
                    bg="#7C3AED"
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
                Academic reports, streak updates, and child requests
              </Text>
            </Box>
          </HStack>

          {unreadCount > 0 && (
            <Button
              size="xs"
              variant="subtle"
              colorPalette="purple"
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
        </Flex>

        {/* ─── Filter Tabs Row ─── */}
        <Box maxW="840px" mx="auto" mt={3} overflowX="auto">
          <HStack gap={1.5} pb={1}>
            <Box
              as="button"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="12px"
              fontWeight={activeFilter === "all" ? "700" : "500"}
              bg={activeFilter === "all" ? "#7C3AED" : { base: "#F1F5F9", _dark: "#334155" }}
              color={activeFilter === "all" ? "white" : { base: "#475569", _dark: "#CBD5E1" }}
              cursor="pointer"
              onClick={() => setActiveFilter("all")}
            >
              All ({notifications.length})
            </Box>
            <Box
              as="button"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="12px"
              fontWeight={activeFilter === "unread" ? "700" : "500"}
              bg={activeFilter === "unread" ? "#7C3AED" : { base: "#F1F5F9", _dark: "#334155" }}
              color={activeFilter === "unread" ? "white" : { base: "#475569", _dark: "#CBD5E1" }}
              cursor="pointer"
              onClick={() => setActiveFilter("unread")}
            >
              Unread ({unreadCount})
            </Box>
            <Box
              as="button"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="12px"
              fontWeight={activeFilter === "requests" ? "700" : "500"}
              bg={activeFilter === "requests" ? "#7C3AED" : { base: "#F1F5F9", _dark: "#334155" }}
              color={activeFilter === "requests" ? "white" : { base: "#475569", _dark: "#CBD5E1" }}
              cursor="pointer"
              onClick={() => setActiveFilter("requests")}
            >
              Class Requests
            </Box>
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
              color="#7C3AED"
              display="flex"
              align="center"
              justify="center"
              mb={4}
            >
              <FiCheckCircle size={32} />
            </Box>
            <Heading fontSize="18px" fontWeight="800" color={{ base: "#0F172A", _dark: "#F8FAFC" }} mb={1.5}>
              No notifications
            </Heading>
            <Text fontSize="13px" color={{ base: "#64748B", _dark: "#94A3B8" }} maxW="360px">
              You are completely up to date with your children's learning milestones and school notifications.
            </Text>
          </Flex>
        ) : (
          <VStack gap={3} align="stretch">
            {filteredNotifs.map((notif) => {
              const isClassRequest = notif.request || notif.type === "class_change";
              const isReport = notif.type === "report";

              return (
                <Box
                  key={notif.id}
                  bg={{ base: "white", _dark: "#1E293B" }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={notif.read ? { base: "#E2E8F0", _dark: "#334155" } : { base: "#DDD6FE", _dark: "#4C1D95" }}
                  p={{ base: 3.5, sm: 4 }}
                  cursor="pointer"
                  transition="all 0.18s ease"
                  boxShadow={notif.read ? "none" : "0 2px 8px rgba(124, 58, 237, 0.08)"}
                  _hover={{
                    borderColor: "#7C3AED",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  }}
                  onClick={() => handleNotificationClick(notif)}
                  position="relative"
                >
                  {!notif.read && (
                    <Box
                      position="absolute"
                      left="0"
                      top="12px"
                      bottom="12px"
                      w="4px"
                      borderRightRadius="full"
                      bg="#7C3AED"
                    />
                  )}

                  <Flex gap={3} align="flex-start">
                    <Box
                      boxSize="40px"
                      borderRadius="xl"
                      bg={isClassRequest ? "#F3E8FF" : isReport ? "#EBF3FF" : "#FEF3C7"}
                      color={isClassRequest ? "#7C3AED" : isReport ? "#206CE1" : "#D97706"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon as={isClassRequest ? FiAlertCircle : isReport ? FiBookOpen : FiBell} boxSize="18px" />
                    </Box>

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
                              bg="#7C3AED"
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

                      <Text
                        fontSize="12.5px"
                        color={{ base: "#475569", _dark: "#CBD5E1" }}
                        mt={1.5}
                        lineHeight="1.5"
                      >
                        {notif.desc}
                      </Text>

                      {isClassRequest && (
                        <Flex justify="flex-start" align="center" mt={3} pt={2} borderTop="1px solid" borderColor={{ base: "#F1F5F9", _dark: "#263548" }}>
                          <Button
                            size="xs"
                            bg="#7C3AED"
                            color="white"
                            borderRadius="lg"
                            px={3}
                            py={1}
                            fontSize="11.5px"
                            fontWeight="700"
                            _hover={{ bg: "#6D28D9" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                          >
                            View Decision & Details
                          </Button>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Class Change Decision & History Notification Popup */}
      {isDecisionModalOpen && selectedDecisionRequest && (
        <ClassChangeNotificationModal
          isOpen={isDecisionModalOpen}
          onClose={() => {
            setIsDecisionModalOpen(false);
            setSelectedDecisionRequest(null);
          }}
          request={selectedDecisionRequest}
        />
      )}
    </Box>
  );
};

export default ParentNotificationsPage;
