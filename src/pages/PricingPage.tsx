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
  VStack,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useFlutterwave } from "@/hooks/useFlutterwave";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { SubscriptionPlan } from "@/types/flutterwave";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";
import { normalizePlan, PLAN_COMPARISON_MATRIX } from "@/services/subscriptionEntitlements";
import { PiShootingStarDuotone } from "react-icons/pi";

const Pricing: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { authdStudent, refreshStudentData } = useAuthdStudentData();

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
        "Streaks & iGG Points (earn, track & redeem rewards)",
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

  const { effectivePlan, isExpired } = normalizePlan(
    authdStudent?.subscription,
    authdStudent?.subscription_status
  );

  const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
    if (effectivePlan === plan.id && !isExpired) return;

    // Handle authentication guard fallback safety
    if (!authdStudent) {
      toaster.create({
        title: "Authentication Required",
        description: "Please log in to your account to update your subscription.",
        type: "error",
      });
      return;
    }

    const userEmail = authdStudent.email;

    // 1. Trigger Flutterwave UI Checkout
    const result = await initializePayment(plan, userEmail);

    // 2. If payment succeeded (or free plan selected route completed successfully)
    if (result.success) {
      try {
        const { error } = await supabase
          .from("students")
          .update({
            subscription: plan.id,
            subscription_status: "active",
            last_payment_ref: result.response?.tx_ref || "free_plan",
          })
          .eq("id", authdStudent.id);

        if (error) throw error;

        // 3. Real-time background data sync refresh via context hook
        await refreshStudentData?.();

        toaster.create({
          title: "Subscription Updated!",
          description: `You are now successfully on the ${plan.name} plan.`,
          type: "success",
          duration: 4000,
          closable: true,
        });
      } catch (err) {
        console.error("Database sync write-back error:", err);
        toaster.create({
          title: "Database Sync Error",
          description: "Payment verified, but account sync failed. Kindly ping support.",
          type: "error",
          duration: 7000,
          closable: true,
        });
      }
    }
  };

  const getButtonLabel = (plan: SubscriptionPlan): string => {
    if (effectivePlan === plan.id && !isExpired) return "Current Plan";
    if (plan.id === "basic") return "Get Started Free";
    return `Unlock ${plan.name} Plan`;
  };

  return (
    <>
      <NavBar />
      <Box 
        py={{ base: 12, md: 20 }} 
        px={{ base: 4, md: 8, lg: 12 }} 
        w="100%" 
        maxW="1200px" 
        mx="auto"
      >
        {/* Page Heading Headers */}
        <VStack gap={3} textAlign="center" mb={{ base: 12, md: 16 }}>
          <Heading
            as="h4"
            fontSize="sm"
            fontWeight="bold"
            color="#FD8B3A"
            letterSpacing="widest"
          >
            PRICING PLANS
          </Heading>
          <Heading
            color="on_backgroundColor"
            fontWeight="bold"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          >
            Choose the Perfect Plan
          </Heading>
          <Text fontSize="md" color="gray.500" maxW="500px">
            Flexible pricing built to support your academic growth. Upgrade, downgrade, or cancel anytime.
          </Text>
        </VStack>
  
        {/* Pricing Cards Track Grid */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="center"
          align={{ base: "stretch", md: "center" }}
          gap={{ base: 8, md: 4, lg: 6 }}
        >
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = effectivePlan === plan.id && !isExpired;
            const isPlanLoading = isLoading && loadingPlanId === plan.id;
            const isStandard = plan.id === "standard"; // Highlight middle card uniquely
  
            return (
              <Box
                key={plan.id}
                bg="white"
                border="2px solid"
                borderColor={
                  isCurrentPlan 
                    ? "primaryColor" 
                    : isStandard 
                    ? "blue.100" 
                    : "gray.100"
                }
                p={{ base: 6, lg: 8 }}
                borderRadius="2xl"
                boxShadow={
                  isStandard 
                    ? "0 10px 30px rgba(32,108,225,0.08)" 
                    : "0 4px 20px rgba(0,0,0,0.02)"
                }
                textAlign="left"
                w={{ base: "100%", md: "33%" }}
                position="relative"
                transform={isStandard ? { md: "scale(1.03)" } : "none"}
                zIndex={isStandard ? 2 : 1}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.3s ease"
              >
                {/* Badges System Overlays */}
                {isCurrentPlan ? (
                  <Badge
                    position="absolute"
                    top="-3"
                    left="6"
                    bg="green.500"
                    color="white"
                    variant="solid"
                    rounded="full"
                    px={4}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Active Plan
                  </Badge>
                ) : isStandard ? (
                  <Badge
                    position="absolute"
                    top="-3"
                    left="6"
                    bg="primaryColor"
                    color="white"
                    variant="solid"
                    rounded="full"
                    px={4}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Most Popular
                  </Badge>
                ) : null}
  
                {/* Core Information Head Node */}
                <Box>
                  <Heading size="md" color="on_backgroundColor" mb={2}>
                    {plan.name}
                  </Heading>
                  
                  <Text fontSize="xs" color="gray.500" minH="36px" mb={4}>
                    {plan.text}
                  </Text>
  
                  <Flex align="baseline" mb={6}>
                    <Heading fontSize={{ base: "3xl", lg: "4xl" }} color="on_backgroundColor" fontWeight="black">
                      {plan.price}
                    </Heading>
                    {plan.id !== "basic" && (
                      <Text fontSize="xs" color="gray.400" ml={1} fontWeight="medium">
                        / month
                      </Text>
                    )}
                  </Flex>
  
                  <Button
                    w="full"
                    h="46px"
                    bg={isCurrentPlan ? "gray.100" : "primaryColor"}
                    color={isCurrentPlan ? "gray.500" : "white"}
                    fontWeight="bold"
                    borderRadius="xl"
                    onClick={() => handlePayment(plan)}
                    loading={isPlanLoading}
                    loadingText="Processing..."
                    disabled={isLoading || isCurrentPlan}
                    border="none"
                    cursor={isCurrentPlan ? "not-allowed" : "pointer"}
                    boxShadow={isCurrentPlan ? "none" : "0 4px 14px rgba(32,108,225,0.25)"}
                    _hover={
                      isCurrentPlan
                        ? {}
                        : {
                            bg: "primaryColor",
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(32,108,225,0.35)",
                          }
                    }
                  >
                    {!isCurrentPlan && plan.id !== "basic" && (
                      <PiShootingStarDuotone style={{ marginRight: "6px", fontSize: "1.1rem" }} />
                    )}
                    {getButtonLabel(plan)}
                  </Button>
  
                  {/* Subtext divider label */}
                  <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase" mt={6} mb={3} letterSpacing="wider">
                    What's Included
                  </Text>
  
                  {/* Features Checklist Grid */}
                  <VStack gap={3} align="stretch">
                    {plan.desc.map((feature, index) => (
                      <Flex align="start" key={index} gap={2.5}>
                        <Icon
                          as={IoIosCheckmarkCircle}
                          color="green.500"
                          boxSize={4}
                          mt="2px"
                          flexShrink={0}
                        />
                        <Text fontSize="xs" color="gray.600" lineHeight="1.4">
                          {feature}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </Box>
            );
          })}
        </Flex>

        {/* ── SIDE-BY-SIDE FEATURE MATRIX TABLE ── */}
        <Box mt={{ base: 16, md: 24 }} bg="white" borderRadius="2xl" p={{ base: 5, md: 8 }} border="1px solid" borderColor="gray.100" shadow="sm">
          <VStack gap={2} textAlign="center" mb={8}>
            <Heading size="lg" color="gray.900" fontWeight="800">
              Detailed Plan Comparison
            </Heading>
            <Text fontSize="sm" color="gray.500" maxW="600px">
              Transparent, student-first monetization. Core learning remains 100% accessible to every student on Basic.
            </Text>
          </VStack>

          <Box overflowX="auto">
            <Box as="table" w="full" fontSize="sm" textAlign="left" style={{ borderCollapse: "collapse" }}>
              <Box as="thead">
                <Box as="tr" borderBottom="2px solid" borderColor="gray.200">
                  <Box as="th" py={3} px={4} color="gray.800" fontWeight="bold">
                    Feature & Resource
                  </Box>
                  <Box as="th" py={3} px={4} color="gray.800" fontWeight="bold" textAlign="center">
                    Basic (₦0)
                  </Box>
                  <Box as="th" py={3} px={4} color="#206CE1" fontWeight="bold" textAlign="center">
                    Standard (₦15,000)
                  </Box>
                  <Box as="th" py={3} px={4} color="purple.600" fontWeight="bold" textAlign="center">
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
                    <Box as="td" py={3} px={4} fontWeight="medium" color="gray.700">
                      {row.feature}
                    </Box>
                    <Box as="td" py={3} px={4} textAlign="center" color={row.basic === "—" ? "gray.400" : "gray.900"}>
                      {row.basic}
                    </Box>
                    <Box as="td" py={3} px={4} textAlign="center" color={row.standard === "—" ? "gray.400" : "blue.700"} fontWeight={row.standard !== "—" ? "semibold" : "normal"}>
                      {row.standard}
                    </Box>
                    <Box as="td" py={3} px={4} textAlign="center" color="purple.700" fontWeight="semibold">
                      {row.premium}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
   
  );
};

export default Pricing;