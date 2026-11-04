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
  Portal,
} from "@chakra-ui/react";
import {
  FiBell,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiCheckCircle,
  FiBookOpen,
  FiAward,
} from "react-icons/fi";

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: "system" | "quiz" | "report" | "award" | "class_change";
  request?: any;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNotificationClick?: (item: NotificationItem) => void;
  themeColor?: "blue" | "purple";
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
  themeColor = "blue",
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const accentColor = themeColor === "purple" ? "#7C3AED" : "#206CE1";
  const accentLight = themeColor === "purple" ? "purple.50" : "blue.50";

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (notif: NotificationItem) => {
    if (notif.request || notif.type === "class_change") return FiAlertCircle;
    if (notif.type === "award" || notif.title.toLowerCase().includes("reward")) return FiAward;
    if (notif.type === "quiz" || notif.title.toLowerCase().includes("quiz")) return FiBookOpen;
    return FiBell;
  };

  return (
    <Portal>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
        zIndex={2000}
        display="flex"
        alignItems={{ base: "flex-end", sm: "center" }}
        justifyContent="center"
        p={{ base: 0, sm: 4 }}
        onClick={onClose}
      >
        {/* Modal Sheet / Container */}
        <Box
          bg="white"
          w="full"
          maxW={{ base: "100%", sm: "520px" }}
          maxH={{ base: "90vh", sm: "85vh" }}
          borderTopRadius={{ base: "2xl", sm: "2xl" }}
          borderBottomRadius={{ base: "none", sm: "2xl" }}
          boxShadow="2xl"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          onClick={(e) => e.stopPropagation()}
          border="1px solid"
          borderColor="gray.100"
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            px={{ base: 4, sm: 5 }}
            py={4}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <HStack gap={3}>
              <Box
                p={2}
                borderRadius="xl"
                bg={accentLight}
                color={accentColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiBell size={20} />
              </Box>
              <Box>
                <HStack gap={2}>
                  <Heading size="md" color="gray.900" fontWeight="800">
                    Notifications
                  </Heading>
                  {unreadCount > 0 && (
                    <Badge
                      bg={accentColor}
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                      fontWeight="bold"
                    >
                      {unreadCount} new
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Stay updated with quizzes, reports, and alerts
                </Text>
              </Box>
            </HStack>

            <HStack gap={1.5}>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  color={accentColor}
                  _hover={{ bg: accentLight }}
                  onClick={onMarkAllRead}
                  fontWeight="bold"
                  borderRadius="lg"
                  px={2.5}
                >
                  <FiCheck style={{ marginRight: "4px" }} /> Mark all read
                </Button>
              )}
              <IconButton
                aria-label="Close notifications"
                variant="ghost"
                size="sm"
                borderRadius="full"
                color="gray.500"
                _hover={{ bg: "gray.100", color: "gray.800" }}
                onClick={onClose}
              >
                <FiX size={18} />
              </IconButton>
            </HStack>
          </Flex>

          {/* Filter Pills */}
          <Flex
            px={{ base: 4, sm: 5 }}
            py={2.5}
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.100"
            gap={2}
          >
            <Button
              size="xs"
              borderRadius="full"
              px={3}
              fontWeight="bold"
              bg={filter === "all" ? accentColor : "white"}
              color={filter === "all" ? "white" : "gray.600"}
              border="1px solid"
              borderColor={filter === "all" ? accentColor : "gray.200"}
              _hover={{ bg: filter === "all" ? accentColor : "gray.100" }}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </Button>
            <Button
              size="xs"
              borderRadius="full"
              px={3}
              fontWeight="bold"
              bg={filter === "unread" ? accentColor : "white"}
              color={filter === "unread" ? "white" : "gray.600"}
              border="1px solid"
              borderColor={filter === "unread" ? accentColor : "gray.200"}
              _hover={{ bg: filter === "unread" ? accentColor : "gray.100" }}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
          </Flex>

          {/* Notifications Scrollable List */}
          <Box flex="1" overflowY="auto" p={{ base: 3, sm: 4 }}>
            {filteredNotifs.length === 0 ? (
              <Box py={12} textAlign="center">
                <Box
                  boxSize="52px"
                  borderRadius="full"
                  bg="gray.100"
                  color="gray.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={3}
                >
                  <FiCheckCircle size={26} />
                </Box>
                <Heading size="sm" color="gray.700" fontWeight="700">
                  You're all caught up!
                </Heading>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  No {filter === "unread" ? "unread " : ""}notifications at this time.
                </Text>
              </Box>
            ) : (
              <VStack gap={3} align="stretch">
                {filteredNotifs.map((item) => {
                  const IconComp = getNotifIcon(item);
                  const isExpanded = !!expandedIds[item.id];
                  const isLong = item.desc && item.desc.length > 95;

                  return (
                    <Box
                      key={item.id}
                      bg={item.read ? "white" : "#F8FAFC"}
                      p={{ base: 3.5, sm: 4 }}
                      borderRadius="xl"
                      border="1.5px solid"
                      borderColor={item.read ? "gray.100" : (themeColor === "purple" ? "purple.200" : "blue.200")}
                      boxShadow="0 1px 4px rgba(0,0,0,0.03)"
                      transition="all 0.2s ease"
                      _hover={{
                        borderColor: accentColor,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      }}
                      cursor={onNotificationClick ? "pointer" : "default"}
                      onClick={() => onNotificationClick?.(item)}
                    >
                      <Flex align="flex-start" gap={3}>
                        {/* Icon */}
                        <Box
                          p={2}
                          borderRadius="lg"
                          bg={item.read ? "gray.100" : accentLight}
                          color={item.read ? "gray.500" : accentColor}
                          flexShrink={0}
                          mt={0.5}
                        >
                          <IconComp size={16} />
                        </Box>

                        {/* Content */}
                        <Box flex="1" minW={0}>
                          <Flex justify="space-between" align="baseline" gap={2}>
                            <Text
                              fontSize="14px"
                              fontWeight={item.read ? "700" : "800"}
                              color="gray.900"
                              lineHeight="1.2"
                            >
                              {item.title}
                            </Text>
                            <HStack gap={1.5} flexShrink={0}>
                              <Text fontSize="11px" color="gray.400" fontWeight="500">
                                {item.time}
                              </Text>
                              {!item.read && (
                                <Box
                                  w="7px"
                                  h="7px"
                                  borderRadius="full"
                                  bg={accentColor}
                                  flexShrink={0}
                                />
                              )}
                            </HStack>
                          </Flex>

                          {/* Adjustable Card Description */}
                          <Text
                            fontSize="13px"
                            color="gray.600"
                            mt={1.5}
                            lineHeight="1.45"
                            {...(!isExpanded && isLong
                              ? {
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }
                              : {})}
                          >
                            {item.desc}
                          </Text>

                          {/* Expandable toggle for longer text cards */}
                          {isLong && (
                            <Button
                              variant="ghost"
                              size="xs"
                              p={0}
                              h="auto"
                              mt={1.5}
                              color={accentColor}
                              fontWeight="bold"
                              fontSize="11px"
                              onClick={(e) => toggleExpand(item.id, e)}
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

                          {/* Class Change Action Trigger if applicable */}
                          {item.request && (
                            <Button
                              size="xs"
                              bg={accentColor}
                              color="white"
                              borderRadius="lg"
                              mt={2.5}
                              fontWeight="bold"
                              _hover={{ opacity: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onNotificationClick?.(item);
                              }}
                            >
                              Review & Make Decision
                            </Button>
                          )}
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};
