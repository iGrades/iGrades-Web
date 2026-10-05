import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Heading,
  Icon,
  Text,
  Flex,
  Button,
  Badge,
  HStack,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useFlutterwave } from "@/hooks/useFlutterwave";
import { useUser } from "@/parent-app/context/parentDataContext";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import type { SubscriptionPlan } from "@/types/flutterwave";
import {
  normalizePlan,
  PLAN_CONFIGS,
  PLAN_COMPARISON_MATRIX,
} from "@/services/subscriptionEntitlements";
import { FiUsers, FiCheckCircle } from "react-icons/fi";
import { PiShootingStarDuotone, PiStudentBold } from "react-icons/pi";
import { LuSparkles } from "react-icons/lu";

export const ParentSubscriptionView: React.FC = () => {
  const { initializePayment, isLoading } = useFlutterwave();
  const { parent } = useUser();
  const { studentsData, getGraderDetails } = useStudentsData();
  const [upgradingChildId, setUpgradingChildId] = useState<string | null>(null);

  const currentParent = parent?.[0] || null;

  const b2cPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      text: "Essential learning & parent progress tracking at zero cost.",
      price: "Free",
      amount: 0,
      desc: [
        "All secondary school curriculum subjects & lessons",
        "Full PDF curriculum study notes & formula sheets",
        "Basic quizzes & practice tests",
        "Basic progress tracking & score history",
        "Streaks & iGG Points rewards",
        "1 Exam-Mode take per month (WAEC, JAMB, NECO)",
        "Past Questions: Older archives unlocked (Recent 5 years locked)",
        "Free Parent Portal child connection & basic progress overview",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      text: "Expanded assessment with up to 20 monthly exam simulations.",
      price: "₦15,000",
      amount: 15000,
      desc: [
        "Everything in the Basic plan",
        "Up to 20 Exam-Mode takes per month",
        "Full JAMB UTME 4-Subject Mock Simulations (up to 20/mo)",
        "Past Questions: Most recent 3 years unlocked",
        "Detailed performance analytics & topic strength breakdown",
        "Personalized revision recommendations",
        "Parent Portal: Multi-child monitoring & basic progress tracking",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      text: "Complete mastery with unlimited exams, all past questions & tutors.",
      price: "₦25,000",
      amount: 25000,
      desc: [
        "Everything in the Standard plan",
        "Unlimited Exam-Mode takes (no 20-attempt limit)",
        "Past Questions: Full access to all recent 5 years & entire archive",
        "Learning with an iGrades Tutor (VIP Early Access)",
        "Unlocks Parent Weekly Reports for this child",
        "Unlocks Parent Action Radar for this child",
        "Unlocks Parent Cognitive Diagnostics for this child",
        "Deep longitudinal learning analytics",
      ],
    },
  ];

  const handleUpgradeChild = async (
    student: any,
    targetTier: "standard" | "premium"
  ): Promise<void> => {
    const userEmail = currentParent?.email || student?.email;
    if (!userEmail) {
      toaster.create({
        title: "Authentication Required",
        description: "Parent email not found. Please log in again.",
        type: "error",
      });
      return;
    }

    const planToBuy = b2cPlans.find((p) => p.id === targetTier);
    if (!planToBuy) return;

    setUpgradingChildId(student.id);

    try {
      const result = await initializePayment(planToBuy, userEmail);

      if (result.success) {
        // Update this specific student row in the database
        const { error } = await supabase
          .from("students")
          .update({
            subscription: targetTier,
            subscription_status: "active",
            last_payment_ref: result.response?.tx_ref || "flutterwave_b2c",
          })
          .eq("id", student.id);

        if (error) throw error;

        await getGraderDetails();

        toaster.create({
          title: "Subscription Updated!",
          description: `${student.firstname || "Your child"} has been upgraded to ${planToBuy.name}. Parent intelligence features are now active!`,
          type: "success",
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error("Error updating child subscription:", err);
      toaster.create({
        title: "Update Error",
        description: "Payment was processed, but updating child subscription failed. Please refresh.",
        type: "error",
      });
    } finally {
      setUpgradingChildId(null);
    }
  };

  return (
    <Box bg="white" rounded="2xl" shadow="sm" p={{ base: 4, md: 8 }} mb={10}>
      {/* ── HEADER ── */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        mb={6}
        gap={4}
      >
        <Box>
          <HStack gap={2.5} mb={1}>
            <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
              Family Subscriptions & Entitlements
            </Heading>
            <Badge colorPalette="blue" variant="solid" size="sm" borderRadius="full" px={2.5}>
              B2C Model
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500" maxW="600px">
            Parent intelligence (Weekly Reports, Action Radar, and Cognitive Diagnostics) is tied to
            your connected child's Premium subscription. Child connection is free and unlimited.
          </Text>
        </Box>

        <HStack bg="blue.50" px={3.5} py={2} borderRadius="xl" border="1px solid" borderColor="blue.100">
          <Icon as={FiUsers} color="#206CE1" />
          <Text fontSize="xs" fontWeight="700" color="#1E56B3">
            Connected Children: {studentsData?.length || 0}
          </Text>
        </HStack>
      </Flex>

      {/* ── CONNECTED CHILDREN SUBSCRIPTION MANAGEMENT ── */}
      <Box mb={10}>
        <Heading size="sm" color="gray.800" fontWeight="700" mb={3}>
          Connected Children ({studentsData?.length || 0})
        </Heading>

        {(!studentsData || studentsData.length === 0) ? (
          <Box p={6} bg="gray.50" borderRadius="xl" textAlign="center">
            <Text fontSize="xs" color="gray.500">
              No children connected yet. Connect your child from the Student Directory to view and manage their subscription.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {studentsData.map((student) => {
              const { effectivePlan, isActive } = normalizePlan(
                student.subscription,
                student.subscription_status
              );
              const isChildUpgrading = isLoading && upgradingChildId === student.id;
              const isPremium = effectivePlan === "premium" && isActive;
              const isStandard = effectivePlan === "standard" && isActive;

              return (
                <Box
                  key={student.id}
                  p={5}
                  borderRadius="2xl"
                  border="1.5px solid"
                  borderColor={
                    isPremium
                      ? "purple.300"
                      : isStandard
                      ? "blue.300"
                      : "gray.200"
                  }
                  bg={
                    isPremium
                      ? "purple.50/20"
                      : isStandard
                      ? "blue.50/20"
                      : "gray.50/40"
                  }
                  shadow="sm"
                  position="relative"
                >
                  <Flex justify="space-between" align="start" mb={3}>
                    <HStack gap={2.5}>
                      <Box
                        p={2}
                        borderRadius="xl"
                        bg="blue.50"
                        color="#206CE1"
                      >
                        <PiStudentBold size={20} />
                      </Box>
                      <Box>
                        <Text fontWeight="800" fontSize="sm" color="gray.900">
                          {student.firstname} {student.lastname || ""}
                        </Text>
                        <Text fontSize="11px" color="gray.500">
                          Class: {student.class || "General"}
                        </Text>
                      </Box>
                    </HStack>
                    <Badge
                      colorPalette={isPremium ? "purple" : isStandard ? "blue" : "gray"}
                      variant="solid"
                      size="xs"
                      borderRadius="full"
                      px={2}
                    >
                      {PLAN_CONFIGS[effectivePlan].name}
                    </Badge>
                  </Flex>

                  {/* Feature Status for this child */}
                  <VStack align="stretch" gap={1.5} my={4} fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.600">Weekly Reports:</Text>
                      <Text
                        fontWeight="bold"
                        color={isPremium ? "green.600" : "gray.400"}
                      >
                        {isPremium ? "✓ Unlocked" : "Locked (Premium)"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Action Radar:</Text>
                      <Text
                        fontWeight="bold"
                        color={isPremium ? "green.600" : "gray.400"}
                      >
                        {isPremium ? "✓ Unlocked" : "Locked (Premium)"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Cognitive Diagnostics:</Text>
                      <Text
                        fontWeight="bold"
                        color={isPremium ? "green.600" : "gray.400"}
                      >
                        {isPremium ? "✓ Unlocked" : "Locked (Premium)"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Exam Mode Limit:</Text>
                      <Text fontWeight="bold" color="blue.600">
                        {isPremium
                          ? "Unlimited"
                          : isStandard
                          ? "20 / month"
                          : "1 / month"}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Action Buttons */}
                  {!isPremium ? (
                    <VStack gap={2} mt={3}>
                      <Button
                        size="xs"
                        w="full"
                        borderRadius="xl"
                        fontWeight="bold"
                        colorPalette="purple"
                        variant="solid"
                        loading={isChildUpgrading}
                        onClick={() => handleUpgradeChild(student, "premium")}
                      >
                        <Icon as={PiShootingStarDuotone} mr={1} />
                        Upgrade to Premium (₦25,000)
                      </Button>
                      {!isStandard && (
                        <Button
                          size="xs"
                          w="full"
                          borderRadius="xl"
                          fontWeight="bold"
                          colorPalette="blue"
                          variant="outline"
                          loading={isChildUpgrading}
                          onClick={() => handleUpgradeChild(student, "standard")}
                        >
                          Upgrade to Standard (₦15,000)
                        </Button>
                      )}
                    </VStack>
                  ) : (
                    <HStack justify="center" p={2} bg="green.50" borderRadius="lg" mt={2}>
                      <Icon as={FiCheckCircle} color="green.600" />
                      <Text fontSize="xs" fontWeight="bold" color="green.700">
                        Premium Active · Full Access
                      </Text>
                    </HStack>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      {/* ── B2C PLANS GRID ── */}
      <Box mb={10}>
        <Heading size="sm" color="gray.800" fontWeight="700" mb={1}>
          Available iGrades B2C Plans
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Select a tier to upgrade your child's learning experience and unlock advanced parental intelligence.
        </Text>

        <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
          {b2cPlans.map((plan) => {
            const isPremiumTier = plan.id === "premium";
            const isStandardTier = plan.id === "standard";

            return (
              <Flex
                key={plan.id}
                direction="column"
                justify="space-between"
                flex="1"
                p={{ base: 5, md: 6 }}
                borderRadius="2xl"
                border="2px solid"
                borderColor={
                  isPremiumTier
                    ? "purple.200"
                    : isStandardTier
                    ? "blue.100"
                    : "gray.200"
                }
                bg={
                  isPremiumTier
                    ? "purple.50/20"
                    : isStandardTier
                    ? "blue.50/10"
                    : "white"
                }
                shadow="sm"
                position="relative"
              >
                <Box>
                  <HStack justify="space-between" align="center" mb={1}>
                    <Heading size="md" color="gray.900" fontWeight="800">
                      {plan.name}
                    </Heading>
                    {isPremiumTier && (
                      <Badge colorPalette="purple" variant="solid" size="xs" borderRadius="full" px={2}>
                        <Icon as={LuSparkles} mr={0.5} /> Most Comprehensive
                      </Badge>
                    )}
                  </HStack>

                  <Text fontSize="xs" color="gray.500" mb={3} minH="34px">
                    {plan.text}
                  </Text>

                  <HStack align="baseline" gap={1} mb={4}>
                    <Text fontSize="2xl" fontWeight="900" color="gray.900">
                      {plan.price}
                    </Text>
                    {plan.amount > 0 && (
                      <Text fontSize="xs" color="gray.500">
                        / month per child
                      </Text>
                    )}
                  </HStack>

                  <Box borderTop="1px solid" borderColor="gray.100" pt={4} mb={4}>
                    <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
                      What's Included
                    </Text>
                    <VStack align="stretch" gap={2}>
                      {plan.desc.map((feat, idx) => (
                        <HStack key={idx} align="start" gap={2} w="full">
                          <Icon as={IoIosCheckmarkCircle} color={isPremiumTier ? "purple.500" : "#206CE1"} boxSize={4} flexShrink={0} mt="2px" />
                          <Text fontSize="xs" color="gray.700" lineHeight="1.3">
                            {feat}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      </Box>

      {/* ── DETAILED FEATURE MATRIX ── */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor="gray.100">
        <Heading size="sm" color="gray.800" fontWeight="700" mb={1}>
          Complete Feature Comparison Matrix
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Detailed breakdown of student learning access and connected parent portal intelligence.
        </Text>

        <Box overflowX="auto">
          <Box as="table" w="full" fontSize="xs" textAlign="left" style={{ borderCollapse: "collapse" }}>
            <Box as="thead">
              <Box as="tr" borderBottom="2px solid" borderColor="gray.200">
                <Box as="th" py={2.5} px={3} color="gray.800" fontWeight="bold">
                  Feature / Capability
                </Box>
                <Box as="th" py={2.5} px={3} color="gray.800" fontWeight="bold" textAlign="center">
                  Basic (₦0)
                </Box>
                <Box as="th" py={2.5} px={3} color="#206CE1" fontWeight="bold" textAlign="center">
                  Standard (₦15,000)
                </Box>
                <Box as="th" py={2.5} px={3} color="purple.600" fontWeight="bold" textAlign="center">
                  Premium (₦25,000)
                </Box>
              </Box>
            </Box>
            <Box as="tbody">
              {PLAN_COMPARISON_MATRIX.map((row, idx) => (
                <Box
                  as="tr"
                  key={idx}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  bg={idx % 2 === 0 ? "white" : "gray.50/50"}
                >
                  <Box as="td" py={2.5} px={3} fontWeight="medium" color="gray.700">
                    {row.feature}
                  </Box>
                  <Box as="td" py={2.5} px={3} textAlign="center" color={row.basic === "—" ? "gray.400" : "gray.900"}>
                    {row.basic}
                  </Box>
                  <Box as="td" py={2.5} px={3} textAlign="center" color={row.standard === "—" ? "gray.400" : "blue.700"} fontWeight={row.standard !== "—" ? "semibold" : "normal"}>
                    {row.standard}
                  </Box>
                  <Box as="td" py={2.5} px={3} textAlign="center" color="purple.700" fontWeight="semibold">
                    {row.premium}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
