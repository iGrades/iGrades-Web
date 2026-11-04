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
import { NotificationsModal } from "@/components/NotificationsModal";

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

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);



  const pageTitleMap: Record<string, string> = {
    home: t("Home") || "Home",
    student: t("Students") || "Students",
    weekly_report: t("Learning Reports") || "Reports",
    settings: t("Settings") || "Settings",
    notifications: t("Notifications") || "Notifications",
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
    <Box position="sticky" top="0" zIndex="1000" bg={{ base: "white", _dark: "#121212" }} shadow="xs" borderBottom="1px solid" borderColor={{ base: "gray.100", _dark: "#262626" }} pt="env(safe-area-inset-top, 0px)">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        h={{ base: "56px", md: "64px" }}
        px={{ base: 3, md: 6 }}
      >
        {/* Left Section: User Profile Avatar with Clickable Menu & Greeting (Matches Student App) */}
        <HStack gap={{ base: 4, sm: 5 }} align="center">
          {/* User Profile Avatar with Direct Click to Settings & Profile */}
          <Box
            p={0.5}
            borderRadius="full"
            cursor="pointer"
            _hover={{ ring: "2px solid", ringColor: "purple.300", transform: "scale(1.05)" }}
            transition="all 0.15s ease"
            minW="38px"
            minH="38px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-label="Parent profile and settings"
            onClick={() => {
              setCurrentParentPage("settings");
              setParentSettingsTab("profile");
            }}
          >
            <AvatarComp username={fullName} profileImage={currentParent?.profile_image} />
          </Box>

          {/* Greeting: 'Hello {firstName} 👋' and Current Page Name Swipe-Up Sequence */}
          <SwipeUpNavGreeting
            firstName={parentFirstName}
            pageTitle={currentPageTitle}
            subtitleGreeting={`Parent Portal · ${studentsData?.length || 0} ${studentsData?.length === 1 ? "Child" : "Children"} Connected`}
            subtitlePage={`Parent Portal · ${currentPageTitle}`}
          />
        </HStack>

        {/* Right Section: Notifications Bell Icon */}
        <HStack gap={{ base: 1.5, sm: 2 }} align="center">
          <Box position="relative">
            <IconButton
              aria-label="Open notifications"
              variant="ghost"
              borderRadius="full"
              size="sm"
              h="38px"
              w="38px"
              bg={currentParentPage === "notifications" ? { base: "#F3E8FF", _dark: "rgba(124, 58, 237, 0.2)" } : "transparent"}
              color={currentParentPage === "notifications" ? "#7C3AED" : { base: "gray.600", _dark: "gray.300" }}
              _hover={{ bg: { base: "gray.100", _dark: "gray.800" }, color: "purple.400" }}
              onClick={() => setCurrentParentPage("notifications")}
            >
              <FiBell size={20} />
            </IconButton>
            {unreadCount > 0 && (
              <Box
                position="absolute"
                top="5px"
                right="5px"
                w="8px"
                h="8px"
                bg="#7C3AED"
                borderRadius="full"
                border="2px solid white"
              />
            )}
          </Box>
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