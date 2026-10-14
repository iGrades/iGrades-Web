"use client";

import React, { useState, useRef, useEffect, type Dispatch, type SetStateAction } from "react";
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
  FiLogOut,
  FiUsers,
} from "react-icons/fi";
import { GiNotebook } from "react-icons/gi";
import { FaLink } from "react-icons/fa6";
import { useUser } from "../context/parentDataContext";
import { useStudentsData } from "../context/studentsDataContext";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { toaster } from "@/components/ui/toaster";
import { SUPPORTED_LANGUAGES } from "@/services/autoTranslation";

import SettingsNav from "../components/settings/settingsNav";
import MyIgrade from "../components/settings/myIgrade";
import Security from "../components/settings/security";
import Notification from "../components/settings/notification";
import Support from "../components/settings/support";
import { ParentSubscriptionView } from "../components/settings/ParentSubscriptionView";
import ParentLanguageSettings from "../components/settings/parentLanguageSettings";
import Children from "../components/settings/children";
import { ParentQuizReportView } from "../components/settings/ParentQuizReportView";
import { ReferAFriendView } from "../components/settings/ReferAFriendView";
import LogoutPopover from "../components/logoutPopover";

const PARENT_NOTIF_STORAGE_KEY = "igrades_parent_notification_prefs";

type Props = {
  setShowLogoutModal?: Dispatch<SetStateAction<boolean>>;
};

