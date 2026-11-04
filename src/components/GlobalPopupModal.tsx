import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Portal,
  HStack,
  Icon,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";

export interface PopupAlertDetail {
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  confirmText?: string;
  onConfirm?: () => void;
}

export const showPopupAlert = (options: PopupAlertDetail) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("igrades-popup-alert", { detail: options })
    );
  }
};

export const GlobalPopupModal: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<PopupAlertDetail | null>(null);

  useEffect(() => {
    const handleAlertEvent = (e: any) => {
      if (e.detail) {
        setCurrentAlert(e.detail);
      }
    };

    window.addEventListener("igrades-popup-alert", handleAlertEvent);

    // Safely wrap window.alert so any browser alert() becomes an interactive popup modal
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      showPopupAlert({
        title: "Notice",
        message: String(message ?? ""),
        type: "info",
      });
    };

    return () => {
      window.removeEventListener("igrades-popup-alert", handleAlertEvent);
      window.alert = originalAlert;
    };
  }, []);

  if (!currentAlert) return null;

  const type = currentAlert.type || "info";

  const config = {
    success: {
      icon: FiCheckCircle,
      color: "#10B981",
      bg: "green.50",
      btnBg: "#10B981",
      title: currentAlert.title || "Success",
    },
    error: {
      icon: FiAlertCircle,
      color: "#EF4444",
      bg: "red.50",
      btnBg: "#EF4444",
      title: currentAlert.title || "Something Went Wrong",
    },
    warning: {
      icon: FiAlertTriangle,
      color: "#F59E0B",
      bg: "yellow.50",
      btnBg: "#F59E0B",
      title: currentAlert.title || "Attention",
    },
    info: {
      icon: FiInfo,
      color: "#206CE1",
      bg: "blue.50",
      btnBg: "#206CE1",
      title: currentAlert.title || "Information",
    },
  }[type];

  const handleClose = () => {
    if (currentAlert.onConfirm) {
      currentAlert.onConfirm();
    }
    setCurrentAlert(null);
  };

  const IconComp = config.icon;

  return (
    <Portal>
      {/* Dim Backdrop */}
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.600"
        backdropFilter="blur(6px)"
        zIndex={3000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        onClick={handleClose}
      >
        {/* Modal Container */}
        <Box
          bg="white"
          w="full"
          maxW="420px"
          borderRadius="2xl"
          p={{ base: 5, sm: 6 }}
          boxShadow="0 20px 50px rgba(0, 0, 0, 0.22)"
          border="1px solid"
          borderColor="gray.100"
          onClick={(e) => e.stopPropagation()}
          textAlign="center"
          position="relative"
        >
          {/* Top Close Button */}
          <Box position="absolute" top={3.5} right={3.5}>
            <Button
              variant="ghost"
              size="xs"
              borderRadius="full"
              p={1}
              color="gray.400"
              _hover={{ bg: "gray.100", color: "gray.700" }}
              onClick={handleClose}
            >
              <FiX size={18} />
            </Button>
          </Box>

          {/* Central Type Icon Badge */}
          <Box
            boxSize="58px"
            borderRadius="full"
            bg={config.bg}
            color={config.color}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={4}
          >
            <IconComp size={30} />
          </Box>

          {/* Title */}
          <Heading
            size="md"
            color="gray.900"
            fontWeight="800"
            lineHeight="1.2"
            mb={2}
          >
            {config.title}
          </Heading>

          {/* Message */}
          <Text
            fontSize="14px"
            color="gray.600"
            lineHeight="1.5"
            mb={5}
            px={2}
          >
            {currentAlert.message}
          </Text>

          {/* Confirmation Button */}
          <Button
            w="full"
            h="44px"
            bg={config.btnBg}
            color="white"
            borderRadius="xl"
            fontWeight="700"
            fontSize="14px"
            _hover={{ opacity: 0.9 }}
            onClick={handleClose}
          >
            {currentAlert.confirmText || "Okay, got it"}
          </Button>
        </Box>
      </Box>
    </Portal>
  );
};
