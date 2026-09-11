import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  VStack,
  Button,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { FiX, FiAward, FiZap } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { usePointsCelebrationStore } from "./pointsCelebrationStore";
import { sprayPointsConfetti, playCelebrationSound } from "./confettiHelper";

export const PointsCelebrationModal: React.FC = () => {
  const { isOpen, data, closeCelebration } = usePointsCelebrationStore();
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const totalDuration = 8000; // 8 seconds auto-dismiss
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(totalDuration);

  useEffect(() => {
    if (!isOpen || !data) {
      setProgress(100);
      return;
    }

    remainingTimeRef.current = totalDuration;
    startTimeRef.current = Date.now();
    setProgress(100);

    const interval = 50;
    const intervalId = window.setInterval(() => {
      if (isHovered) return;

      remainingTimeRef.current -= interval;
      const pct = Math.max(0, (remainingTimeRef.current / totalDuration) * 100);
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        window.clearInterval(intervalId);
        closeCelebration();
      }
    }, interval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen, data, isHovered, closeCelebration]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCelebration();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCelebration]);

  if (!isOpen || !data) return null;

  const points = data.points || 0;
  const title = data.title || "Points Gained!";
  const description =
    data.description ||
    "Great work! You have earned points for your active learning and consistency.";

  const handleSprayAgain = () => {
    sprayPointsConfetti();
    playCelebrationSound();
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={99990}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, sm: 6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark Blurred Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(15, 23, 42, 0.55)"
        backdropFilter="blur(6px)"
        transition="opacity 0.25s ease"
        onClick={closeCelebration}
      />

      {/* Main Celebration Card */}
      <Box
        position="relative"
        zIndex={99995}
        w="100%"
        maxW="480px"
        bg="white"
        borderRadius="3xl"
        boxShadow="0 25px 60px -15px rgba(32, 108, 225, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)"
        overflow="hidden"
        textAlign="center"
        px={{ base: 6, sm: 8 }}
        pt={8}
        pb={7}
        animation="pointsModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      >
        {/* Decorative Top Accent Glow */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="6px"
          bg="linear-gradient(90deg, #206CE1 0%, #F59E0B 50%, #10B981 100%)"
        />

        {/* Top Close Button */}
        <IconButton
          aria-label="Close celebration popup"
          size="sm"
          variant="ghost"
          position="absolute"
          top={3}
          right={3}
          borderRadius="full"
          color="gray.400"
          _hover={{ bg: "gray.100", color: "gray.700" }}
          onClick={closeCelebration}
        >
          <FiX size={18} />
        </IconButton>

        {/* Glowing 3D-Style Coin Badge */}
        <Flex justify="center" align="center" mb={4} position="relative">
          {/* Radial Aura */}
          <Box
            position="absolute"
            w="110px"
            h="110px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0) 70%)"
            animation="pointsPulse 2s infinite ease-in-out"
          />

          {/* Golden Coin Token */}
          <Box
            w="76px"
            h="76px"
            borderRadius="full"
            bg="linear-gradient(135deg, #FDE68A 0%, #F59E0B 55%, #D97706 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 10px 25px -5px rgba(245, 158, 11, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.6)"
            border="3px solid #FEF3C7"
            transform="scale(1)"
            transition="transform 0.2s ease"
            _hover={{ transform: "scale(1.08) rotate(6deg)" }}
          >
            <HiSparkles size={38} color="#FFFFFF" />
          </Box>
        </Flex>

        {/* Points Gained Pill */}
        <HStack justify="center" gap={2} mb={3}>
          <Badge
            bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
            color="amber.800"
            border="1px solid"
            borderColor="amber.300"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="lg"
            fontWeight="black"
            letterSpacing="0.02em"
            boxShadow="0 4px 12px rgba(245, 158, 11, 0.15)"
            display="inline-flex"
            alignItems="center"
            gap={1.5}
          >
            <FiZap size={16} color="#D97706" />
            +{points.toLocaleString()} iGG Points!
          </Badge>
        </HStack>

        {/* Modal Title */}
        <Heading
          size="lg"
          color="gray.900"
          fontWeight="extrabold"
          letterSpacing="-0.02em"
          lineHeight="shorter"
          mb={2}
        >
          {title}
        </Heading>

        {/* Modal Description */}
        <Text
          fontSize="sm"
          color="gray.600"
          lineHeight="relaxed"
          maxW="380px"
          mx="auto"
          mb={5}
        >
          {description}
        </Text>

        {/* Extra Achievement Stats Bar (Streak & Milestone) */}
        {(data.streakDays || data.milestonePoints || data.newBalance) && (
          <HStack
            justify="center"
            wrap="wrap"
            gap={2.5}
            p={3}
            bg="gray.50"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            mb={5}
          >
            {Boolean(data.streakDays && data.streakDays > 0) && (
              <HStack
                gap={1.5}
                px={3}
                py={1}
                bg="white"
                borderRadius="full"
                border="1px solid"
                borderColor="orange.200"
                shadow="xs"
              >
                <Text fontSize="xs" fontWeight="bold" color="orange.600">
                  🔥 {data.streakDays} Day Streak!
                </Text>
              </HStack>
            )}

            {Boolean(data.milestonePoints && data.milestonePoints > 0) && (
              <HStack
                gap={1.5}
                px={3}
                py={1}
                bg="white"
                borderRadius="full"
                border="1px solid"
                borderColor="purple.200"
                shadow="xs"
              >
                <FiAward size={13} color="#7C3AED" />
                <Text fontSize="xs" fontWeight="bold" color="purple.700">
                  +{data.milestonePoints} Milestone Bonus!
                </Text>
              </HStack>
            )}

            {typeof data.newBalance === "number" && (
              <HStack
                gap={1.5}
                px={3}
                py={1}
                bg="white"
                borderRadius="full"
                border="1px solid"
                borderColor="blue.200"
                shadow="xs"
              >
                <Text fontSize="xs" fontWeight="semibold" color="blue.700">
                  Balance: {data.newBalance.toLocaleString()} Pts
                </Text>
              </HStack>
            )}
          </HStack>
        )}

        {/* Interactive Action Buttons */}
        <VStack gap={2.5} w="100%">
          <Button
            w="100%"
            h="48px"
            bg="linear-gradient(135deg, #206CE1 0%, #1555B7 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="bold"
            fontSize="sm"
            boxShadow="0 8px 20px -4px rgba(32, 108, 225, 0.4)"
            _hover={{
              bg: "linear-gradient(135deg, #1A5BBF 0%, #0F4599 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 24px -4px rgba(32, 108, 225, 0.5)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            onClick={closeCelebration}
          >
            Awesome! Collect & Continue ✨
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fontSize="xs"
            color="gray.500"
            _hover={{ color: "primaryColor", bg: "blue.50" }}
            onClick={handleSprayAgain}
          >
            🎉 Spray More Confetti
          </Button>
        </VStack>

        {/* Auto Dismiss Countdown Progress Line */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="3px"
          bg="gray.100"
        >
          <Box
            h="100%"
            w={`${progress}%`}
            bg="linear-gradient(90deg, #206CE1, #F59E0B)"
            transition="width 0.05s linear"
          />
        </Box>
      </Box>

      {/* Global CSS for Smooth Keyframes */}
      <style>{`
        @keyframes pointsModalIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          60% {
            opacity: 1;
            transform: scale(1.03) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pointsPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.18);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default PointsCelebrationModal;
