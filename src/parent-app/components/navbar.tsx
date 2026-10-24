import {
  Flex,
  Box,
  Heading,
  Text,
  Menu,
  Portal,
  Badge,
  IconButton,
  Popover,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect, type SetStateAction, type Dispatch } from "react";
import { useUser } from "../context/parentDataContext";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import {
  FiBell,
  FiLogOut,
  FiUser,
  FiHelpCircle,
  FiShield,
  FiCreditCard,
  FiUsers,
  FiGlobe,
} from "react-icons/fi";
import AvatarComp from "../../components/avatar";
import { useStudentsData } from "../context/studentsDataContext";
import { classChangeService, type ClassChangeRequest } from "@/services/classChangeService";
import { ClassChangeNotificationModal } from "./grader/ClassChangeNotificationModal";
import AddGraderPopup from "./grader/addGraderPopover";
import { SwipeUpNavGreeting } from "@/components/SwipeUpNavGreeting";

type Props = {
  setShowLogoutModal: Dispatch<SetStateAction<boolean>>;
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  request?: ClassChangeRequest;
}

const Navbar = ({ setShowLogoutModal }: Props) => {
  const { parent, user } = useUser();
  const { studentsData } = useStudentsData();
  const { currentParentPage, setCurrentParentPage, setParentSettingsTab } = useNavigationStore();
  const { t } = useTranslation();



  const pageTitleMap: Record<string, string> = {
    home: t("Home") || "Home",
    student: t("Students") || "Students",
    weekly_report: t("Learning Reports") || "Reports",
    settings: t("Settings") || "Settings",
  };

  const currentPageTitle = pageTitleMap[currentParentPage] || "Home";

  const [selectedDecisionRequest, setSelectedDecisionRequest] = useState<ClassChangeRequest | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [showAddChildPopup, setShowAddChildPopup] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Weekly Performance Report",
      desc: "Your children completed 5 practice tests this week.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "2",
      title: "New Grade Recorded",
      desc: "Alex scored 92% in Physics Past Question Set 3.",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "Account Subscription",
      desc: "Parent portal access active and synchronized.",
      time: "2 days ago",
      read: true,
    },
  ]);

  // Load official class-change notifications for the parent's children
  useEffect(() => {
    let isMounted = true;
    const studentIds = studentsData?.map((s) => s.id).filter(Boolean) || [];
    const parentId = parent?.[0]?.id;

    const fetchClassChangeNotifs = async () => {
      try {
        let reqs: ClassChangeRequest[] = [];
        if (studentIds.length > 0) {
          reqs = await classChangeService.getRequestsByStudentIds(studentIds);
        } else if (parentId) {
          reqs = await classChangeService.getParentRequests(parentId);
        } else {
          // In preview/dev mode without children attached to parent account, load all requests so decisions are visible
          reqs = await classChangeService.getAllRequests();
        }

        if (!isMounted || !Array.isArray(reqs)) return;

        // Retrieve read notification IDs
        const readIds: string[] = (() => {
          try {
            return JSON.parse(localStorage.getItem("igrade_read_notifications") || "[]");
          } catch {
            return [];
          }
        })();

        const classChangeNotifs: NotificationItem[] = reqs.map((req) => {
          const isAppr = req.status === "approved";
          const isRej = req.status === "rejected";
          const isPend = req.status === "pending";

          let title = `Class Change: ${req.student_name}`;
          if (isAppr) title = `Class Change Approved: ${req.student_name}`;
          else if (isRej) title = `Class Change Rejected: ${req.student_name}`;
          else if (isPend) title = `Class Change Pending: ${req.student_name}`;

          let desc = `From ${req.old_class || req.current_class_name} to ${req.new_class || req.requested_class_name}.`;
          if (isAppr) {
            desc = `Official transfer to ${req.new_class || req.requested_class_name} approved. Click to view full decision & history.`;
          } else if (isRej) {
            desc = `Request to transfer to ${req.requested_class_name} was not approved.${req.admin_note ? ` Reason: ${req.admin_note}` : ""} Click to view details.`;
          } else if (isPend) {
            desc = `Targeting ${req.requested_class_name}. Awaiting review. Click to inspect status & history.`;
          }

          const rawDate = req.reviewed_at || req.submitted_at;
          const timeStr = rawDate
            ? new Date(rawDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "Recent";

          return {
            id: `cc_${req.id}`,
            title,
            desc,
            time: timeStr,
            read: readIds.includes(`cc_${req.id}`),
            request: req,
          };
        });

        setNotifications((prev) => {
          const baseAlerts = prev.filter((p) => !p.id.startsWith("cc_"));
          return [...classChangeNotifs, ...baseAlerts];
        });
      } catch (err) {
        console.warn("Could not load class change notifications:", err);
      }
    };

    fetchClassChangeNotifs();

    const handleRefresh = () => fetchClassChangeNotifs();
    window.addEventListener("classChangeUpdated", handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("classChangeUpdated", handleRefresh);
    };
  }, [studentsData, parent]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const allIds = notifications.map((n) => n.id);
      localStorage.setItem("igrade_read_notifications", JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const handleNotificationItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    try {
      const readIds = JSON.parse(localStorage.getItem("igrade_read_notifications") || "[]");
      if (!readIds.includes(item.id)) {
        localStorage.setItem("igrade_read_notifications", JSON.stringify([...readIds, item.id]));
      }
    } catch {
      // ignore
    }

    if (item.request) {
      setSelectedDecisionRequest(item.request);
      setIsDecisionModalOpen(true);
    }
  };

  const currentParent = parent[0] || {};
  const parentFirstName = currentParent.firstname || user?.user_metadata?.first_name || user?.user_metadata?.name?.split(" ")[0] || "";
  const _parentName = parentFirstName || "Parent";
  const fullName = `${currentParent.firstname ?? ""} ${currentParent.lastname ?? ""}`.trim() || user?.user_metadata?.name || "Parent User";

  return (
    <Box position="sticky" top="0" zIndex="1000" bg="white" shadow="xs" borderBottom="1px solid" borderColor="gray.100" pt="env(safe-area-inset-top, 0px)">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        h={{ base: "56px", md: "64px" }}
        px={{ base: 3, md: 6 }}
      >
        {/* Left Section: User Profile Avatar with Clickable Menu & Greeting (Matches Student App) */}
        <HStack gap={{ base: 2.5, sm: 3 }} align="center">
          {/* User Profile Avatar with Clickable Dropdown Menu */}
          <Menu.Root positioning={{ placement: "bottom-start" }}>
            <Menu.Trigger asChild>
              <Box
                p={0.5}
                borderRadius="full"
                cursor="pointer"
                _hover={{ ring: "2px solid", ringColor: "blue.300" }}
                transition="all 0.15s ease"
                minW="38px"
                minH="38px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                aria-label="Parent profile and settings"
              >
                <AvatarComp username={fullName} profileImage={currentParent?.profile_image} />
              </Box>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner zIndex={1500}>
                <Menu.Content bg="white" shadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.100" minW="230px" p={2}>
                  {/* User Profile Summary inside Dropdown */}
                  <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100" mb={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800" truncate>
                      {fullName}
                    </Text>
                    <HStack justify="space-between" align="center" mt={0.5}>
                      <Badge colorPalette="purple" variant="subtle" size="xs" borderRadius="md">
                        Parent / Guardian
                      </Badge>
                      <Text fontSize="11px" color="gray.500" fontWeight="medium">
                        {studentsData?.length || 0} {studentsData?.length === 1 ? "child" : "children"}
                      </Text>
                    </HStack>
                    {currentParent?.email && (
                      <Text fontSize="10.5px" color="gray.400" truncate mt={0.5}>
                        {currentParent.email}
                      </Text>
                    )}
                  </Box>

                  {/* Profile Account Actions */}
                  <Menu.Item
                    value="settings"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("menu");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiUser size={16} />
                      <Text fontSize="sm" fontWeight="500">Settings & Profile</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="children"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("children");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiUsers size={16} />
                      <Text fontSize="sm">Connected Children</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="language"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("language");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiGlobe size={16} />
                      <Text fontSize="sm">Language Preferences</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="subscription"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("subscription");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiCreditCard size={16} />
                      <Text fontSize="sm">Subscription & Plan</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="security"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("security");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiShield size={16} />
                      <Text fontSize="sm">Security & Password</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="help"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("support");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiHelpCircle size={16} />
                      <Text fontSize="sm">Help & FAQs</Text>
                    </HStack>
                  </Menu.Item>

                  <Box my={1} borderBottom="1px solid" borderColor="gray.100" />

                  {/* Logout Action */}
                  <Menu.Item
                    value="logout"
                    onClick={() => setShowLogoutModal(true)}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    color="red.600"
                    _hover={{ bg: "red.50" }}
                  >
                    <HStack gap={2.5}>
                      <FiLogOut size={16} />
                      <Text fontSize="sm" fontWeight="medium">
                        Logout
                      </Text>
                    </HStack>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          {/* Greeting: 'Hello {firstName} 👋' and Current Page Name Swipe-Up Sequence */}
          <SwipeUpNavGreeting
            firstName={parentFirstName}
            pageTitle={currentPageTitle}
            subtitleGreeting={`Parent Portal · ${studentsData?.length || 0} ${studentsData?.length === 1 ? "Child" : "Children"} Connected`}
            subtitlePage={`Parent Portal · ${currentPageTitle}`}
          />
        </HStack>

        {/* Right Section: Notifications Popover & Student Profile Select Dropdown */}
        <HStack gap={{ base: 2, sm: 2.5 }} align="center">
          {/* 1. Notifications Popover (in place of language icon) */}
          <Popover.Root positioning={{ placement: "bottom-end" }}>
            <Popover.Trigger asChild>
              <Box position="relative">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  borderRadius="full"
                  size="sm"
                  h="38px"
                  w="38px"
                  color="gray.600"
                  _hover={{ bg: "gray.100", color: "blue.600" }}
                >
                  <FiBell size={19} />
                </IconButton>
                {unreadCount > 0 && (
                  <Box
                    position="absolute"
                    top="5px"
                    right="5px"
                    w="8px"
                    h="8px"
                    bg="blue.500"
                    borderRadius="full"
                    border="2px solid white"
                  />
                )}
              </Box>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner zIndex={1500}>
                <Popover.Content
                  width={{ base: "290px", sm: "340px" }}
                  bg="white"
                  shadow="xl"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  p={0}
                  overflow="hidden"
                >
                  <Popover.Arrow />
                  <Box p={3} borderBottom="1px solid" borderColor="gray.100" bg="gray.50">
                    <Flex align="center" justify="space-between">
                      <HStack gap={2}>
                        <Heading size="xs" fontWeight="bold" color="gray.800">
                          Parent Notifications
                        </Heading>
                        {unreadCount > 0 && (
                          <Badge colorPalette="blue" variant="solid" borderRadius="full" px={2} fontSize="10px">
                            {unreadCount} new
                          </Badge>
                        )}
                      </HStack>
                      {unreadCount > 0 && (
                        <Text
                          fontSize="xs"
                          color="blue.600"
                          fontWeight="medium"
                          cursor="pointer"
                          _hover={{ textDecoration: "underline" }}
                          onClick={markAllRead}
                        >
                          Mark all read
                        </Text>
                      )}
                    </Flex>
                  </Box>
                  <Stack p={2} gap={1} maxH="320px" overflowY="auto">
                    {notifications.map((item) => (
                      <Box
                        key={item.id}
                        p={2.5}
                        borderRadius="lg"
                        bg={item.read ? "transparent" : "blue.50/60"}
                        _hover={{ bg: "gray.50" }}
                        transition="background 0.15s ease"
                        cursor={item.request ? "pointer" : "default"}
                        onClick={() => handleNotificationItemClick(item)}
                      >
                        <Flex justify="space-between" align="baseline" mb={0.5}>
                          <HStack gap={1.5} maxW="75%">
                            {item.request && (
                              <Badge
                                size="xs"
                                colorPalette={
                                  item.request.status === "approved"
                                    ? "green"
                                    : item.request.status === "rejected"
                                    ? "red"
                                    : "yellow"
                                }
                                variant="solid"
                                fontSize="9px"
                                px={1}
                              >
                                {item.request.status.toUpperCase()}
                              </Badge>
                            )}
                            <Text fontSize="xs" fontWeight="bold" color="gray.800" truncate>
                              {item.title}
                            </Text>
                          </HStack>
                          <Text fontSize="10px" color="gray.400">
                            {item.time}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.600" lineHeight="1.3">
                          {item.desc}
                        </Text>
                        {item.request && (
                          <Text fontSize="10px" color="blue.600" fontWeight="600" mt={1}>
                            Click to view decision details & history →
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        </HStack>
      </Flex>

      {/* Class Change Decision & History Notification Popup */}
      {isDecisionModalOpen && selectedDecisionRequest && (
        <ClassChangeNotificationModal
          isOpen={isDecisionModalOpen}
          onClose={() => {
            setIsDecisionModalOpen(false);
            setSelectedDecisionRequest(null);
          }}
          request={selectedDecisionRequest}
          studentId={selectedDecisionRequest.student_id}
          childName={selectedDecisionRequest.student_name}
        />
      )}

      {/* Add Child Popover Modal */}
      {showAddChildPopup && (
        <AddGraderPopup
          showBox={showAddChildPopup}
          setShowBox={setShowAddChildPopup}
          onClose={() => {
            setShowAddChildPopup(false);
            getGraderDetails();
          }}
        />
      )}
    </Box>
  );
};

export default Navbar;