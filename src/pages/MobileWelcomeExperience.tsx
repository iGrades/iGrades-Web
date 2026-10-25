import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import point1Illustration from "@/assets/point 1_illustration.png";
import point2Illustration from "@/assets/point 2_illustration.png";
import igradeIcon from "@/assets/igrade_icon-removebg-preview.png";
import { supabase } from "@/lib/supabaseClient";

export const MobileWelcomeExperience: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const student = localStorage.getItem("authdStudent");
        if (student) {
          navigate("/student-dashboard", { replace: true });
          return;
        }

        const parent = localStorage.getItem("authdParent");
        if (parent) {
          navigate("/parent-dashboard", { replace: true });
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const role = session.user.user_metadata?.role;
          if (role === "student" || role === "children") {
            navigate("/student-dashboard", { replace: true });
          } else if (role === "parent") {
            navigate("/parent-dashboard", { replace: true });
          }
        }
      } catch {
        // Continue on welcome screen if session check fails
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setStep(3);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (step < 3) handleNext();
      } else if (e.key === "ArrowLeft") {
        if (step > 1) setStep((prev) => prev - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 40) {
      if (diff > 0 && step < 3) {
        handleNext();
      } else if (diff < 0 && step > 1) {
        setStep((prev) => prev - 1);
      }
    }
    setTouchStartX(null);
  };

  return (
    <Box
      minH={{ base: "100dvh", md: "100vh" }}
      w="100%"
      bg={{ base: "#FFFFFF", md: "#F8FAFC" }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      px={{ base: 0, md: 4 }}
      py={{ base: 0, md: 6 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      userSelect="none"
    >
      {/* Mobile container matching native phone layout */}
      <Box
        w="100%"
        maxW={{ base: "100%", sm: "420px" }}
        minH={{ base: "100dvh", md: "100vh" }}
        h={{ base: "100dvh", md: "auto" }}
        bg="#FFFFFF"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        px={{ base: 6, sm: 8 }}
        pt={{ base: "max(calc(env(safe-area-inset-top, 20px) + 12px), 20px)", sm: "32px" }}
        pb={{ base: "max(calc(env(safe-area-inset-bottom, 20px) + 16px), 24px)", sm: "32px" }}
        boxShadow={{
          base: "none",
          md: "0 20px 45px rgba(0, 102, 255, 0.08), 0 4px 14px rgba(15, 23, 42, 0.04)",
        }}
        borderRadius={{ base: "none", md: "3xl" }}
        overflow="hidden"
      >
        {/* ─────────────────────────────────────────────────────────── */}
        {/* SCREEN 1: Learn Smarter, Not Harder                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <Flex direction="column" justify="space-between" flex={1} w="100%">
            {/* Center Content Group (Illustration + Typography) */}
            <Flex
              direction="column"
              align="flex-start"
              justify="center"
              flex={1}
              w="100%"
              my="auto"
              py={2}
            >
              {/* Illustration centered */}
              <Box
                w="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={{ base: 4, sm: 6 }}
              >
                <img
                  src={point1Illustration}
                  alt="Learn Smarter, Not Harder"
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "contain",
                    userSelect: "none",
                    display: "block",
                  }}
                />
              </Box>

              {/* Typography Section */}
              <Box w="100%">
                <Heading
                  as="h1"
                  fontSize={{ base: "26px", sm: "30px" }}
                  fontWeight="800"
                  color="#0D1D3A"
                  lineHeight="1.2"
                  letterSpacing="-0.02em"
                  textAlign="left"
                >
                  Learn Smarter,
                  <br />
                  Not Harder
                </Heading>
                <Text
                  fontSize={{ base: "14.5px", sm: "16px" }}
                  color="#546887"
                  lineHeight="1.55"
                  textAlign="left"
                  mt={3}
                  maxW="330px"
                >
                  Access engaging lessons, concise notes, and resources that make complex
                  topics simple and easy to understand.
                </Text>
              </Box>
            </Flex>

            {/* Bottom Group: Pagination Dots + Navigation */}
            <Box w="100%" pt={2}>
              {/* Pagination Dots (3 Dots, centered, 1st active) */}
              <HStack gap={2} justify="center" mb={{ base: 4, sm: 6 }}>
                <Box w="7px" h="7px" borderRadius="full" bg="#0066FF" />
                <Box w="7px" h="7px" borderRadius="full" bg="#CBE0FF" />
                <Box w="7px" h="7px" borderRadius="full" bg="#CBE0FF" />
              </HStack>

              {/* Bottom Row Navigation */}
              <Flex justify="space-between" align="center" w="100%">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  color="#0066FF"
                  fontSize="16px"
                  fontWeight="700"
                  p={0}
                  h="auto"
                  minW="auto"
                  _hover={{ bg: "transparent", opacity: 0.8 }}
                  _active={{ opacity: 0.6 }}
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  aria-label="Next screen"
                  w="54px"
                  h="54px"
                  borderRadius="full"
                  bg="#0066FF"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 14px rgba(0, 102, 255, 0.35)"
                  _hover={{ bg: "#0055D6" }}
                  _active={{ transform: "scale(0.95)" }}
                  p={0}
                >
                  <Icon as={FiArrowRight} boxSize={5} strokeWidth={2.5} />
                </Button>
              </Flex>
            </Box>
          </Flex>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* SCREEN 2: Practice & Improve                                */}
        {/* ─────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <Flex direction="column" justify="space-between" flex={1} w="100%">
            {/* Center Content Group (Illustration + Typography) */}
            <Flex
              direction="column"
              align="flex-start"
              justify="center"
              flex={1}
              w="100%"
              my="auto"
              py={2}
            >
              {/* Illustration centered */}
              <Box
                w="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={{ base: 4, sm: 6 }}
              >
                <img
                  src={point2Illustration}
                  alt="Practice & Improve"
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "contain",
                    userSelect: "none",
                    display: "block",
                  }}
                />
              </Box>

              {/* Typography Section */}
              <Box w="100%">
                <Heading
                  as="h1"
                  fontSize={{ base: "26px", sm: "30px" }}
                  fontWeight="800"
                  color="#0D1D3A"
                  lineHeight="1.2"
                  letterSpacing="-0.02em"
                  textAlign="left"
                >
                  Practice &amp;
                  <br />
                  Improve
                </Heading>
                <Text
                  fontSize={{ base: "14.5px", sm: "16px" }}
                  color="#546887"
                  lineHeight="1.55"
                  textAlign="left"
                  mt={3}
                  maxW="330px"
                >
                  Take quizzes, past questions, and exam simulations to build confidence
                  and track your progress.
                </Text>
              </Box>
            </Flex>

            {/* Bottom Group: Pagination Dots + Navigation */}
            <Box w="100%" pt={2}>
              {/* Pagination Dots (3 Dots, centered, 2nd active) */}
              <HStack gap={2} justify="center" mb={{ base: 4, sm: 6 }}>
                <Box w="7px" h="7px" borderRadius="full" bg="#CBE0FF" />
                <Box w="7px" h="7px" borderRadius="full" bg="#0066FF" />
                <Box w="7px" h="7px" borderRadius="full" bg="#CBE0FF" />
              </HStack>

              {/* Bottom Row Navigation */}
              <Flex justify="space-between" align="center" w="100%">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  color="#0066FF"
                  fontSize="16px"
                  fontWeight="700"
                  p={0}
                  h="auto"
                  minW="auto"
                  _hover={{ bg: "transparent", opacity: 0.8 }}
                  _active={{ opacity: 0.6 }}
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  aria-label="Next screen"
                  w="54px"
                  h="54px"
                  borderRadius="full"
                  bg="#0066FF"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 14px rgba(0, 102, 255, 0.35)"
                  _hover={{ bg: "#0055D6" }}
                  _active={{ transform: "scale(0.95)" }}
                  p={0}
                >
                  <Icon as={FiArrowRight} boxSize={5} strokeWidth={2.5} />
                </Button>
              </Flex>
            </Box>
          </Flex>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* SCREEN 3: AUTH WELCOME SCREEN                               */}
        {/* ─────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            flex={1}
            w="100%"
            position="relative"
            zIndex={2}
            my="auto"
            py={4}
          >
            {/* 3D Blue Monogram Logo */}
            <Box
              w={{ base: "125px", sm: "145px" }}
              h={{ base: "125px", sm: "145px" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={{ base: 4, sm: 6 }}
            >
              <img
                src={igradeIcon}
                alt="iGrades"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                }}
              />
            </Box>

            {/* Headline */}
            <Heading
              as="h1"
              fontSize={{ base: "22px", sm: "26px" }}
              fontWeight="800"
              color="#0D1D3A"
              lineHeight="1.3"
              letterSpacing="-0.02em"
              textAlign="center"
              maxW="310px"
              mb={{ base: 7, sm: 9 }}
            >
              Get better grades in your academic endeavours
            </Heading>

            {/* Auth Action Buttons */}
            <VStack gap={3.5} w="100%" maxW="340px">
              {/* Login Button (Outline style) */}
              <Button
                w="100%"
                h="54px"
                bg="transparent"
                color="#0066FF"
                border="1.5px solid #0066FF"
                borderRadius="2xl"
                fontSize="16px"
                fontWeight="700"
                onClick={() => navigate("/login")}
                _hover={{ bg: "rgba(0, 102, 255, 0.04)" }}
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.15s ease"
              >
                Login
              </Button>

              {/* Get Started Button (Solid style) */}
              <Button
                w="100%"
                h="54px"
                bg="#0066FF"
                color="white"
                border="none"
                borderRadius="2xl"
                fontSize="16px"
                fontWeight="700"
                onClick={() => navigate("/signup")}
                _hover={{ bg: "#0055D6" }}
                _active={{ transform: "scale(0.98)" }}
                boxShadow="0 4px 14px rgba(0, 102, 255, 0.3)"
                transition="all 0.15s ease"
              >
                Get Started
              </Button>
            </VStack>
          </Flex>
        )}

        {/* Decorative Ambient Gradient Wave matching fial-auth_down.png (shows on Step 3) */}
        {step === 3 && (
          <Box
            position="absolute"
            bottom={-12}
            left={0}
            right={0}
            h={{ base: "135px", sm: "155px" }}
            pointerEvents="none"
            overflow="hidden"
            zIndex={1}
          >
            <svg
              viewBox="0 0 375 160"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <defs>
                {/* Left soft wave gradient */}
                <linearGradient id="leftSoftWave" x1="0%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#E6F0FF" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#CDE1FF" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ADCFFF" stopOpacity="0.9" />
                </linearGradient>

                {/* Middle background crest gradient */}
                <linearGradient id="midPastelWave" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#EBF3FF" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#CFE2FF" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#B3D3FF" stopOpacity="0.8" />
                </linearGradient>

                {/* Right primary focal wave gradient */}
                <linearGradient id="rightVibrantWave" x1="10%" y1="10%" x2="85%" y2="90%">
                  <stop offset="0%" stopColor="#75ADFF" />
                  <stop offset="42%" stopColor="#4D92FA" />
                  <stop offset="78%" stopColor="#317AF0" />
                  <stop offset="100%" stopColor="#2068E6" />
                </linearGradient>

                {/* Inner subtle sheer fold gradient */}
                <linearGradient id="rightWaveInnerSheer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.0" />
                  <stop offset="60%" stopColor="#1E40AF" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Layer 1: Middle background gentle crest */}
              <path
                d="M110,160 C140,120 185,100 235,115 C275,128 320,145 355,160 L110,160 Z"
                fill="url(#midPastelWave)"
              />

              {/* Layer 2: Left soft light-blue wave */}
              <path
                d="M0,86 C55,96 108,124 162,160 L0,160 Z"
                fill="url(#leftSoftWave)"
              />

              {/* Layer 3: Right prominent foreground wave */}
              <path
                d="M176,160 C228,118 290,62 375,38 L375,160 Z"
                fill="url(#rightVibrantWave)"
              />

              {/* Layer 4: Organic inner sheer shadow layer on the right wave */}
              <path
                d="M265,115 C302,90 342,72 375,66 L375,160 L248,160 C254,142 260,128 265,115 Z"
                fill="url(#rightWaveInnerSheer)"
              />
            </svg>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MobileWelcomeExperience;
