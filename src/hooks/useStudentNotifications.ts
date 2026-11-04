import { useState, useEffect, useCallback } from "react";
import type { NotificationItem } from "@/components/NotificationsModal";

export interface StudentNotificationItem extends NotificationItem {
  actionPage?: "home" | "quiz" | "learn" | "chat" | "rewards" | "settings";
  actionLabel?: string;
}

const STORAGE_KEY_READ = "igrades_student_read_notifications";
const STORAGE_KEY_DELETED = "igrades_student_deleted_notifications";
const NOTIF_EVENT = "igrades_student_notifications_updated";

const INITIAL_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: "notif-1",
    title: "Welcome to iGrades",
    desc: "Start your learning journey! Practice timed quizzes, review study materials, and build your streaks to earn iGG points.",
    time: "Just now",
    read: false,
    type: "system",
    actionPage: "learn",
    actionLabel: "Explore Subjects",
  },
  {
    id: "notif-2",
    title: "Daily Practice Quizzes Ready",
    desc: "Fresh test questions and curriculum exercises for your enrolled subjects are ready. Take a quick quiz to test your mastery.",
    time: "2 hours ago",
    read: false,
    type: "quiz",
    actionPage: "quiz",
    actionLabel: "Practice Quiz",
  },
  {
    id: "notif-3",
    title: "Study Goal & Streak Update",
    desc: "You completed learning sessions this week! Keep learning daily to unlock bonus iGG points and climb the student leaderboard.",
    time: "1 day ago",
    read: true,
    type: "award",
    actionPage: "rewards",
    actionLabel: "View Rewards",
  },
  {
    id: "notif-4",
    title: "WAEC, BECE & JAMB Past Questions",
    desc: "Over 10 years of verified past examination questions with instant step-by-step solutions are ready in the Learn section.",
    time: "3 days ago",
    read: true,
    type: "quiz",
    actionPage: "learn",
    actionLabel: "Explore Past Questions",
  },
  {
    id: "notif-5",
    title: "Meet Spark AI Tutor",
    desc: "Stuck on a tricky math equation or science concept? Spark AI provides friendly, step-by-step explanations anytime.",
    time: "4 days ago",
    read: true,
    type: "system",
    actionPage: "chat",
    actionLabel: "Ask Spark AI",
  },
];

const getStoredIds = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredIds = (key: string, ids: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const useStudentNotifications = () => {
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);

  const loadNotifications = useCallback(() => {
    const readIds = new Set(getStoredIds(STORAGE_KEY_READ));
    const deletedIds = new Set(getStoredIds(STORAGE_KEY_DELETED));

    const active = INITIAL_NOTIFICATIONS.filter((n) => !deletedIds.has(n.id)).map((n) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));

    setNotifications(active);
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener(NOTIF_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(NOTIF_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadNotifications]);

  const markAsRead = useCallback((id: string) => {
    const currentRead = getStoredIds(STORAGE_KEY_READ);
    if (!currentRead.includes(id)) {
      setStoredIds(STORAGE_KEY_READ, [...currentRead, id]);
      window.dispatchEvent(new Event(NOTIF_EVENT));
    }
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = INITIAL_NOTIFICATIONS.map((n) => n.id);
    setStoredIds(STORAGE_KEY_READ, allIds);
    window.dispatchEvent(new Event(NOTIF_EVENT));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    const currentDeleted = getStoredIds(STORAGE_KEY_DELETED);
    if (!currentDeleted.includes(id)) {
      setStoredIds(STORAGE_KEY_DELETED, [...currentDeleted, id]);
      window.dispatchEvent(new Event(NOTIF_EVENT));
    }
  }, []);

  const clearAll = useCallback(() => {
    const allIds = INITIAL_NOTIFICATIONS.map((n) => n.id);
    setStoredIds(STORAGE_KEY_DELETED, allIds);
    window.dispatchEvent(new Event(NOTIF_EVENT));
  }, []);

  const resetNotifications = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_READ);
      localStorage.removeItem(STORAGE_KEY_DELETED);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(NOTIF_EVENT));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll,
    resetNotifications,
  };
};
