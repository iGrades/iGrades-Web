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

const Pricing: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { authdStudent, refreshStudentData } = useAuthdStudentData();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      text: "Ideal for beginners starting their learning journey.",
      price: "Free",
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
    if (currentPlan === plan.id) return "Current Plan";
    if (plan.id === "basic") return "Get Started Free";
    return `Upgrade to ${plan.name}`;
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
            const isCurrentPlan = currentPlan === plan.id;
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
      </Box>
      <Footer />
    </>
   
  );
};

export default Pricing;