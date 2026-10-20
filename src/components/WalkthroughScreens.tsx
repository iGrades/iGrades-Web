import React, { useState, useEffect, useCallback } from "react";
import { Box, Flex, Heading, Text, Button, IconButton } from "@chakra-ui/react";
import { FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import point1Illustration from "@/assets/point 1_illustration.png";
import point2Illustration from "@/assets/point 2_illustration.png";

interface WalkthroughScreensProps {
  onFinish: () => void;
}

export const WalkthroughScreens: React.FC<WalkthroughScreensProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [isExiting, setIsExiting] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      try {
        localStorage.setItem("igrades_onboarding_completed", "true");
      } catch {
        // ignore
      }
      onFinish();
    }, 350);
  }, [onFinish]);

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentStep === 0) setCurrentStep(1);
      } else if (e.key === "ArrowLeft") {
        if (currentStep === 1) setCurrentStep(0);
      } else if (e.key === "Enter") {
        handleNext();
      } else if (e.key === "Escape") {
        handleComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, handleComplete]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50 && currentStep === 0) {
      // Swiped left -> next
      setCurrentStep(1);
    } else if (diff < -50 && currentStep === 1) {
      // Swiped right -> back
      setCurrentStep(0);
    }
    setTouchStartX(null);
  };

  const slides = [
    {
      illustration: point1Illustration,
      alt: "Interactive Video Learning with iGrades",
      tag: "LEARN ANYWHERE, ANYTIME",
      title: "Personalized Video Lessons",
      description:
        "Master tough concepts through engaging, bite-sized video lessons tailored to your syllabus. Pause, rewind, and learn at your comfortable pace.",
    },
    {
      illustration: point2Illustration,
      alt: "Practice Quizzes and Exam Preparation",
      tag: "CONFIDENCE & HIGH SCORES",
      title: "Practice & Ace Every Exam",
      description:
        "Prepare for WAEC, JAMB, NECO, and classroom exams with past questions, instant step-by-step solutions, and smart AI learning support.",
    },
  ];

  const currentSlide = slides[currentStep];

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={999998}
      bg="linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      opacity={isExiting ? 0 : 1}
      transform={isExiting ? "scale(0.98)" : "scale(1)"}
      transition="opacity 0.35s ease, transform 0.35s ease"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      userSelect="none"
      overflowY="auto"
      px={{ base: 4, sm: 6, md: 8 }}
      py={{ base: 5, sm: 6, md: 8 }}
    >
      {/* ── Top Bar: Skip Button ── */}
      <Flex justify="flex-end" align="center" w="full" maxW="640px" mx="auto">
        <Button
          variant="ghost"
          size="sm"
          color="#64748B"
          fontWeight="600"
          fontSize={{ base: "13px", sm: "14px" }}
          px={3}
          py={1.5}
          borderRadius="full"
          _hover={{ bg: "rgba(32, 108, 225, 0.08)", color: "#1E293B" }}
          onClick={handleComplete}
        >
          Skip
        </Button>
      </Flex>

      {/* ── Center Content: Illustration + Copy ── */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        w="full"
        maxW="560px"
        mx="auto"
        flex={1}
        my="auto"
        py={{ base: 2, sm: 4 }}
      >
        {/* Animated Illustration Container */}
        <Box
          key={currentStep}
          w={{ base: "260px", sm: "320px", md: "380px" }}
          h={{ base: "220px", sm: "270px", md: "320px" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          animation="fadeInSlide 0.4s ease-out forwards"
        >
          <img
            src={currentSlide.illustration}
            alt={currentSlide.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 24px rgba(32, 108, 225, 0.12))",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* Text Area */}
        <Box
          key={`text-${currentStep}`}
          textAlign="center"
          mt={{ base: 4, sm: 6 }}
          px={{ base: 2, sm: 4 }}
          animation="fadeInUp 0.4s ease-out forwards"
        >
          {/* Tag Pill */}
          <Box
            display="inline-block"
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(32, 108, 225, 0.1)"
            color="#206CE1"
            fontSize={{ base: "10px", sm: "11px" }}
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            mb={{ base: 2, sm: 2.5 }}
          >
            {currentSlide.tag}
          </Box>

          {/* Main Title */}
          <Heading
            as="h1"
            fontSize={{ base: "22px", sm: "26px", md: "30px" }}
            fontWeight="800"
            color="#0F172A"
            letterSpacing="-0.02em"
            lineHeight={{ base: 1.25, sm: 1.2 }}
            mb={{ base: 2, sm: 3 }}
          >
            {currentSlide.title}
          </Heading>

          {/* Subtitle Description */}
          <Text
            fontSize={{ base: "13.5px", sm: "15px" }}
            color="#64748B"
            lineHeight={{ base: 1.5, sm: 1.55 }}
            maxW="460px"
            mx="auto"
          >
            {currentSlide.description}
          </Text>
        </Box>
      </Flex>

      {/* ── Bottom Navigation Bar: Dots & Action Buttons ── */}
      <Flex
        direction="column"
        align="center"
        w="full"
        maxW="560px"
        mx="auto"
        gap={{ base: 4, sm: 5 }}
        pt={2}
      >
        {/* Pagination Dots */}
        <Flex align="center" justify="center" gap={2}>
          <Box
            w={currentStep === 0 ? "28px" : "8px"}
            h="8px"
            borderRadius="full"
            bg={currentStep === 0 ? "#206CE1" : "#CBD5E1"}
            transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            cursor="pointer"
            onClick={() => setCurrentStep(0)}
          />
          <Box
            w={currentStep === 1 ? "28px" : "8px"}
            h="8px"
            borderRadius="full"
            bg={currentStep === 1 ? "#206CE1" : "#CBD5E1"}
            transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            cursor="pointer"
            onClick={() => setCurrentStep(1)}
          />
        </Flex>

        {/* Buttons Row */}
        <Flex
          align="center"
          justify="space-between"
          w="full"
          gap={3}
          px={{ base: 1, sm: 2 }}
        >
          {/* Back button (only shown on step 2) */}
          <Box w="50px">
            {currentStep === 1 ? (
              <IconButton
                aria-label="Previous screen"
                variant="outline"
                size="md"
                borderRadius="full"
                borderColor="#CBD5E1"
                color="#475569"
                bg="white"
                _hover={{ bg: "#F1F5F9", borderColor: "#94A3B8" }}
                onClick={handleBack}
              >
                <FiArrowLeft size={18} />
              </IconButton>
            ) : null}
          </Box>

          {/* Primary Action Button */}
          {currentStep === 0 ? (
            <Button
              flex={1}
              maxW="320px"
              h={{ base: "48px", sm: "52px" }}
              bg="#206CE1"
              color="white"
              fontWeight="700"
              fontSize={{ base: "14.5px", sm: "15.5px" }}
              borderRadius="full"
              boxShadow="0 6px 18px rgba(32, 108, 225, 0.28)"
              _hover={{
                bg: "#1858BA",
                boxShadow: "0 8px 22px rgba(32, 108, 225, 0.36)",
                transform: "translateY(-1px)",
              }}
              _active={{ transform: "scale(0.98)" }}
              onClick={handleNext}
            >
              Next
              <Box as="span" ml={2} display="inline-flex" alignItems="center">
                <FiArrowRight size={18} />
              </Box>
            </Button>
          ) : (
            <Button
              flex={1}
              maxW="320px"
              h={{ base: "48px", sm: "52px" }}
              bg="linear-gradient(135deg, #206CE1 0%, #1754B5 100%)"
              color="white"
              fontWeight="700"
              fontSize={{ base: "14.5px", sm: "15.5px" }}
              borderRadius="full"
              boxShadow="0 8px 24px rgba(32, 108, 225, 0.32)"
              _hover={{
                bg: "linear-gradient(135deg, #1858BA 0%, #124391 100%)",
                boxShadow: "0 10px 28px rgba(32, 108, 225, 0.42)",
                transform: "translateY(-1px)",
              }}
              _active={{ transform: "scale(0.98)" }}
              onClick={handleComplete}
            >
              Get Started
              <Box as="span" ml={2} display="inline-flex" alignItems="center">
                <FiCheck size={18} />
              </Box>
            </Button>
          )}

          {/* Spacer to balance back button */}
          <Box w="50px" />
        </Flex>
      </Flex>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default WalkthroughScreens;
