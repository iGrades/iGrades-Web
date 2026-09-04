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
import { IoSparklesOutline } from "react-icons/io5";
import { MdOutlineQuiz, MdOutlineTimeline } from "react-icons/md";
import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";

interface NotificationPrefs {
  appAlerts: boolean;
  quizReminders: boolean;
  streakAlerts: boolean;
  academicReports: boolean;
}

const STORAGE_KEY = "igrades_student_notification_prefs";

const Notifications = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      appAlerts: true,
      quizReminders: true,
      streakAlerts: true,
      academicReports: true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error("Failed to save notification preferences", e);
    }
  }, [prefs]);

  const handleToggle = (key: keyof NotificationPrefs, checked: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: checked }));
    toaster.create({
      title: "Preference Updated",
      description: `Notification setting has been ${checked ? "enabled" : "disabled"}.`,
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
      title: "General App Notifications",
      desc: "Receive real-time notifications about app updates, new video lessons, and curriculum resources.",
    },
    {
      id: "quizReminders" as const,
      icon: MdOutlineQuiz,
      color: "blue.500",
      bg: "blue.100",
      title: "Quiz & Mock Exam Alerts",
      desc: "Get scheduled reminders for upcoming quizzes, timed mock exams, and past question practices.",
    },
    {
      id: "streakAlerts" as const,
      icon: IoSparklesOutline,
      color: "amber.500",
      bg: "amber.100",
      title: "Daily Login & Streak Reminders",
      desc: "Stay on top of your daily study streaks, bonus reward opportunities, and point multipliers.",
    },
    {
      id: "academicReports" as const,
      icon: MdOutlineTimeline,
      color: "purple.500",
      bg: "purple.100",
      title: "Progress & Mastery Milestones",
      desc: "Celebrate topic completions, highest quiz scores, and subject mastery advancements.",
    },
  ];

  return (
    <Box bg="white" rounded="2xl" shadow="sm" p={{ base: 4, md: 6 }} mb={20} minH="70vh">
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={6} direction={{ base: "column", sm: "row" }} gap={2}>
        <Box>
          <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} color="gray.800">
            Notification Preferences
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Choose which notifications and study reminders you would like to receive.
          </Text>
        </Box>
        <Badge colorPalette="blue" variant="subtle" px={3} py={1} borderRadius="full" fontSize="11px">
          Preferences Auto-Saved
        </Badge>
      </Flex>

      <VStack gap={4} align="stretch">
        {notificationChannels.map((item) => {
          const isChecked = prefs[item.id];
          return (
            <Flex
              key={item.id}
              justify="space-between"
              align="center"
              p={{ base: 4, md: 6 }}
              bg="textFieldColor"
              rounded="xl"
              border="1px"
              borderColor={isChecked ? "gray.200" : "gray.100"}
              transition="all 0.2s"
            >
              <HStack gap={4} align="flex-start" maxW={{ base: "75%", md: "85%" }}>
                <Icon
                  bg={item.bg}
                  boxSize="42px"
                  color={item.color}
                  rounded="xl"
                  p={2.5}
                  flexShrink={0}
                >
                  <item.icon size={22} />
                </Icon>
                <Box>
                  <Heading as="h4" fontSize={{ base: "sm", md: "md" }} color="gray.800">
                    {item.title}
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={1} lineHeight="tall">
                    {item.desc}
                  </Text>
                </Box>
              </HStack>

              <Switch.Root
                checked={isChecked}
                onCheckedChange={(e) => handleToggle(item.id, e.checked)}
                colorPalette="blue"
                size="lg"
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

export default Notifications;