const SettingsPage: React.FC<Props> = ({ setShowLogoutModal }) => {
  const { parent, getParentData } = useUser();
  const { studentsData } = useStudentsData();
  const { parentSettingsTab, setParentSettingsTab } = useNavigationStore();
  const { i18n } = useTranslation();

  const [internalLogoutOpen, setInternalLogoutOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const currentParent = parent?.[0] || null;

  // Master notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(PARENT_NOTIF_STORAGE_KEY);
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
    window.addEventListener("parentNotificationsToggled", handleSync);
    return () => window.removeEventListener("parentNotificationsToggled", handleSync);
  }, []);

  const handleToggleAllNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    const updated = {
      appAlerts: checked,
      quizAlerts: checked,
      weeklyDigest: checked,
      securityAlerts: checked,
    };
    try {
      localStorage.setItem(PARENT_NOTIF_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("parentNotificationsToggled", { detail: { enabled: checked } })
      );
    } catch (e) {
      console.error(e);
    }
    toaster.create({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked
        ? "All parent portal alerts and student monitoring digests are active."
        : "All parent notifications have been muted.",
      type: "info",
      duration: 2500,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentParent?.id) return;

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentParent.id}_${Date.now()}.${fileExt}`;
      const filePath = `parents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("parents")
        .update({ profile_image: publicUrl })
        .eq("id", currentParent.id);

      if (updateError) throw updateError;

      if (getParentData) {
        await getParentData();
      }

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

  const parentFullName =
    `${currentParent?.firstname || ""} ${currentParent?.lastname || ""}`.trim() || "Parent Profile";

  const currentTab = parentSettingsTab || "menu";

  const handleLogoutClick = () => {
    if (setShowLogoutModal) {
      setShowLogoutModal(true);
    } else {
      setInternalLogoutOpen(true);
    }
  };

  const activeLangCode = localStorage.getItem("appLanguage") || i18n.language || "en";
  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === activeLangCode) || SUPPORTED_LANGUAGES[0];

  // If viewing a specific subpage, render edge-to-edge 100% width with back header
  if (currentTab !== "menu") {
    let subpageTitle = "Settings";
    let subpageContent = <MyIgrade />;

    if (currentTab === "language") {
      subpageTitle = "Language Preferences";
      subpageContent = <ParentLanguageSettings />;
    } else if (currentTab === "security") {
      subpageTitle = "Security & Password";
      subpageContent = <Security />;
    } else if (currentTab === "notification") {
      subpageTitle = "Notification Preferences";
      subpageContent = <Notification />;
    } else if (currentTab === "subscription") {
      subpageTitle = "Family Subscription & Plans";
      subpageContent = <ParentSubscriptionView />;
    } else if (currentTab === "support" || currentTab === "help" || currentTab === "faqs") {
      subpageTitle = "Help & FAQs";
      subpageContent = <Support />;
    } else if (currentTab === "children") {
      subpageTitle = "Connected Children";
      subpageContent = <Children />;
    } else if (currentTab === "reports" || currentTab === "quiz-report") {
      subpageTitle = "Academic & Quiz Reports";
      subpageContent = <ParentQuizReportView />;
    } else if (currentTab === "refer") {
      subpageTitle = "Refer a Friend";
      subpageContent = <ReferAFriendView />;
    } else {
      subpageTitle = "Parent Profile";
      subpageContent = <MyIgrade />;
    }

    return (
      <Box w="100%" m={0} p={0} pt={3} pb={16}>
        {/* Mobile Header with Back Button (Matches Student App) */}
        <Flex
          align="center"
          gap={3}
          mb={4}
          px={{ base: 4, sm: 6 }}
          cursor="pointer"
          onClick={() => setParentSettingsTab("menu")}
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

        {/* Desktop horizontal subpage tab bar */}
        <Box display={{ base: "none", md: "block" }} px={{ base: 4, sm: 6 }} mb={4}>
          <SettingsNav
            settingsState={currentTab}
            setSettingsState={(val) => {
              const next = typeof val === "function" ? val(currentTab) : val;
              setParentSettingsTab(next || "igrade");
            }}
          />
        </Box>

        <Box w="100%" m={0} p={0} px={{ base: 2, sm: 4, md: 6 }}>
          {subpageContent}
        </Box>
      </Box>
    );
  }

  // Main Mobile & Desktop Settings & Profile landing view: 100% full width edge-to-edge, zero border/outline/shadow
  return (
    <Box w="100%" m={0} p={0} pt={4} pb={16}>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handlePhotoUpload}
      />

      {/* ─── Profile Header Section (Rounded Square Photo, Name, Connected Children) ─── */}
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
            {currentParent?.profile_image ? (
              <Image
                src={currentParent.profile_image}
                alt={parentFullName}
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
                bg="#206CE1"
                color="white"
                align="center"
                justify="center"
                fontSize="36px"
                fontWeight="800"
                border="none"
                outline="none"
                boxShadow="none"
              >
                {currentParent?.firstname?.[0]?.toUpperCase() || "P"}
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

            {/* Pencil Icon Badge on Lower Right of Rounded Square (Matches Student App) */}
            <Flex
              position="absolute"
              bottom="-4px"
              right="-4px"
              bg="#206CE1"
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

        {/* Parent First & Last Name below Photo */}
        <Heading
          as="h1"
          fontSize={{ base: "18px", sm: "20px" }}
          fontWeight="800"
          color="#1E293B"
          mt={3}
          textAlign="center"
        >
          {parentFullName}
        </Heading>

        <Text fontSize="12px" color="#64748B" fontWeight="500" mt={0.5}>
          Parent & Guardian {currentParent?.email ? `· ${currentParent.email}` : ""}
        </Text>

        {/* Connected Children Stats Pill below Name */}
        <HStack
          gap={2}
          bg="#EFF6FF"
          border="none"
          outline="none"
          boxShadow="none"
          px={4}
          py={1.5}
          borderRadius="full"
          mt={2.5}
        >
          <Icon as={FiUsers} color="#206CE1" boxSize="16px" />
          <Text fontSize="13px" fontWeight="700" color="#1E56B3">
            {studentsData?.length || 0} Connected {studentsData?.length === 1 ? "Child" : "Children"}
          </Text>
        </HStack>
      </Flex>

      {/* ─── Settings Items List (100% width edge-to-edge matching student app) ─── */}
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
          onClick={() => setParentSettingsTab("igrade")}
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
                Parent Profile
              </Text>
              <Text fontSize="11px" color="#64748B">
                Personal details & account information
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 2. Connected Children */}
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
          onClick={() => setParentSettingsTab("children")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#ECFDF5"
              color="#059669"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FiUsers} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Connected Children
              </Text>
              <Text fontSize="11px" color="#64748B">
                {studentsData?.length || 0} registered children & class change transfers
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 3. Language */}
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
          onClick={() => setParentSettingsTab("language")}
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
                Language Preferences
              </Text>
              <Text fontSize="11px" color="#64748B">
                {activeLangObj.name} ({activeLangObj.nativeName})
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 4. Security */}
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
          onClick={() => setParentSettingsTab("security")}
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
                Security & Password
              </Text>
              <Text fontSize="11px" color="#64748B">
                Update account password & security settings
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 5. Notifications (Interactive Switch) */}
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
          <HStack
            gap={3.5}
            cursor="pointer"
            flex="1"
            onClick={() => setParentSettingsTab("notification")}
          >
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
                {notificationsEnabled ? "All alerts & weekly digests active" : "Notifications muted"}
              </Text>
            </Box>
          </HStack>

          {/* Toggle turns on/off parent notifications */}
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

        {/* 6. Subscription */}
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
          onClick={() => setParentSettingsTab("subscription")}
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
                Family Subscription & Plans
              </Text>
              <Text fontSize="11px" color="#64748B">
                Manage B2C student upgrades, entitlements & billing
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 7. Quiz & Academic Reports */}
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
          onClick={() => setParentSettingsTab("reports")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#E0F2FE"
              color="#0284C7"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={GiNotebook} boxSize="18px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Academic & Quiz Reports
              </Text>
              <Text fontSize="11px" color="#64748B">
                Weekly learning digests & assessment histories
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 8. Refer a Friend */}
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
          onClick={() => setParentSettingsTab("refer")}
          role="button"
        >
          <HStack gap={3.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="#FDF4FF"
              color="#C026D3"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FaLink} boxSize="16px" />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#1E293B">
                Refer a Friend
              </Text>
              <Text fontSize="11px" color="#64748B">
                Share iGrades with other parents & earn rewards
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 9. Help & FAQs */}
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
          onClick={() => setParentSettingsTab("support")}
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
                Parent guides, curriculum help & support desk
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#94A3B8" boxSize="18px" />
        </Flex>

        {/* 10. Log Out */}
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
          onClick={handleLogoutClick}
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
                Sign out of this parent session
              </Text>
            </Box>
          </HStack>
          <Icon as={FiChevronRight} color="#EF4444" boxSize="18px" />
        </Flex>
      </VStack>

      {/* Internal Logout Popover if triggered directly from settings page */}
      {internalLogoutOpen && (
        <LogoutPopover setShowLogoutModal={setInternalLogoutOpen} />
      )}
    </Box>
  );
};

export default SettingsPage;