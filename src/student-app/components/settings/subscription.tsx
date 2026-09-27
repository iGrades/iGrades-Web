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
      text: "Ideal for beginners starting their learning journey.",
      price: "Free",
      amount: 0,
      desc: [
        "Up to 4 starter subjects & curriculum topics",
        "Recent 2 years of Past Questions (2023–2024)",
        "2 starter video lessons per topic & starter PDFs",
        "5 Spark AI interactions per day",
        "Limited Socratic guidance & starter hints",
        "Limited timed practice (up to 3 timed quizzes/day)",
        "Basic score history & progress tracking",
        "iGG Points, streaks & reward conversion (available on all plans)",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      text: "Perfect for regular learners seeking more features.",
      price: "₦15,000",
      amount: 15000, 
      desc: [
        "Expanded access to all secondary subjects",
        "10-year Past Questions archive (WAEC, JAMB, NECO)",
        "Full video lesson catalog & complete PDF study guides",
        "30 Spark AI interactions per day",
        "Included multi-level Socratic tutoring & worked guidance",
        "Personalized guidance & misconception diagnosis",
        "Limited AI Proctoring (up to 3 proctored mock exams)",
        "Full Examination Mode & 4-subject JAMB simulation",
        "Detailed performance breakdown & study paths",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      text: "Best for dedicated learners wanting full experience.",
      price: "₦25,000",
      amount: 25000,
      desc: [
        "Everything in the Standard Plan",
        "Highest Spark AI daily usage (fair-use limits)",
        "Advanced cognitive Socratic tutoring & derivations",
        "Advanced personalized tutoring & longitudinal support",
        "Full unrestricted AI Proctoring with vision & audio",
        "Generous proctored mock exams access (fair-use)",
        "Generous timed practice & priority exam simulations",
        "Deep & advanced learning analytics with AI diagnostics",
        "Priority access to new study materials & mocks",
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
        direction={{ base: "column", md: "row" }}
        justify="space-around"
        align="center"
        gap={5}
        mt={4}
      >
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = effectivePlan === plan.id && !isExpired;
          const isPlanLoading = isLoading && loadingPlanId === plan.id;

          return (
            <Box
              key={plan.id}
              border="1px"
              borderColor={isCurrentPlan ? "primaryColor" : "gray.200"}
              p={4}
              rounded="xl"
              shadow="sm"
              textAlign="center"
              w={{ base: "100%", md: "40%", lg: "30%" }}
              position="relative"
            >
              {isCurrentPlan && (
                <Badge
                  position="absolute"
                  top="-3"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="green"
                  variant="solid"
                  rounded="full"
                  px={3}
                  fontSize="xs"
                >
                  Active Plan
                </Badge>
              )}

              <Heading color="on_backgroundColor" my={1}>
                {plan.name}
              </Heading>
              <Text fontSize="xs" color="fieldTextColor">
                {plan.text}
              </Text>
              <Box my={3}>
                <Heading fontSize="2xl" color="on_backgroundColor">
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
                my={2}
                p={4}
                bg={isCurrentPlan ? "gray.100" : "primaryColor"}
                color={isCurrentPlan ? "gray.500" : "on_primaryColor"}
                rounded="xl"
                onClick={() => handlePayment(plan)}
                loading={isPlanLoading}
                loadingText="Processing..."
                disabled={isLoading || isCurrentPlan}
                _hover={
                  isCurrentPlan
                    ? {}
                    : {
                        bg: "primaryColor",
                        transform: "translateY(-2px)",
                        shadow: "lg",
                      }
                }
                transition="all 0.2s"
              >
                {!isCurrentPlan && plan.id !== "basic" && (
                  <PiShootingStarDuotone style={{ marginRight: "6px", fontSize: "1.1rem" }} />
                )}
                {getButtonLabel(plan)}
              </Button>

              <Text
                textAlign="left"
                mt={4}
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
              >
                {plan.name} plan for all users
              </Text>

              {plan.desc.map((feature, index) => (
                <Flex align="center" key={index} gap={2} mt={2}>
                  <Icon
                    as={IoIosCheckmarkCircle}
                    color="green.500"
                    boxSize={4}
                  />
                  <Text fontSize="xs" color="gray.500">
                    {feature}
                  </Text>
                </Flex>
              ))}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default Subscription;
