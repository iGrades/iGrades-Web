import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Badge,
  HStack,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LuLock, LuCheck, LuSparkles, LuGraduationCap, LuCalendar, LuVideo, LuClock } from "react-icons/lu";
import { PiShootingStarDuotone } from "react-icons/pi";

export const LearningWithTutorView: React.FC = () => {
  const {
    effectivePlan,
    isPremium,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  const [hasReservedSlot, setHasReservedSlot] = useState<boolean>(() => {
    try {
      return localStorage.getItem("igrades_tutor_priority_reserved") === "true";
    } catch {
      return false;
    }
  });

  const handleReservePriority = () => {
    try {
      localStorage.setItem("igrades_tutor_priority_reserved", "true");
      setHasReservedSlot(true);
      toaster.create({
        title: "Priority Tutor Slot Reserved!",
        description:
          "Your VIP Early Access status is confirmed. We will notify you first when private tutor matching goes live.",
        type: "success",
        duration: 5000,
      });
    } catch {
      // ignore
    }
  };

  const handleUpgradeClick = () => {
    promptUpgrade(
      "Learning with a Tutor",
      "premium",
      "Get guided support with an iGrades Tutor. Premium feature — iGrades Tutors are coming soon."
    );
  };

  const upcomingFeatures = [
    {
      icon: LuGraduationCap,
      title: "Vetted Certified Nigerian Teachers",
      description:
        "Top-rated educators specializing in WAEC SSCE, JAMB UTME, NECO, and BECE examination syllabus mastery.",
    },
    {
      icon: LuVideo,
      title: "Interactive Live 1-on-1 Sessions",
      description:
        "High-definition video classrooms with live mathematical equation canvas, problem breakdowns, and screen sharing.",
    },
    {
      icon: LuCalendar,
      title: "Flexible Scheduling",
      description:
        "Book after-school tutoring, weekend revision sessions, or intensive pre-exam crash cohorts at your convenience.",
    },
    {
      icon: LuClock,
      title: "Targeted Past Question Mastery",
      description:
        "Work directly through difficult past questions and mark scheme requirements with experienced exam coaches.",
    },
  ];

  return (
    <Box maxW="5xl" mx="auto" w="full" px={{ base: 2, md: 4 }} py={4}>
      {/* ── TOP HERO BANNER ── */}
      <Box
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="3xl"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0 4px 20px rgba(0,0,0,0.04)"
        position="relative"
        overflow="hidden"
        mb={8}
      >
        {/* Accent top gradient stripe */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="5px"
          bgGradient={
            isPremium
              ? "linear(to-r, #7928CA, #206CE1, #00D084)"
              : "linear(to-r, #FD8B3A, #206CE1)"
          }
        />

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={6}
        >
          <Box maxW="2xl">
            <HStack gap={2.5} mb={2.5} flexWrap="wrap">
              {isPremium ? (
                <Badge
                  colorPalette="purple"
                  variant="solid"
                  size="sm"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <Icon as={LuSparkles} mr={1} />
                  Premium Unlocked · VIP Early Access
                </Badge>
              ) : (
                <Badge
                  colorPalette="orange"
                  variant="subtle"
                  size="sm"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <Icon as={LuLock} mr={1} />
                  Premium Feature · Coming Soon
                </Badge>
              )}
              <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full" px={3}>
                Secondary Curriculum Tutors
              </Badge>
            </HStack>

            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              color="gray.900"
              fontWeight="800"
              mb={2}
            >
              Learning with an iGrades Tutor
            </Heading>

            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              {isPremium
                ? "As a valued Premium student, you have VIP priority access to 1-on-1 certified Nigerian secondary school tutors. Connect directly with expert teachers for personalized exam guidance and live problem-solving."
                : "Get guided support with an iGrades Tutor. Learning with a Tutor is a Premium-only feature — iGrades Tutors are coming soon."}
            </Text>
          </Box>

          <Box flexShrink={0} w={{ base: "full", md: "auto" }}>
            {isPremium ? (
              <Button
                bg={hasReservedSlot ? "green.600" : "#206CE1"}
                color="white"
                size="md"
                borderRadius="xl"
                px={6}
                fontWeight="bold"
                onClick={handleReservePriority}
                disabled={hasReservedSlot}
                w={{ base: "full", md: "auto" }}
                _hover={{ bg: hasReservedSlot ? "green.700" : "#1852B2" }}
                boxShadow="0 4px 14px rgba(32,108,225,0.25)"
              >
                <Icon as={hasReservedSlot ? LuCheck : LuSparkles} mr={2} />
                {hasReservedSlot ? "Priority Slot Reserved" : "Reserve Priority Match"}
              </Button>
            ) : (
              <Button
                bg="#206CE1"
                color="white"
                size="md"
                borderRadius="xl"
                px={6}
                fontWeight="bold"
                onClick={handleUpgradeClick}
                w={{ base: "full", md: "auto" }}
                _hover={{ bg: "#1852B2", transform: "translateY(-1px)" }}
                boxShadow="0 4px 14px rgba(32,108,225,0.25)"
              >
                <Icon as={PiShootingStarDuotone} mr={2} fontSize="1.1rem" />
                Upgrade to Premium (₦25,000)
              </Button>
            )}
          </Box>
        </Flex>

        {/* Status Callout Box */}
        <Box
          mt={6}
          p={4}
          borderRadius="2xl"
          bg={isPremium ? "purple.50/50" : "orange.50/40"}
          border="1px solid"
          borderColor={isPremium ? "purple.200" : "orange.200"}
        >
          <HStack align="flex-start" gap={3}>
            <Box
              p={2}
              borderRadius="xl"
              bg={isPremium ? "purple.100" : "orange.100"}
              color={isPremium ? "purple.700" : "orange.700"}
              mt={0.5}
            >
              <Icon as={isPremium ? LuSparkles : LuLock} boxSize={4} />
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="xs" color="gray.900" mb={0.5}>
                {isPremium ? "VIP Priority Reservation Active" : "Premium Tier Entitlement"}
              </Text>
              <Text fontSize="xs" color="gray.600" lineHeight="relaxed">
                {isPremium
                  ? "When tutor booking opens, Premium students are matched first with subject-matter specialists in Physics, Chemistry, Mathematics, English, Biology, and Economics."
                  : "Learning with a Tutor will be unlocked exclusively for Premium subscribers. Core lessons, PDFs, curriculum subjects, and basic quizzes remain 100% free on Basic."}
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* ── ROADMAP & COMING SOON CARDS ── */}
      <Box mb={6}>
        <Heading as="h3" size="sm" color="gray.800" fontWeight="bold" mb={4}>
          What to Expect from iGrades Tutors
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {upcomingFeatures.map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <Box
                key={idx}
                p={5}
                borderRadius="2xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="0 2px 8px rgba(0,0,0,0.02)"
                _hover={{
                  borderColor: "blue.300",
                  boxShadow: "0 6px 16px rgba(32,108,225,0.06)",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
              >
                <HStack gap={3.5} align="flex-start">
                  <Box
                    p={3}
                    borderRadius="xl"
                    bg="blue.50"
                    color="#206CE1"
                    flexShrink={0}
                  >
                    <Icon as={FeatIcon} boxSize={5} />
                  </Box>
                  <Box>
                    <Text fontWeight="700" fontSize="sm" color="gray.900" mb={1}>
                      {feat.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" lineHeight="relaxed">
                      {feat.description}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* ── UPGRADE PROMPT MODAL ── */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default LearningWithTutorView;
