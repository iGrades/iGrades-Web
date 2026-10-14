import {
  Box,
  Heading,
  Flex,
  Text,
  Icon,
  Switch,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { BiSolidNotification } from "react-icons/bi";
import { MdOutlineAssessment, MdOutlineSecurity, MdOutlineMarkEmailRead } from "react-icons/md";
import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";

interface ParentNotificationPrefs {
  appAlerts: boolean;
  quizAlerts: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
}

const STORAGE_KEY = "igrades_parent_notification_prefs";

const Notification = () => {
  const [prefs, setPrefs] = useState<ParentNotificationPrefs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      appAlerts: true,
      quizAlerts: true,
      weeklyDigest: true,
      securityAlerts: true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error("Failed to save parent notification preferences", e);
    }
  }, [prefs]);

  const handleToggle = (key: keyof ParentNotificationPrefs, checked: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: checked }));
    toaster.create({
      title: "Settings Saved",
      description: `Notification preference has been ${checked ? "turned on" : "turned off"}.`,
      type: "info",
      duration: 2500,
    });
  };

  const notificationChannels = [
    {
      id: "appAlerts" as const,
      icon: BiSolidNotification,
      color: "green.500",
      bg: "green.100",
      title: "Parent Dashboard Alerts",
      desc: "Receive real-time notifications about your children's learning activities, subject registrations, and recommendations.",
    },
    {
      id: "quizAlerts" as const,
      icon: MdOutlineAssessment,
      color: "blue.500",
      bg: "blue.100",
      title: "Quiz & Exam Completion Alerts",
      desc: "Get instant notifications when a child finishes a quiz, mock exam, or past question test with their score and rank.",
    },
    {
      id: "weeklyDigest" as const,
      icon: MdOutlineMarkEmailRead,
      color: "purple.500",
      bg: "purple.100",
      title: "Weekly Academic Performance Digest",
      desc: "Receive a comprehensive weekly performance summary highlighting subject strengths, areas for focus, and time spent studying.",
    },
    {
      id: "securityAlerts" as const,
      icon: MdOutlineSecurity,
      color: "amber.500",
      bg: "amber.100",
      title: "Security & Account Notifications",
      desc: "Alerts for student passcode changes, profile updates, and login attempts on new devices.",
    },
  ];

  return (
    <Box
      bg="white"
      border="none"
      outline="none"
      boxShadow="none"
      p={{ base: 4, sm: 6 }}
      mb={20}
      w="100%"
      h="auto"
    >
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={5} direction={{ base: "column", sm: "row" }} gap={2}>
        <Box>
          <Heading as="h3" fontSize={{ base: "14px", md: "16px" }} fontWeight="700" color="gray.800">
            Parent Notification Settings
          </Heading>
          <Text fontSize="11px" color="gray.500" mt={0.5}>
            Manage how and when you receive monitoring updates and academic reports for your children.
          </Text>
        </Box>
        <Badge colorPalette="green" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="10px">
          Preferences Active
        </Badge>
      </Flex>

      <VStack gap={3} align="stretch">
        {notificationChannels.map((item) => {
          const isChecked = prefs[item.id];
          return (
            <Flex
              key={item.id}
              justify="space-between"
              align="center"
              p={{ base: 3.5, md: 4 }}
              bg="#F4F7FB"
              rounded="xl"
              border="none"
              outline="none"
              boxShadow="none"
              transition="all 0.15s"
            >
              <HStack gap={3.5} align="flex-start" maxW={{ base: "75%", md: "85%" }}>
                <Icon
                  bg={item.bg}
                  boxSize="36px"
                  color={item.color}
                  rounded="lg"
                  p={2}
                  flexShrink={0}
                >
                  <item.icon size={18} />
                </Icon>
                <Box>
                  <Heading as="h4" fontSize={{ base: "12px", sm: "13px" }} fontWeight="600" color="gray.800">
                    {item.title}
                  </Heading>
                  <Text fontSize="11px" color="gray.500" mt={0.5} lineHeight="short">
                    {item.desc}
                  </Text>
                </Box>
              </HStack>

              <Switch.Root
                checked={isChecked}
                onCheckedChange={(e) => handleToggle(item.id, e.checked)}
                colorPalette="blue"
                size="md"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Notification;
