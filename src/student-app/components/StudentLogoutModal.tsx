import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useBackButton } from "@/hooks/useBackButton";

interface StudentLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentLogoutModal: React.FC<StudentLogoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { logoutFunc } = useAuthdStudentData();

  // Pressing phone back button closes the logout modal
  useBackButton("student-logout-modal", 120, () => {
    if (isOpen) {
      onClose();
      return true;
    }
    return false;
  }, isOpen);

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    onClose();
    logoutFunc();
  };

  return (
    <Box
      position="fixed"
      inset={0}
      w="100vw"
      h={{ base: "100dvh", md: "100vh" }}
      bg="rgba(0, 0, 0, 0.65)"
      backdropFilter="blur(4px)"
      zIndex={7000}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: 4, md: 6 }}
      onClick={onClose}
    >
      <Box
        position="relative"
        width={{ base: "100%", sm: "85%", md: "420px" }}
        maxH="90vh"
        bg={{ base: "white", _dark: "#1E1E1E" }}
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 6, md: 8 }}
        textAlign="center"
        onClick={(e) => e.stopPropagation()}
      >
        <VStack gap={4} align="center">
          <Box
            p={4}
            borderRadius="full"
            bg={{ base: "red.50", _dark: "rgba(239, 68, 68, 0.15)" }}
            color="red.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiLogOut} boxSize={8} />
          </Box>

          <Heading
            as="h2"
            fontSize={{ base: "xl", md: "2xl" }}
            color={{ base: "gray.800", _dark: "gray.100" }}
            fontWeight="700"
          >
            Log Out Confirmation
          </Heading>

          <Text
            fontSize={{ base: "sm", md: "sm" }}
            color={{ base: "gray.600", _dark: "gray.400" }}
            maxW="90%"
            lineHeight="tall"
          >
            Are you sure you want to log out of your student account?
          </Text>
        </VStack>

        <VStack gap={3} mt={6} w="full">
          <Button
            bg="red.500"
            color="white"
            borderRadius="2xl"
            h="48px"
            w="full"
            fontSize="sm"
            fontWeight="700"
            _hover={{ bg: "red.600" }}
            _active={{ transform: "scale(0.98)" }}
            onClick={handleConfirmLogout}
          >
            Yes, Log Out
          </Button>

          <Button
            variant="outline"
            color={{ base: "gray.700", _dark: "gray.300" }}
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            borderRadius="2xl"
            h="48px"
            w="full"
            fontSize="sm"
            fontWeight="600"
            _hover={{ bg: { base: "gray.50", _dark: "gray.800" } }}
            _active={{ transform: "scale(0.98)" }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
