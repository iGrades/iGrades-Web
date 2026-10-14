import { useState } from "react";
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
import { useAuthdStudentData } from "../context/studentDataContext";
import { useNavigationStore } from "../../store/usenavigationStore";
import {
  FiBell,
  FiGlobe,
  FiLogOut,
  FiUser,
  FiHelpCircle,
  FiShield,
} from "react-icons/fi";
import AvatarComp from "../../components/avatar";
import { SwipeUpNavGreeting } from "@/components/SwipeUpNavGreeting";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const Navbar = () => {
  const { authdStudent, setIsPopOver } = useAuthdStudentData();
  const { currentStudentPage, setCurrentStudentPage, setStudentSettingsTab } = useNavigationStore();

  const pageTitleMap: Record<string, string> = {
    home: "Home",
    learn: "Learn",
    quiz: "Practice Quiz",
    chat: "AI Tutor",
    rewards: "Rewards",
    settings: "Settings",
  };
  const currentPageTitle = pageTitleMap[currentStudentPage] || "Home";

  // Notifications state for interactive UX
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Welcome to iGrades!",
      desc: "Explore your subjects, practice quizzes, and track performance.",
      time: "Just now",
      read: false,
    },
    {
      id: "2",
      title: "New Quiz Available",
      desc: "Mathematics & Physics mock exam practice sets are ready.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "Study Goal Update",
      desc: "You completed 3 quiz sessions this week. Great progress!",
      time: "1 day ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const currentStudent = authdStudent || null;
  const studentFirstName = currentStudent?.firstname || "Student";
  const fullName = `${currentStudent?.firstname ?? ""} ${currentStudent?.lastname ?? ""}`.trim() || "Student";

  return (
    <Box position="sticky" top="0" zIndex="1000" bg="white" shadow="xs" borderBottom="1px solid" borderColor="gray.100">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        h={{ base: "56px", md: "64px" }}
        px={{ base: 3, md: 6 }}
      >
        {/* Left Section: Profile Avatar & Greeting 'Hello {userfirstname}' */}
        <HStack gap={{ base: 2.5, sm: 3 }} align="center">
          {/* User Profile Avatar with Clickable Menu */}
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
                aria-label="User profile and settings"
              >
                <AvatarComp username={fullName} profileImage={currentStudent?.profile_image} />
              </Box>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner zIndex={1500}>
                <Menu.Content bg="white" shadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.100" minW="220px" p={2}>
                  {/* User Profile Summary inside Dropdown */}
                  <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100" mb={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800" truncate>
                      {fullName}
                    </Text>
                    <HStack justify="space-between" align="center" mt={0.5}>
                      <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="md">
                        Student
                      </Badge>
                      {currentStudent?.class && (
                        <Text fontSize="11px" color="gray.500" fontWeight="medium">
                          {currentStudent.class}
                        </Text>
                      )}
                    </HStack>
                  </Box>

                  {/* Profile Account Actions */}
                  <Menu.Item
                    value="settings"
                    onClick={() => {
                      setCurrentStudentPage("settings");
                      setStudentSettingsTab("menu");
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
                    value="language"
                    onClick={() => {
                      setCurrentStudentPage("settings");
                      setStudentSettingsTab("language");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiGlobe size={16} />
                      <Text fontSize="sm">Language Settings</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="security"
                    onClick={() => {
                      setCurrentStudentPage("settings");
                      setStudentSettingsTab("security");
                    }}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "blue.50", color: "blue.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiShield size={16} />
                      <Text fontSize="sm">Security & Passkey</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="help"
                    onClick={() => {
                      setCurrentStudentPage("settings");
                      setStudentSettingsTab("help");
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
                    onClick={setIsPopOver ? () => setIsPopOver(true) : undefined}
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

          {/* Greeting: 'Hello {studentFirstName} 👋' and Current Page Name Swipe-Up Sequence */}
          <SwipeUpNavGreeting
            firstName={studentFirstName}
            pageTitle={currentPageTitle}
            subtitleGreeting={currentStudent?.class}
            subtitlePage={currentStudent?.class}
          />
        </HStack>

        {/* Right Section: Notifications Icon */}
        <HStack gap={2} align="center">
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
                  <FiBell size={20} />
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
                          Notifications
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
                  <Stack p={2} gap={1} maxH="280px" overflowY="auto">
                    {notifications.map((item) => (
                      <Box
                        key={item.id}
                        p={2.5}
                        borderRadius="lg"
                        bg={item.read ? "transparent" : "blue.50/60"}
                        _hover={{ bg: "gray.50" }}
                        transition="background 0.15s ease"
                      >
                        <Flex justify="space-between" align="baseline" mb={0.5}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">
                            {item.title}
                          </Text>
                          <Text fontSize="10px" color="gray.400">
                            {item.time}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.600" lineHeight="1.3">
                          {item.desc}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
