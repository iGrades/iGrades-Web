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
import { useUser } from "@/parent-app/context/parentDataContext";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import type { SubscriptionPlan } from "@/types/flutterwave";
import { PLAN_CONFIGS } from "@/services/subscriptionEntitlements";
import { FiUsers } from "react-icons/fi";
import { PiShootingStarDuotone } from "react-icons/pi";

export const ParentSubscriptionView: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { parent, getParentData } = useUser();
  const { studentsData, getGraderDetails } = useStudentsData();
  const { effectivePlan, isExpired, currentChildrenCount, maxAllowedChildren } =
    useParentSubscriptionEntitlement();

  const currentParent = parent?.[0] || null;

  const parentPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      text: "Essential parent visibility for 1 child at zero cost.",
      price: "Free",
      amount: 0,
      desc: [
        "1 connected child account",
        "Basic child progress visibility & score tracking",
        "Basic quiz history & average score dashboard",
        "Basic progress information & summary reports",
        "Free parent account & child connection (never paywalled)",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      text: "Comprehensive family monitoring with weekly digests for up to 3 children.",
      price: "₦15,000",
      amount: 15000,
      desc: [
        "Up to 3 connected children accounts",
        "Subject performance & score trends over time",
        "Weekly progress reporting & executive digests",
        "Useful learning intelligence & actionable parent guidance",
        "Topic-level strengths & areas requiring attention",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      text: "Mastery intelligence & deep diagnostics for families up to 5 children.",
      price: "₦25,000",
      amount: 25000,
      desc: [
        "Up to 5 connected children accounts",
        "Advanced learning intelligence & cognitive diagnostics",
        "Exam readiness indicator (JAMB/WAEC/BECE readiness)",
        "Advanced & detailed reporting with printable digests",
        "Longitudinal progress trends & priority academic insights",
      ],
    },
  ];

  const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
    if (effectivePlan === plan.id && !isExpired) return;

    const userEmail = currentParent?.email;
    if (!userEmail) {
      toaster.create({
        title: "Authentication Required",
        description: "Parent email not found. Please log in again.",
        type: "error",
      });
      return;
    }

    const result = await initializePayment(plan, userEmail);

    if (result.success) {
      try {
        // Update parent row in database if parent exists
        if (currentParent?.id) {
          const { error: parentUpdateError } = await supabase
            .from("parents")
            .update({
              subscription: plan.name, // e.g. "Standard" or "Premium"
              subscription_status: "active",
            })
            .eq("id", currentParent.id);

          if (parentUpdateError) {
            console.warn("Could not update parent subscription row directly:", parentUpdateError);
          }
        }

        // Also update all linked children so they inherit the family tier
        if (studentsData && studentsData.length > 0) {
          const studentIds = studentsData.map((s) => s.id);
          await supabase
            .from("students")
            .update({
              subscription: plan.name,
              subscription_status: "active",
            })
            .in("id", studentIds);
        }

        await getParentData();
        await getGraderDetails();

        toaster.create({
          title: "Subscription Updated!",
          description: `Your parent account is now on the ${plan.name} plan.`,
          type: "success",
          duration: 5000,
        });
      } catch (err: any) {
        console.error("Error updating parent subscription:", err);
        toaster.create({
          title: "Update Error",
          description: "Payment was received but could not update subscription. Please refresh.",
          type: "error",
        });
      }
    }
  };

  const getButtonLabel = (plan: SubscriptionPlan): string => {
    if (effectivePlan === plan.id) {
      if (isExpired) return "Renew Subscription";
      return "Current Plan";
    }
    if (plan.id === "basic") return "Free Starter";
    return `Unlock ${plan.name} Plan`;
  };

  return (
    <Box bg="white" rounded="2xl" shadow="sm" p={{ base: 4, md: 8 }} mb={10}>
      {/* Header */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={6} gap={4}>
        <Box>
          <HStack gap={2.5} mb={1}>
            <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
              Parent Portal Subscription
            </Heading>
            <Badge
              colorPalette={effectivePlan === "premium" ? "purple" : effectivePlan === "standard" ? "blue" : "gray"}
              variant="solid"
              size="sm"
              borderRadius="full"
              px={2.5}
            >
              Current: {PLAN_CONFIGS[effectivePlan]?.name || "Basic"}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Manage your family learning monitoring plan, connected children limits, and advanced academic intelligence.
          </Text>
        </Box>

        {/* Family Summary Pill */}
        <HStack bg="blue.50" px={3.5} py={2} borderRadius="xl" border="1px solid" borderColor="blue.100">
          <Icon as={FiUsers} color="#206CE1" />
          <Text fontSize="xs" fontWeight="700" color="#1E56B3">
            Connected Children: {currentChildrenCount} / {maxAllowedChildren}
          </Text>
        </HStack>
      </Flex>

      {/* Expired Subscription Notice Banner */}
      {isExpired && (
        <Box p={4} borderRadius="xl" bg="red.50" border="1px solid" borderColor="red.300" mb={6}>
          <Text fontSize="xs" color="red.800" fontWeight="semibold">
            ⚠️ <strong>Subscription Expired:</strong> Your previous plan has expired and reverted to Basic (1 child limit, basic progress). Renew below to reactivate multi-child access, weekly reports, and learning intelligence.
          </Text>
        </Box>
      )}

      {/* Subscription Plans Grid */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
        {parentPlans.map((plan) => {
          const isCurrent = effectivePlan === plan.id && !isExpired;
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
                isCurrent
                  ? "#206CE1"
                  : isPremiumTier
                  ? "purple.200"
                  : isStandardTier
                  ? "blue.100"
                  : "gray.200"
              }
              bg={
                isCurrent
                  ? "blue.50/30"
                  : isPremiumTier
                  ? "purple.50/20"
                  : "white"
              }
              shadow={isCurrent ? "md" : "sm"}
              position="relative"
              transition="all 0.2s ease"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            >
              {isCurrent && (
                <Badge
                  position="absolute"
                  top="-12px"
                  right="20px"
                  colorPalette="blue"
                  variant="solid"
                  size="sm"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  Active Plan
                </Badge>
              )}

              <Box>
                <Heading size="md" color="gray.900" fontWeight="800" mb={1}>
                  {plan.name}
                </Heading>
                <Text fontSize="xs" color="gray.500" mb={4} minH="34px">
                  {plan.text}
                </Text>

                <HStack align="baseline" gap={1} mb={4}>
                  <Text fontSize="2xl" fontWeight="900" color="gray.900">
                    {plan.price}
                  </Text>
                  {plan.amount > 0 && (
                    <Text fontSize="xs" color="gray.500">
                      / student cycle
                    </Text>
                  )}
                </HStack>

                <Box borderTop="1px solid" borderColor="gray.100" pt={4} mb={6}>
                  <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
                    Included Capabilities
                  </Text>
                  <VStack align="stretch" gap={2}>
                    {plan.desc.map((feat, idx) => (
                      <HStack key={idx} align="center" justify="flex-start" gap={2} w="full" textAlign="left">
                        <Icon as={IoIosCheckmarkCircle} color="#206CE1" boxSize={4} flexShrink={0} />
                        <Text
                          fontSize="xs"
                          color="gray.700"
                          lineHeight="1.3"
                          textAlign="left"
                          whiteSpace={{ base: "normal", md: "nowrap" }}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          title={feat}
                        >
                          {feat}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>

              <Button
                size="sm"
                w="full"
                borderRadius="xl"
                fontWeight="700"
                fontSize="xs"
                h="40px"
                disabled={isCurrent || isLoading}
                loading={isLoading && loadingPlanId === plan.id}
                onClick={() => handlePayment(plan)}
                bg={isCurrent ? "gray.100" : "#206CE1"}
                color={isCurrent ? "gray.600" : "white"}
                _hover={{
                  bg: isCurrent ? "gray.100" : "#1852B2",
                }}
              >
                {!isCurrent && plan.id !== "basic" && (
                  <PiShootingStarDuotone style={{ marginRight: "6px", fontSize: "1.1rem" }} />
                )}
                {getButtonLabel(plan)}
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
