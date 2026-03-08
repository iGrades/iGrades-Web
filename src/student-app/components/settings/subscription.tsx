import React from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Heading,
  Icon,
  Text,
  Flex,
  Button,
} from "@chakra-ui/react";
// import { toaster } from "@/components/ui/toaster";
// import { GiPriceTag } from "react-icons/gi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { usePaystack } from "@/hooks/usePaystack";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { SubscriptionPlan } from "@/types/paystack";

const Subscription: React.FC = () => {
  const { initializePayment, isLoading } = usePaystack();
  const { authdStudent } = useAuthdStudentData();

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
        "Introductory academic resources"
      ],
    },
    {
      id: "standard",
      name: "Standard",
      text: "Perfect for regular learners seeking more features.",
      price: "₦15,000",
      amount: 1500000, // 15,000 Naira in kobo
      desc: [
        // "All Basic Features Inclusive",
       "Comprehensive Learning Experience",
       "Full access to all PDF materials",
       "Complete video lesson library",
       "Access to scheduled live group sessions",
       "Mock quizzes with performance tracking",
       "Structured academic progression support"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      text: "Best for dedicated learners wanting full experience.",
      price: "₦25,000",
      amount: 2500000, // 25,000 Naira in kobo
      desc: [
        // "All Standard Features Inclusive",
      "Advanced & Personalized Learning",
      "Everything in the Standard Plan",
      "Priority access to live sessions",
      "Advanced mock examinations with feedback",
      "Personalized academic guidance",
      "Early access to new learning resources"
      ],
    },
  ];

  
  const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
    const userEmail = authdStudent?.email; 
    
    // 1. Trigger Paystack UI
    const result = await initializePayment(plan, userEmail);
  
    // 2. If Paystack returns success OR if it's the free plan
    if (result.success) {
      try {
        // Update Supabase
        const { error } = await supabase
          .from("students") 
          .update({ 
            subscription_plan: plan.id,
            subscription_status: "active",
            last_payment_ref: result.response?.reference || "free_plan"
          })
          .eq("id", authdStudent?.id); 
  
        if (error) throw error;
  
        // Success UI logic
        console.log("Database updated successfully!");
        
      } catch (err) {
        console.error("Error updating subscription:", err);
        // Show an error toast here
      }
    }
  };

  return (
    <Box
      bg="white"
      rounded="md"
      shadow="sm"
      p={4}
      mb={10}
      h={{ base: "auto", md: "75vh" }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-around"
        align="center"
        gap={5}
        mt={10}
      >
        {subscriptionPlans.map((plan) => (
          <Box
            key={plan.id}
            border="1px"
            borderColor="gray.200"
            p={4}
            rounded="xl"
            shadow='sm'
            textAlign="center"
            w={{ base: "100%", md: '40%', lg: "30%" }}
          >
            <Heading color="on_backgroundColor" my={1}>
              {plan.name}
            </Heading>
            <Text fontSize="xs" color="fieldTextColor">
              {plan.text}
            </Text>
            <Heading my={4} fontSize="2xl" color="on_backgroundColor">
              {plan.price}
            </Heading>
            <Button
              w="full"
              my={2}
              p={4}
              bg="primaryColor"
              color="on_primaryColor"
              rounded="xl"
              onClick={() => handlePayment(plan)}
              loading={isLoading && plan.id !== "basic"}
              loadingText="Processing..."
              disabled={isLoading}
              _hover={{
                bg: "primaryColor",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
            >
              {plan.id === "basic" ? "Get Started Free" : `Get ${plan.name}`}
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
                <Icon as={IoIosCheckmarkCircle} color="green.500" boxSize={4} />
                <Text fontSize="xs" color="gray.500">
                  {feature}
                </Text>
              </Flex>
            ))}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Subscription;