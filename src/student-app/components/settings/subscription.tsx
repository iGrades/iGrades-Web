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

const Subscription: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { authdStudent, refreshStudentData } = useAuthdStudentData();
  const { pointsBalance, creditBalance, convertPoints, applyCredit, actionLoading } = usePointsSystem();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      text: "Ideal for beginners starting their learning journey.",
      price: "Zero Fee",
      amount: 0,
      desc: [
        "Foundational Access",
        "Access to selected PDF learning materials",
        "Access to limited video lessons",
        "Basic student dashboard access",
        "Introductory academic resources",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      text: "Perfect for regular learners seeking more features.",
      price: "₦15,000",
      amount: 15000, 
      desc: [
        "Comprehensive Learning Experience",
        "Full access to all PDF materials",
        "Complete video lesson library",
        "Access to scheduled live group sessions",
        "Mock quizzes with performance tracking",
        "Structured academic progression support",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      text: "Best for dedicated learners wanting full experience.",
      price: "₦25,000",
      amount: 25000,
      desc: [
        "Advanced & Personalized Learning",
        "Everything in the Standard Plan",
        "Priority access to live sessions",
        "Advanced mock examinations with feedback",
        "Personalized academic guidance",
        "Early access to new learning resources",
      ],
    },
  ];

  const currentPlan = authdStudent?.subscription;

  const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
    if (currentPlan === plan.id) return;

    const userEmail = authdStudent?.email;

    // Calculate store credit discount
    const availableCredit = creditBalance || 0;
    const creditToApply = plan.amount > 0 ? Math.min(availableCredit, plan.amount) : 0;
    const payableAmount = Math.max(0, plan.amount - creditToApply);

    const effectivePlan: SubscriptionPlan = {
      ...plan,
      amount: payableAmount,
    };

    // 1. Trigger Flutterwave UI (or skip for free / 100% store credit covered plan)
    const result = await initializePayment(effectivePlan, userEmail);

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
    if (currentPlan === plan.id) return "Current Plan";
    if (plan.id === "basic") return "Get Started Free";
    return `Get ${plan.name}`;
  };

  return (
    <Box
      bg="white"
      rounded="md"
      shadow="sm"
      p={4}
      mb={10}
      h="auto"
    >
      {/* iGrades Points & Store Credit Discount Banner */}
      <Box
        p={4}
        borderRadius="2xl"
        bgGradient="linear(to-r, amber.500, orange.600)"
        color="white"
        mb={6}
        shadow="md"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={3}
        >
          <HStack gap={3}>
            <Box p={2.5} bg="white/20" borderRadius="xl">
              <FiAward size={26} />
            </Box>
            <Box>
              <HStack gap={2}>
                <Heading size="sm" color="white" fontWeight="extrabold">
                  iGrades Rewards Store Credit
                </Heading>
                <Badge colorPalette="amber" variant="solid" bg="white" color="amber.800" px={2} fontSize="10px">
                  {pointsBalance.toLocaleString()} IGG Pts Available
                </Badge>
              </HStack>
              <Text fontSize="xs" color="amber.100" mt={0.5}>
                Available Subscription Store Credit: <Text as="span" fontWeight="bold" fontSize="sm" color="white">₦{creditBalance.toLocaleString()}</Text>
              </Text>
            </Box>
          </HStack>

          {pointsBalance >= 100 && (
            <Button
              size="sm"
              bg="white"
              color="amber.800"
              _hover={{ bg: "amber.50" }}
              fontWeight="bold"
              borderRadius="xl"
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
          const isCurrentPlan = currentPlan === plan.id;
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
