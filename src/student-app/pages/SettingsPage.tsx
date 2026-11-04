"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  VStack,
  Image,
  Icon,
  Switch,
  Spinner,
} from "@chakra-ui/react";
import {
  FiUser,
  FiGlobe,
  FiShield,
  FiBell,
  FiCreditCard,
  FiHelpCircle,
  FiChevronRight,
  FiEdit2,
  FiAward,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMaximize,
  FiTv,
} from "react-icons/fi";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useNavigationStore } from "@/store/usenavigationStore";
import { usePointsSystem } from "../hooks/usePointsSystem";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { toaster } from "@/components/ui/toaster";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBackButton } from "@/hooks/useBackButton";
import { StudentLogoutModal } from "../components/StudentLogoutModal";

import Profile from "../components/settings/profile/profile";
import Security from "../components/settings/security";
import Notifications from "../components/settings/notifications";
import Subscription from "../components/settings/subscription";
import HelpFaqs from "../components/settings/helpFaqs";
import LanguageSettings from "../components/settings/languageSettings";

const NOTIF_STORAGE_KEY = "igrades_student_notification_prefs";

const SettingsPage: React.FC = () => {
  const { authdStudent, setAuthdStudent, logoutFunc } = useAuthdStudentData();
  const { studentSettingsTab, setStudentSettingsTab } = useNavigationStore();
  const { pointsBalance } = usePointsSystem();
  const { i18n } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hook native back button to return to Settings menu if on subpage
  useBackButton(
    "student-settings-subpage",
    70,
    () => {
      if (studentSettingsTab && studentSettingsTab !== "menu") {
        setStudentSettingsTab("menu");
        return true;
      }
      return false;
    },
    Boolean(studentSettingsTab && studentSettingsTab !== "menu")
  );

  // Master notification toggle (turns on/off all forms of notifications)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Object.values(parsed).some(Boolean);
      }
    } catch {
      // fallback
    }
    return true;
  });

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail && typeof e.detail.enabled === "boolean") {
        setNotificationsEnabled(e.detail.enabled);
      }
    };
    window.addEventListener("studentNotificationsToggled", handleSync);
    return () => window.removeEventListener("studentNotificationsToggled", handleSync);
  }, []);

  const handleToggleAllNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    const updated = {
      appAlerts: checked,
      quizReminders: checked,
      streakAlerts: checked,
      academicReports: checked,
    };
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("studentNotificationsToggled", { detail: { enabled: checked } })
      );
    } catch (e) {
      console.error(e);
    }
    toaster.create({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked
        ? "All app notifications and study reminders are now active."
        : "All notifications have been turned off.",
      type: "info",
      duration: 2500,
    });
  };

  const { theme, isDark, setTheme, isFullscreen, setFullscreen } = useAppTheme();

  const handleSelectThemeMode = async (mode: "light" | "dark" | "system") => {
    await setTheme(mode);
    toaster.create({
      title: mode === "system" ? "System Default Theme" : mode === "dark" ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: mode === "system"
        ? "Theme will match your device system settings."
        : mode === "dark"
        ? "iGrades is now set to dark theme."
        : "iGrades is now set to light theme.",
      type: "info",
      duration: 2500,
    });
  };

  const handleToggleFullscreen = async (checked: boolean) => {
    await setFullscreen(checked);
    toaster.create({
      title: checked ? "Full-Screen Mode Enabled" : "Full-Screen Mode Disabled",
      description: checked
        ? "Application expanded to full screen."
        : "Standard display mode restored.",
      type: "info",
      duration: 2500,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authdStudent?.id) return;

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${authdStudent.id}.${fileExt}`;
      const filePath = `students/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      // Persist in DB
      const { error: updateError } = await supabase.rpc("update_student_profile", {
        p_id: authdStudent.id,
        p_firstname: authdStudent.firstname || "",
        p_lastname: authdStudent.lastname || "",
        p_class: authdStudent.class || "",
        p_email: authdStudent.email || "",
        p_profile_image: publicUrl,
      });

      if (updateError) {
        await supabase
          .from("students")
          .update({ profile_image: publicUrl })
          .eq("id", authdStudent.id);
      }

      setAuthdStudent((prev: any) => ({
        ...prev,
        profile_image: publicUrl,
      }));

      toaster.create({
        title: "Photo Updated",
        description: "Your profile picture has been updated successfully.",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toaster.create({
        title: "Upload Failed",
        description: err.message || "Failed to update profile picture. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const studentFullName =
    `${authdStudent?.firstname || ""} ${authdStudent?.lastname || ""}`.trim() || "Student Profile";

  const currentTab = studentSettingsTab || "menu";

  // If viewing a specific subpage, render edge-to-edge 100% width with back header
  if (currentTab !== "menu") {
    let subpageTitle = "Settings";
    let subpageContent = <Profile />;

    if (currentTab === "language") {
      subpageTitle = "Language Preferences";
      subpageContent = <LanguageSettings />;
    } else if (currentTab === "security") {
      subpageTitle = "Security & Passkey";
      subpageContent = <Security />;
    } else if (currentTab === "notification") {
      subpageTitle = "Notification Preferences";
      subpageContent = <Notifications />;
    } else if (currentTab === "subscription") {
      subpageTitle = "Subscription & Plans";
      subpageContent = <Subscription />;
    } else if (currentTab === "help" || currentTab === "faqs") {
      subpageTitle = "Help & FAQs";
      subpageContent = <HelpFaqs />;
    } else {
      subpageTitle = "Profile Information";
      subpageContent = <Profile />;
    }

    return (
      <Box w="100%" m={0} p={0} pt={3} pb={16}>
        {/* Subpage Header (left arrow removed; native phone back button handles return) */}
        <Box mb={4} px={{ base: 4, sm: 6 }}>
          <Heading fontSize={{ base: "18px", md: "20px" }} fontWeight="700" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
            {subpageTitle}
          </Heading>
        </Box>

        <Box w="100%" m={0} p={0}>
          {subpageContent}
        </Box>
      </Box>
    );
  }

  // Main mobile Settings & Profile landing view: 100% full width edge-to-edge, zero border/outline/shadow
  return (
    <Box w="100%" m={0} p={0} pt={4} pb={16}>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handlePhotoUpload}
      />

      {/* ─── Profile Header Section (Rounded Square Photo, Name, Points) ─── */}
      <Flex direction="column" align="center" justify="center" w="100%" px={4} pb={4}>
        {/* Photo with Rounded Square shape (not circle) and Pencil Icon badge on lower right */}
        <Box position="relative">
          <Box
            position="relative"
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Click to edit profile photo"
          >
            {authdStudent?.profile_image ? (
              <Image
                src={authdStudent.profile_image}
                alt={studentFullName}
                boxSize={{ base: "100px", sm: "110px" }}
                borderRadius="2xl"
                objectFit="cover"
                border="none"
                outline="none"
                boxShadow="none"
              />
            ) : (
              <Flex
                boxSize={{ base: "100px", sm: "110px" }}
                borderRadius="2xl"
                bg="#288AE4"
                color="white"
                align="center"
                justify="center"
                fontSize="36px"
                fontWeight="800"
                border="none"
                outline="none"
                boxShadow="none"
              >
                {authdStudent?.firstname?.[0]?.toUpperCase() || "S"}
              </Flex>
            )}

            {/* Upload Spinner Overlay */}
            {isUploadingPhoto && (
              <Flex
                position="absolute"
                inset={0}
                borderRadius="2xl"
                bg="black/40"
                align="center"
                justify="center"
              >
                <Spinner size="md" color="white" />
              </Flex>
            )}

            {/* Pencil Icon Badge on Lower Right of Rounded Square (No border, outline, or shadow) */}
            <Flex
              position="absolute"
              bottom="-4px"
              right="-4px"
              bg="#288AE4"
              color="white"
              boxSize="32px"
              borderRadius="xl"
              border="none"
              outline="none"
              boxShadow="none"
              align="center"
              justify="center"
              _hover={{ bg: "#1D75C7" }}
              _active={{ bg: "#185BA9" }}
              transition="all 0.15s"
            >
              <Icon as={FiEdit2} boxSize="14px" />
            </Flex>
          </Box>
        </Box>

        {/* Student First & Last Name below Photo */}
        <Heading
          as="h1"
          fontSize={{ base: "18px", sm: "20px" }}
          fontWeight="800"
          color={{ base: "#1E293B", _dark: "#F8FAFC" }}
          mt={3}
          textAlign="center"
        >
          {studentFullName}
        </Heading>

        {authdStudent?.class && (
          <Text fontSize="12px" color={{ base: "#64748B", _dark: "#94A3B8" }} fontWeight="500" mt={0.5}>
            {authdStudent.class} {authdStudent.school ? `· ${authdStudent.school}` : ""}
          </Text>
        )}

        {/* IGG Points Section below Name with Award Icon */}
        <HStack
          gap={2}
          bg={{ base: "#FFFBEB", _dark: "rgba(245, 158, 11, 0.15)" }}
          border="none"
          outline="none"
          boxShadow="none"
          px={4}
          py={1.5}
          borderRadius="full"
          mt={2.5}
        >
          <Icon as={FiAward} color={{ base: "#D97706", _dark: "#F59E0B" }} boxSize="16px" />
          <Text fontSize="13px" fontWeight="700" color={{ base: "#92400E", _dark: "#FCD34D" }}>
            {pointsBalance.toLocaleString()} IGG Points
          </Text>
        </HStack>
      </Flex>

      {/* ─── Settings Items Horizontal List (100% width edge-to-edge with vertical spacing between each item) ─── */}
      <VStack
        w="100%"
        gap={3}
        mt={4}
        align="stretch"
        border="none"
        outline="none"
      >
        {/* 1. Profile */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#EDF2F7", _dark: "#242424" } }}
          _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("profile")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#EFF6FF", _dark: "rgba(37, 99, 235, 0.2)" }}
              color="#2563EB"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiUser} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Profile
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                Personal info & class level
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color={{ base: "#94A3B8", _dark: "#64748B" }} boxSize="18px" />
        </Flex>

        {/* 2. Language */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#EDF2F7", _dark: "#242424" } }}
          _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("language")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#F0FDFA", _dark: "rgba(13, 148, 136, 0.2)" }}
              color="#0D9488"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiGlobe} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Language
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                {i18n.language ? i18n.language.toUpperCase() : "English"}
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color={{ base: "#94A3B8", _dark: "#64748B" }} boxSize="18px" />
        </Flex>

        {/* 3. Security */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#EDF2F7", _dark: "#242424" } }}
          _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("security")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#FAF5FF", _dark: "rgba(147, 51, 234, 0.2)" }}
              color="#9333EA"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiShield} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Security
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                Password & passkey security
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color={{ base: "#94A3B8", _dark: "#64748B" }} boxSize="18px" />
        </Flex>

        {/* 4. Notifications (Toggle Switch) */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#FFFBEB", _dark: "rgba(217, 119, 6, 0.2)" }}
              color="#D97706"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiBell} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Notifications
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                {notificationsEnabled ? "All notifications active" : "Notifications muted"}
              </Text>
            </Box>
          </HStack>

          {/* Toggle turns on/off all forms of notifications */}
          <Switch.Root
            checked={notificationsEnabled}
            onCheckedChange={(e) => handleToggleAllNotifications(e.checked)}
            colorPalette="blue"
            size="md"
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </Flex>

        {/* 5. Theme Mode Selection (Light / Dark / System Default) */}
        <Box
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
        >
          <Flex align="center" justify="space-between" mb={3}>
            <HStack gap={3.5}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="xl"
                bg={{ base: "#FAF5FF", _dark: "rgba(147, 51, 234, 0.2)" }}
                color={isDark ? "#F59E0B" : "#9333EA"}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={isDark ? FiMoon : FiSun} boxSize="18px" />
              </Flex>
              <Box>
                <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                  Appearance & Theme
                </Text>
                <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                  {theme === "system"
                    ? "Matching device system theme"
                    : theme === "dark"
                    ? "Dark theme active"
                    : "Light theme active"}
                </Text>
              </Box>
            </HStack>
          </Flex>

          {/* Segmented Theme Buttons: Light / Dark / System */}
          <Flex
            bg={{ base: "#E2E8F0", _dark: "#121212" }}
            p="3px"
            borderRadius="xl"
            gap={1}
            w="100%"
          >
            <Flex
              flex="1"
              py={2}
              px={2}
              align="center"
              justify="center"
              gap={1.5}
              borderRadius="lg"
              cursor="pointer"
              bg={theme === "light" ? { base: "#FFFFFF", _dark: "#262626" } : "transparent"}
              color={theme === "light" ? { base: "#2563EB", _dark: "#60A5FA" } : { base: "#64748B", _dark: "#A1A1AA" }}
              fontWeight={theme === "light" ? "700" : "500"}
              boxShadow={theme === "light" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
              onClick={() => handleSelectThemeMode("light")}
              transition="all 0.15s"
              role="button"
            >
              <Icon as={FiSun} boxSize="14px" />
              <Text fontSize="12px">Light</Text>
            </Flex>

            <Flex
              flex="1"
              py={2}
              px={2}
              align="center"
              justify="center"
              gap={1.5}
              borderRadius="lg"
              cursor="pointer"
              bg={theme === "dark" ? { base: "#FFFFFF", _dark: "#262626" } : "transparent"}
              color={theme === "dark" ? { base: "#2563EB", _dark: "#60A5FA" } : { base: "#64748B", _dark: "#A1A1AA" }}
              fontWeight={theme === "dark" ? "700" : "500"}
              boxShadow={theme === "dark" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
              onClick={() => handleSelectThemeMode("dark")}
              transition="all 0.15s"
              role="button"
            >
              <Icon as={FiMoon} boxSize="14px" />
              <Text fontSize="12px">Dark</Text>
            </Flex>

            <Flex
              flex="1"
              py={2}
              px={2}
              align="center"
              justify="center"
              gap={1.5}
              borderRadius="lg"
              cursor="pointer"
              bg={theme === "system" ? { base: "#FFFFFF", _dark: "#262626" } : "transparent"}
              color={theme === "system" ? { base: "#2563EB", _dark: "#60A5FA" } : { base: "#64748B", _dark: "#A1A1AA" }}
              fontWeight={theme === "system" ? "700" : "500"}
              boxShadow={theme === "system" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
              onClick={() => handleSelectThemeMode("system")}
              transition="all 0.15s"
              role="button"
            >
              <Icon as={FiTv} boxSize="14px" />
              <Text fontSize="12px">System</Text>
            </Flex>
          </Flex>
        </Box>

        {/* 6. Full-Screen Mode Toggle */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#F0FDF4", _dark: "rgba(22, 163, 74, 0.2)" }}
              color="#16A34A"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiMaximize} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Full-Screen Mode
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                {isFullscreen ? "App expanded across full screen" : "Standard screen view"}
              </Text>
            </Box>
          </HStack>

          <Switch.Root
            checked={isFullscreen}
            onCheckedChange={(e) => handleToggleFullscreen(e.checked)}
            colorPalette="green"
            size="md"
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        </Flex>

        {/* 6. Subscription */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#EDF2F7", _dark: "#242424" } }}
          _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("subscription")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#EEF2FF", _dark: "rgba(79, 70, 229, 0.2)" }}
              color="#4F46E5"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiCreditCard} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Subscription
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                Manage academic plan & billing
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color={{ base: "#94A3B8", _dark: "#64748B" }} boxSize="18px" />
        </Flex>

        {/* 7. Help & FAQs */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#EDF2F7", _dark: "#242424" } }}
          _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("help")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#F1F5F9", _dark: "rgba(100, 116, 139, 0.2)" }}
              color={{ base: "#475569", _dark: "#94A3B8" }}
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiHelpCircle} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color={{ base: "#1E293B", _dark: "#F8FAFC" }}>
                Help & FAQs
              </Text>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                Guides, quizzes & support
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color={{ base: "#94A3B8", _dark: "#64748B" }} boxSize="18px" />
        </Flex>

        {/* 8. Log Out */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg={{ base: "#F4F7FB", _dark: "#1A1A1A" }}
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: { base: "#FEE2E2", _dark: "rgba(239, 68, 68, 0.2)" } }}
          _active={{ bg: { base: "#FECACA", _dark: "rgba(239, 68, 68, 0.3)" } }}
          transition="background 0.15s"
          onClick={() => setShowLogoutModal(true)}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={{ base: "#FEF2F2", _dark: "rgba(220, 38, 38, 0.2)" }}
              color="#DC2626"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiLogOut} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#DC2626">
                Log Out
              </Text>
              <Text fontSize="11px" color="#EF4444">
                Sign out of this session
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#EF4444" boxSize="18px" />
        </Flex>
      </VStack>

      {/* Student Logout Confirmation Modal */}
      <StudentLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </Box>
  );
};

export default SettingsPage;
