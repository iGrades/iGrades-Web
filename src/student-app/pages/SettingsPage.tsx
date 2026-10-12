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
  FiArrowLeft,
  FiEdit2,
  FiAward,
  FiLogOut,
} from "react-icons/fi";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useNavigationStore } from "@/store/usenavigationStore";
import { usePointsSystem } from "../hooks/usePointsSystem";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { toaster } from "@/components/ui/toaster";

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
        {/* Mobile Header with Back Button (No background, border, or box shadow) */}
        <Flex
          align="center"
          gap={3}
          mb={4}
          px={{ base: 4, sm: 6 }}
          cursor="pointer"
          onClick={() => setStudentSettingsTab("menu")}
          role="button"
          aria-label="Back to Settings"
          w="fit-content"
          bg="transparent"
          border="none"
          outline="none"
          boxShadow="none"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.15s"
        >
          <Icon as={FiArrowLeft} color="#1E293B" boxSize="20px" flexShrink={0} />
          <Box>
            <Heading fontSize={{ base: "16px", md: "18px" }} fontWeight="700" color="#1E293B">
              {subpageTitle}
            </Heading>
            <Text fontSize="11px" color="#64748B">
              Back to Settings & Profile
            </Text>
          </Box>
        </Flex>

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
          color="#1E293B"
          mt={3}
          textAlign="center"
        >
          {studentFullName}
        </Heading>

        {authdStudent?.class && (
          <Text fontSize="12px" color="#64748B" fontWeight="500" mt={0.5}>
            {authdStudent.class} {authdStudent.school ? `· ${authdStudent.school}` : ""}
          </Text>
        )}

        {/* IGG Points Section below Name with Award Icon */}
        <HStack
          gap={2}
          bg="#FFFBEB"
          border="none"
          outline="none"
          boxShadow="none"
          px={4}
          py={1.5}
          borderRadius="full"
          mt={2.5}
        >
          <Icon as={FiAward} color="#D97706" boxSize="16px" />
          <Text fontSize="13px" fontWeight="700" color="#92400E">
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
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#EDF2F7" }}
          _active={{ bg: "#E2E8F0" }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("profile")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#EFF6FF"
              color="#2563EB"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiUser} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Profile
              </Text>
              <Text fontSize="11px" color="#64748B">
                Personal info & class level
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 2. Language */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#EDF2F7" }}
          _active={{ bg: "#E2E8F0" }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("language")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#F0FDFA"
              color="#0D9488"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiGlobe} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Language
              </Text>
              <Text fontSize="11px" color="#64748B">
                {i18n.language ? i18n.language.toUpperCase() : "English"}
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 3. Security */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#EDF2F7" }}
          _active={{ bg: "#E2E8F0" }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("security")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#FAF5FF"
              color="#9333EA"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiShield} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Security
              </Text>
              <Text fontSize="11px" color="#64748B">
                Password & passkey security
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 4. Notifications (Toggle Switch) */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
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
              bg="#FFFBEB"
              color="#D97706"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiBell} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Notifications
              </Text>
              <Text fontSize="11px" color="#64748B">
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

        {/* 5. Subscription */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#EDF2F7" }}
          _active={{ bg: "#E2E8F0" }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("subscription")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#EEF2FF"
              color="#4F46E5"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiCreditCard} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Subscription
              </Text>
              <Text fontSize="11px" color="#64748B">
                Manage academic plan & billing
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 6. Help & FAQs */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#EDF2F7" }}
          _active={{ bg: "#E2E8F0" }}
          transition="background 0.15s"
          onClick={() => setStudentSettingsTab("help")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#F1F5F9"
              color="#475569"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiHelpCircle} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Help & FAQs
              </Text>
              <Text fontSize="11px" color="#64748B">
                Guides, quizzes & support
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 7. Log Out */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          bg="#F4F7FB"
          px={{ base: 4, sm: 6 }}
          py={4}
          border="none"
          outline="none"
          boxShadow="none"
          cursor="pointer"
          _hover={{ bg: "#FEE2E2" }}
          _active={{ bg: "#FECACA" }}
          transition="background 0.15s"
          onClick={() => logoutFunc()}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#FEF2F2"
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
    </Box>
  );
};

export default SettingsPage;
