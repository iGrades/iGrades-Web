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
  SkeletonText,
} from "@chakra-ui/react";
import { useState, type SetStateAction, type Dispatch } from "react";
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
} from "react-icons/fi";
import logo from "../../assets/logo.png";
import AvatarComp from "../../components/avatar";

type Props = {
  setShowLogoutModal: Dispatch<SetStateAction<boolean>>;
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const Navbar = ({ setShowLogoutModal }: Props) => {
  const { parent, loading } = useUser();
  const { setCurrentParentPage } = useNavigationStore();
  const { t, i18n } = useTranslation();

  const [value, setValue] = useState<string[]>([i18n.language || "en"]);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return <SkeletonText noOfLines={1} gap="4" p={4} />;
  }

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

        {/* Right Controls: Role Badge, Language Selector, Notifications, User Avatar */}
        <HStack gap={{ base: 2, md: 3 }}>
          <Badge
            display={{ base: "none", md: "inline-flex" }}
            variant="subtle"
            colorPalette="purple"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="medium"
          >
            <HStack gap={1}>
              <FiUser size={13} />
              <Text>Parent Portal</Text>
            </HStack>
          </Badge>

          {/* Language Selector */}
          <Select.Root
            collection={languages}
            width={{ base: "85px", sm: "105px", md: "125px" }}
            value={value}
            onValueChange={(e) => {
              setValue(e.value);
              if (e.value[0]) {
                i18n.changeLanguage(e.value[0]);
                localStorage.setItem("appLanguage", e.value[0]);
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
                        bg={item.read ? "transparent" : "purple.50/60"}
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
                    onClick={() => setCurrentParentPage("settings")}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "purple.50", color: "purple.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiUser size={16} />
                      <Text fontSize="sm">My Account Profile</Text>
                    </HStack>
                  </Menu.Item>

                  <Menu.Item
                    value="security"
                    onClick={() => setCurrentParentPage("settings")}
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
                    onClick={() => setCurrentParentPage("settings")}
                    borderRadius="lg"
                    py={2}
                    px={3}
                    cursor="pointer"
                    _hover={{ bg: "purple.50", color: "purple.600" }}
                  >
                    <HStack gap={2.5}>
                      <FiHelpCircle size={16} />
                      <Text fontSize="sm">Help & Support</Text>
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
    </Box>
  );
};

export default Navbar;