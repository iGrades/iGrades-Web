import React from "react";
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
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useFlutterwave } from "@/hooks/useFlutterwave";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { SubscriptionPlan } from "@/types/flutterwave";
import { usePointsSystem } from "@/student-app/hooks/usePointsSystem";
import { FiAward } from "react-icons/fi";
import { PiShootingStarDuotone } from "react-icons/pi";
import { normalizePlan } from "@/services/subscriptionEntitlements";

const Subscription: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { authdStudent, refreshStudentData } = useAuthdStudentData();
  const { pointsBalance, creditBalance, convertPoints, applyCredit, actionLoading } = usePointsSystem();

  const { effectivePlan, isExpired } = normalizePlan(
    authdStudent?.subscription,
    authdStudent?.subscription_status
  );

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      text: "Core secondary school learning with 1 monthly exam simulation.",
      price: "Free",
      amount: 0,
      desc: [
        "All secondary school curriculum subjects & lessons",
        "Full PDF curriculum study notes & formula sheets",
        "Basic quizzes & practice tests",
        "Basic progress tracking & score history",
        "Streaks & iGG Points (earn, track & convert rewards)",
        "1 Exam-Mode take per month (WAEC, JAMB, NECO)",
        "Past Questions: Older archives unlocked (Recent 5 years locked)",
        "Learning with a Tutor: Locked",
        "Free Parent connection & basic progress overview",
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
        "Learning with a Tutor: Locked",
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
        "Unlocks Parent Weekly Reports for connected parents",
        "Unlocks Parent Action Radar for connected parents",
        "Unlocks Parent Cognitive Diagnostics for connected parents",
        "Deep longitudinal learning analytics",
      ],
    },
  ];

  const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
    if (effectivePlan === plan.id && !isExpired) return;

    const userEmail = authdStudent?.email;

    // Calculate store credit discount
    const availableCredit = creditBalance || 0;
    const creditToApply = plan.amount > 0 ? Math.min(availableCredit, plan.amount) : 0;
    const payableAmount = Math.max(0, plan.amount - creditToApply);

    const payablePlan: SubscriptionPlan = {
      ...plan,
      amount: payableAmount,
    };

    // 1. Trigger Flutterwave UI (or skip for free / 100% store credit covered plan)
    const result = await initializePayment(payablePlan, userEmail);

    // 2. If payment succeeded (or free plan / credit-paid selected)
    if (result.success) {
      try {
        // Atomically deduct store credit if applied
        if (creditToApply > 0) {
          const invoiceId = `sub_${plan.id}_${Date.now()}`;
          await applyCredit(invoiceId, creditToApply);
        }

        const { error } = await supabase
          .from("students")
          .update({
            subscription: plan.id,
            subscription_status: "active",
            last_payment_ref: result.response?.tx_ref || (creditToApply >= plan.amount ? "store_credit_full" : "free_plan"),
          })
          .eq("id", authdStudent?.id);

        if (error) throw error;

        await refreshStudentData?.();

        toaster.create({
          title: "Subscription Updated!",
          description: creditToApply > 0
            ? `Applied ₦${creditToApply.toLocaleString()} store credit! You are now on the ${plan.name} plan.`
            : `You are now on the ${plan.name} plan.`,
          type: "success",
          duration: 5000,
          closable: true,
        });
      } catch (err) {
        console.error("Error updating subscription in database:", err);
        toaster.create({
          title: "Database Error",
          description:
            "Payment was received but we could not update your subscription. Please contact support.",
          type: "error",
          duration: 7000,
          closable: true,
        });
      }
    }
  };

  const getButtonLabel = (plan: SubscriptionPlan): string => {
    if (effectivePlan === plan.id) {
      if (isExpired) return "Renew Subscription";
      return "Current Plan";
    }
    if (plan.id === "basic") return "Get Started Free";
    return `Unlock ${plan.name} Plan`;
  };

  return (
    <Box
      bg="white"
      rounded="2xl"
      shadow="sm"
      p={{ base: 4, md: 6 }}
      mb={10}
      h="auto"
    >
      {/* Active Subscription Status Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mb={5}
        gap={3}
        pb={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Box>
          <HStack gap={2.5} mb={1}>
            <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
              Student Subscription
            </Heading>
            <Badge
              colorPalette={effectivePlan === "premium" ? "purple" : effectivePlan === "standard" ? "blue" : "gray"}
              variant="solid"
              size="sm"
              borderRadius="full"
              px={2.5}
            >
              Current: {effectivePlan === "premium" ? "Premium" : effectivePlan === "standard" ? "Standard" : "Basic (Free)"}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {isExpired
              ? "Your subscription has expired and access has reverted to Basic tier."
              : effectivePlan === "basic"
              ? "You are currently enjoying free foundational curriculum access."
              : `Your account has active ${effectivePlan === "premium" ? "Premium" : "Standard"} access.`}
          </Text>
        </Box>
      </Flex>

      {/* Expired Subscription Notice Banner */}
      {isExpired && (
        <Box
          p={4}
          borderRadius="2xl"
          bg="red.50"
          border="1px solid"
          borderColor="red.300"
          mb={6}
          shadow="xs"
        >
          <Flex align="center" gap={3}>
            <Text fontSize="sm" color="red.800" fontWeight="medium">
              ⚠️ <strong>Subscription Expired:</strong> Your previous subscription has expired. You are currently on the free Basic tier. Renew below to reactivate full curriculum and examination access.
            </Text>
          </Flex>
        </Box>
      )}
      {/* iGrades Points & Store Credit Discount Banner */}
      <Box
        p={4}
        borderRadius="2xl"
        bg="white"
        border="1px solid"
        borderColor="amber.300"
        mb={6}
        shadow="xs"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={3}
        >
          <HStack gap={3}>
            <Box p={2.5} bg="amber.50" border="1px solid" borderColor="amber.200" borderRadius="xl" color="amber.700">
              <FiAward size={26} />
            </Box>
            <Box>
              <HStack gap={2} flexWrap="wrap">
                <Heading size="sm" color="gray.900" fontWeight="extrabold">
                  iGrades Rewards Store Credit
                </Heading>
                <Badge colorPalette="amber" variant="subtle" bg="amber.100" color="amber.800" border="1px solid" borderColor="amber.200" px={2} fontSize="10px" fontWeight="bold">
                  {pointsBalance.toLocaleString()} IGG Pts Available
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.600" mt={0.5}>
                Available Subscription Store Credit:{" "}
                <Text as="span" fontWeight="bold" fontSize="sm" color="emerald.700">
                  ₦{creditBalance.toLocaleString()}
                </Text>
              </Text>
            </Box>
          </HStack>

          {pointsBalance >= 100 && (
            <Button
              size="sm"
              bg="amber.600"
              color="white"
              _hover={{ bg: "amber.700" }}
              fontWeight="bold"
              borderRadius="xl"
              shadow="xs"
              loading={actionLoading}
              onClick={() => convertPoints(100)}
            >
              Convert 100 Pts → Get ₦1,000 Credit
            </Button>
          )}
        </Flex>
      </Box>

      <Flex
        direction={{ base: "column", xl: "row" }}
        justify="center"
        align="stretch"
        gap={6}
        mt={6}
        w="full"
      >
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = effectivePlan === plan.id && !isExpired;
          const isPlanLoading = isLoading && loadingPlanId === plan.id;

          return (
            <Box
              key={plan.id}
              border="1.5px solid"
              borderColor={isCurrentPlan ? "#206CE1" : "gray.200"}
              p={{ base: 5, md: 6 }}
              rounded="2xl"
              shadow={isCurrentPlan ? "md" : "xs"}
              bg={isCurrentPlan ? "blue.50/20" : "white"}
              textAlign="left"
              flex={{ base: "none", xl: 1 }}
              w={{ base: "100%", md: "100%", xl: "32%" }}
              minW={{ xl: "320px" }}
              position="relative"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              transition="all 0.2s ease"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            >
              <Box>
                {isCurrentPlan && (
                  <Badge
                    position="absolute"
                    top="-3"
                    left="6"
                    bg="#206CE1"
                    color="white"
                    variant="solid"
                    rounded="full"
                    px={3}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Active Plan
                  </Badge>
                )}

                <Heading size="md" color="gray.900" fontWeight="800" my={1} textAlign="left">
                  {plan.name}
                </Heading>
                <Text fontSize="xs" color="gray.500" textAlign="left" minH="32px">
                  {plan.text}
                </Text>

                <Box my={3} textAlign="left">
                  <Heading fontSize="2xl" color="gray.900" fontWeight="900" textAlign="left">
                    {plan.price}
                  </Heading>
                  {creditBalance > 0 && plan.amount > 0 && (
                    <Badge colorPalette="green" variant="subtle" mt={1} px={2} py={0.5} fontSize="11px" borderRadius="md">
                      {creditBalance >= plan.amount
                        ? "100% Covered by Store Credit"
                        : `₦${creditBalance.toLocaleString()} credit applied → Pay ₦${(plan.amount - creditBalance).toLocaleString()}`}
                    </Badge>
                  )}
                </Box>

                <Button
                  w="full"
                  my={3}
                  h="42px"
                  bg={isCurrentPlan ? "gray.100" : "#206CE1"}
                  color={isCurrentPlan ? "gray.600" : "white"}
                  rounded="xl"
                  fontWeight="bold"
                  fontSize="xs"
                  onClick={() => handlePayment(plan)}
                  loading={isPlanLoading}
                  loadingText="Processing..."
                  disabled={isLoading || isCurrentPlan}
                  _hover={
                    isCurrentPlan
                      ? {}
                      : {
                          bg: "#1852B2",
                          transform: "translateY(-1px)",
                          shadow: "md",
                        }
                  }
                  transition="all 0.2s"
                >
                  {!isCurrentPlan && plan.id !== "basic" && (
                    <PiShootingStarDuotone style={{ marginRight: "6px", fontSize: "1.1rem" }} />
                  )}
                  {getButtonLabel(plan)}
                </Button>

                <Box borderTop="1px solid" borderColor="gray.100" pt={4} mt={3}>
                  <Text
                    textAlign="left"
                    fontSize="11px"
                    fontWeight="800"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    mb={3}
                  >
                    Included Features
                  </Text>

                  <VStack align="stretch" gap={2.5}>
                    {plan.desc.map((feature, index) => (
                      <HStack
                        key={index}
                        align="center"
                        justify="flex-start"
                        gap={2}
                        w="full"
                        textAlign="left"
                      >
                        <Icon
                          as={IoIosCheckmarkCircle}
                          color="#206CE1"
                          boxSize={4}
                          flexShrink={0}
                        />
                        <Text
                          fontSize="xs"
                          color="gray.700"
                          textAlign="left"
                          lineHeight="1.3"
                          whiteSpace={{ base: "normal", md: "nowrap" }}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          title={feature}
                        >
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default Subscription;
