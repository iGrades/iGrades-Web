import {
  Flex,
  Image,
  Box,
  Heading,
  Text,
  Menu,
  Portal,
  Select,
  createListCollection,
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
  FiGlobe,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiHelpCircle,
  FiShield,
  FiCreditCard,
} from "react-icons/fi";
import logo from "../../assets/logo.png";
import AvatarComp from "../../components/avatar";
import { setGlobalLanguage } from "@/services/autoTranslation";
import { useStudentsData } from "../context/studentsDataContext";
import { classChangeService, type ClassChangeRequest } from "@/services/classChangeService";
import { ClassChangeNotificationModal } from "./grader/ClassChangeNotificationModal";

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
  const { parent } = useUser();
  const { studentsData } = useStudentsData();
  const { setCurrentParentPage, setParentSettingsTab } = useNavigationStore();
  const { t, i18n } = useTranslation();

  const [selectedDecisionRequest, setSelectedDecisionRequest] = useState<ClassChangeRequest | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const [value, setValue] = useState<string[]>([localStorage.getItem("appLanguage") || i18n.language || "en"]);

  useEffect(() => {
    const handleLang = (e: any) => {
      if (e.detail?.lang) {
        setValue([e.detail.lang]);
      }
    };
    window.addEventListener("appLanguageChanged", handleLang);
    return () => window.removeEventListener("appLanguageChanged", handleLang);
  }, []);

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
  const parentName = currentParent.firstname || "Parent";
  const fullName = `${currentParent.firstname ?? ""} ${currentParent.lastname ?? ""}`.trim() || "Parent User";

  const languages = createListCollection({
    items: [
      { label: t("langEn") || "English", value: "en" },
      { label: t("langHa") || "Hausa", value: "ha" },
      { label: t("langYo") || "Yoruba", value: "yo" },
      { label: t("langIg") || "Igbo", value: "ig" },
      { label: t("langAk") || "Akan", value: "ak" },
      { label: t("langFf") || "Fulfulde", value: "ff" },
      { label: t("langWo") || "Wolof", value: "wo" },
      { label: t("langFr") || "Français", value: "fr" },
      { label: t("langPt") || "Português", value: "pt" },
    ],
  });

  return (
    <Box position="sticky" top="0" zIndex="1000" bg="white" shadow="xs" borderBottom="1px solid" borderColor="gray.100">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        h={{ base: "64px", md: "72px" }}
        px={{ base: 3, md: 6 }}
      >
        {/* Left Section: Logo */}
        <HStack gap={{ base: 2, md: 4 }}>
          <Box
            cursor="pointer"
            onClick={() => setCurrentParentPage("home")}
            display="flex"
            alignItems="center"
            gap={2}
            transition="transform 0.15s ease"
            _hover={{ transform: "scale(1.02)" }}
          >
            <Image src={logo} alt="iGrades Logo" h={{ base: "32px", md: "38px" }} fit="contain" />
          </Box>
        </HStack>

        {/* Center/Greeting Section */}
        <Box display={{ base: "none", sm: "block" }} maxW={{ base: "180px", md: "280px", lg: "400px" }}>
          <Heading
            as="h1"
            fontSize={{ base: "xs", md: "sm", lg: "md" }}
            fontWeight="bold"
            color="gray.800"
            truncate
          >
            {t("welcome") || "Welcome"}, {parentName}! 👋
          </Heading>
          <Text fontSize="xs" color="gray.500" truncate display={{ base: "none", md: "block" }}>
            {t("welcome_complement") || "Monitor and support your child's academic journey"}
          </Text>
        </Box>

        {/* Right Controls: Language Selector, Notifications, User Avatar */}
        <HStack gap={{ base: 2, md: 3 }}>
          {/* Language Selector */}
          <Select.Root
            collection={languages}
            width={{ base: "85px", sm: "105px", md: "125px" }}
            value={value}
            onValueChange={(e) => {
              setValue(e.value);
              if (e.value[0]) {
                i18n.changeLanguage(e.value[0]);
                setGlobalLanguage(e.value[0]);
              }
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2.5}
                py={1.5}
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                bg="gray.50"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                h="36px"
              >
                <HStack gap={1.5} overflow="hidden">
                  <FiGlobe size={15} color="#525071" />
                  <Select.ValueText placeholder="EN" />
                </HStack>
              </Select.Trigger>
            </Select.Control>
            <Portal>
              <Select.Positioner zIndex={1500}>
                <Select.Content bg="white" shadow="lg" border="1px solid" borderColor="gray.100" borderRadius="xl">
                  {languages.items.map((language) => (
                    <Select.Item
                      item={language}
                      key={language.value}
                      cursor="pointer"
                      py={2}
                      px={3}
                      _hover={{ bg: "purple.50" }}
                    >
                      {language.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* Notifications Popover */}
          <Popover.Root positioning={{ placement: "bottom-end" }}>
            <Popover.Trigger asChild>
              <Box position="relative">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  borderRadius="full"
                  size="sm"
                  h="36px"
                  w="36px"
                  color="gray.600"
                  _hover={{ bg: "gray.100", color: "purple.600" }}
                >
                  <FiBell size={18} />
                </IconButton>
                {unreadCount > 0 && (
                  <Box
                    position="absolute"
                    top="4px"
                    right="4px"
                    w="8px"
                    h="8px"
                    bg="purple.500"
                    borderRadius="full"
                    border="2px solid white"
                  />
                )}
              </Box>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner zIndex={1500}>
                <Popover.Content
                  width={{ base: "290px", sm: "330px" }}
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
                          Parent Alerts
                        </Heading>
                        {unreadCount > 0 && (
                          <Badge colorPalette="purple" variant="solid" borderRadius="full" px={2} fontSize="10px">
                            {unreadCount} new
                          </Badge>
                        )}
                      </HStack>
                      {unreadCount > 0 && (
                        <Text
                          fontSize="xs"
                          color="purple.600"
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
                  <Stack p={2} gap={1} maxH="280px" overflowY="auto">
                    {notifications.map((item) => (
                      <Box
                        key={item.id}
                        p={2.5}
                        borderRadius="lg"
                        bg={item.read ? "transparent" : item.request ? "blue.50/50" : "purple.50/60"}
                        cursor={item.request ? "pointer" : "default"}
                        _hover={{ bg: item.request ? "blue.50" : "gray.50" }}
                        transition="background 0.15s ease"
                        onClick={() => handleNotificationItemClick(item)}
                      >
                        <Flex justify="space-between" align="baseline" mb={0.5}>
                          <HStack gap={1.5} maxW="75%">
                            {item.request && (
                              <Badge
                                colorPalette={
                                  item.request.status === "approved"
                                    ? "green"
                                    : item.request.status === "rejected"
                                    ? "red"
                                    : "amber"
                                }
                                size="2xs"
                                fontSize="9px"
                                fontWeight="700"
                              >
                                {item.request.status.toUpperCase()}
                              </Badge>
                            )}
                            <Text fontSize="xs" fontWeight="bold" color="gray.800" truncate>
                              {item.title}
                            </Text>
                          </HStack>
                          <Text fontSize="10px" color="gray.400" flexShrink={0}>
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

          {/* User Profile Menu */}
          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <HStack
                gap={1.5}
                p={1}
                pr={{ base: 1, md: 2 }}
                borderRadius="full"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                transition="background 0.15s ease"
              >
                <AvatarComp username={fullName} profileImage={currentParent?.profile_image} />
                <FiChevronDown size={14} color="#718096" />
              </HStack>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner zIndex={1500}>
                <Menu.Content bg="white" shadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.100" minW="220px" p={2}>
                  {/* User Header */}
                  <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100" mb={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800" truncate>
                      {fullName}
                    </Text>
                    <HStack justify="space-between" align="center" mt={0.5}>
                      <Badge colorPalette="purple" variant="subtle" size="xs" borderRadius="md">
                        Parent / Guardian
                      </Badge>
                    </HStack>
                  </Box>

                  {/* Profile Account Actions (not duplicating sidebar nav) */}
                  <Menu.Item
                    value="parent-profile"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("igrade");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "purple.50", color: "purple.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiUser size={16} />
                      <Text fontSize="sm">My Parent Profile</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="parent-subscription"
                    onClick={() => {
                      setCurrentParentPage("settings");
                      setParentSettingsTab("subscription");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "purple.50", color: "purple.600" }}
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
                    _hover={{ bg: "purple.50", color: "purple.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiShield size={16} />
                      <Text fontSize="sm">Security & Passkey</Text>
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
                    _hover={{ bg: "purple.50", color: "purple.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiHelpCircle size={16} />
                      <Text fontSize="sm">Help & FAQs</Text>
                    </HStack>
                  </Menu.Item>

                  <Box my={1} borderBottom="1px solid" borderColor="gray.100" />

                  {/* Logout Button */}
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
    </Box>
  );
};

export default Navbar;