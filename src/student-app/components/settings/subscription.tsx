// import React from "react";
// import { supabase } from "@/lib/supabaseClient";
// import {
//   Box,
//   Heading,
//   Icon,
//   Text,
//   Flex,
//   Button,
//   Badge,
// } from "@chakra-ui/react";
// import { toaster } from "@/components/ui/toaster";
// import { IoIosCheckmarkCircle } from "react-icons/io";
// import { usePaystack } from "@/hooks/useFlutterwave";
// import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
// import type { SubscriptionPlan } from "@/types/flutterwave";

// const Subscription: React.FC = () => {
//   const { initializePayment, isLoading, loadingPlanId } = usePaystack();
//   const { authdStudent, refreshStudentData } = useAuthdStudentData();

//   const subscriptionPlans: SubscriptionPlan[] = [
//     {
//       id: "basic",
//       name: "Basic",
//       text: "Ideal for beginners starting their learning journey.",
//       price: "Zero Fee",
//       amount: 0,
//       desc: [
//         "Foundational Access",
//         "Access to selected PDF learning materials",
//         "Access to limited video lessons",
//         "Basic student dashboard access",
//         "Introductory academic resources",
//       ],
//     },
//     {
//       id: "standard",
//       name: "Standard",
//       text: "Perfect for regular learners seeking more features.",
//       price: "₦15,000",
//       amount: 1500000,
//       desc: [
//         "Comprehensive Learning Experience",
//         "Full access to all PDF materials",
//         "Complete video lesson library",
//         "Access to scheduled live group sessions",
//         "Mock quizzes with performance tracking",
//         "Structured academic progression support",
//       ],
//     },
//     {
//       id: "premium",
//       name: "Premium",
//       text: "Best for dedicated learners wanting full experience.",
//       price: "₦25,000",
//       amount: 2500000,
//       desc: [
//         "Advanced & Personalized Learning",
//         "Everything in the Standard Plan",
//         "Priority access to live sessions",
//         "Advanced mock examinations with feedback",
//         "Personalized academic guidance",
//         "Early access to new learning resources",
//       ],
//     },
//   ];

//   const currentPlan = authdStudent?.subscription;

//   const handlePayment = async (plan: SubscriptionPlan): Promise<void> => {
//     // Guard: don't re-subscribe to the same plan
//     if (currentPlan === plan.id) return;

//     const userEmail = authdStudent?.email;

//     // 1. Trigger Paystack UI (or skip for free plan)
//     const result = await initializePayment(plan, userEmail);

//     // 2. If payment succeeded (or free plan selected)
//     if (result.success) {
//       try {
//         const { error } = await supabase
//           .from("students")
//           .update({
//             subscription: plan.id,                                        // existing column
//             subscription_status: "active",                                // new column (add via ALTER TABLE)
//             last_payment_ref: result.response?.reference || "free_plan",  // new column (add via ALTER TABLE)
//           })
//           .eq("id", authdStudent?.id);

//         if (error) throw error;

//         // 3. Refresh context so the rest of the app sees the new plan immediately
//         await refreshStudentData?.();

//         toaster.create({
//           title: "Subscription Updated!",
//           description: `You are now on the ${plan.name} plan.`,
//           type: "success",
//           duration: 4000,
//           closable: true,
//         });
//       } catch (err) {
//         console.error("Error updating subscription in database:", err);
//         toaster.create({
//           title: "Database Error",
//           description:
//             "Payment was received but we could not update your subscription. Please contact support.",
//           type: "error",
//           duration: 7000,
//           closable: true,
//         });
//       }
//     }
//   };

//   const getButtonLabel = (plan: SubscriptionPlan): string => {
//     if (currentPlan === plan.id) return "Current Plan";
//     if (plan.id === "basic") return "Get Started Free";
//     return `Get ${plan.name}`;
//   };

//   return (
//     <Box
//       bg="white"
//       rounded="md"
//       shadow="sm"
//       p={4}
//       mb={10}
//       h={{ base: "auto", md: "75vh" }}
//     >
//       <Flex
//         direction={{ base: "column", md: "row" }}
//         justify="space-around"
//         align="center"
//         gap={5}
//         mt={10}
//       >
//         {subscriptionPlans.map((plan) => {
//           const isCurrentPlan = currentPlan === plan.id;
//           const isPlanLoading = isLoading && loadingPlanId === plan.id;

//           return (
//             <Box
//               key={plan.id}
//               border="1px"
//               borderColor={isCurrentPlan ? "primaryColor" : "gray.200"}
//               p={4}
//               rounded="xl"
//               shadow="sm"
//               textAlign="center"
//               w={{ base: "100%", md: "40%", lg: "30%" }}
//               position="relative"
//             >
//               {/* "Active" badge for current plan */}
//               {isCurrentPlan && (
//                 <Badge
//                   position="absolute"
//                   top="-3"
//                   left="50%"
//                   transform="translateX(-50%)"
//                   colorScheme="green"
//                   variant="solid"
//                   rounded="full"
//                   px={3}
//                   fontSize="xs"
//                 >
//                   Active Plan
//                 </Badge>
//               )}

//               <Heading color="on_backgroundColor" my={1}>
//                 {plan.name}
//               </Heading>
//               <Text fontSize="xs" color="fieldTextColor">
//                 {plan.text}
//               </Text>
//               <Heading my={4} fontSize="2xl" color="on_backgroundColor">
//                 {plan.price}
//               </Heading>

//               <Button
//                 w="full"
//                 my={2}
//                 p={4}
//                 bg={isCurrentPlan ? "gray.100" : "primaryColor"}
//                 color={isCurrentPlan ? "gray.500" : "on_primaryColor"}
//                 rounded="xl"
//                 onClick={() => handlePayment(plan)}
//                 loading={isPlanLoading}
//                 loadingText="Processing..."
//                 disabled={isLoading || isCurrentPlan}
//                 _hover={
//                   isCurrentPlan
//                     ? {}
//                     : {
//                         bg: "primaryColor",
//                         transform: "translateY(-2px)",
//                         shadow: "lg",
//                       }
//                 }
//                 transition="all 0.2s"
//               >
//                 {getButtonLabel(plan)}
//               </Button>

//               <Text
//                 textAlign="left"
//                 mt={4}
//                 fontSize="xs"
//                 fontWeight="semibold"
//                 color="gray.500"
//               >
//                 {plan.name} plan for all users
//               </Text>

//               {plan.desc.map((feature, index) => (
//                 <Flex align="center" key={index} gap={2} mt={2}>
//                   <Icon
//                     as={IoIosCheckmarkCircle}
//                     color="green.500"
//                     boxSize={4}
//                   />
//                   <Text fontSize="xs" color="gray.500">
//                     {feature}
//                   </Text>
//                 </Flex>
//               ))}
//             </Box>
//           );
//         })}
//       </Flex>
//     </Box>
//   );
// };

// export default Subscription;
// 
// 


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
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useFlutterwave } from "@/hooks/useFlutterwave";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { SubscriptionPlan } from "@/types/flutterwave";

const Subscription: React.FC = () => {
  const { initializePayment, isLoading, loadingPlanId } = useFlutterwave();
  const { authdStudent, refreshStudentData } = useAuthdStudentData();

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
      price: "₦15000",
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

    // 1. Trigger Flutterwave UI (or skip for free plan)
    const result = await initializePayment(plan, userEmail);

    // 2. If payment succeeded (or free plan selected)
    if (result.success) {
      try {
        const { error } = await supabase
          .from("students")
          .update({
            subscription: plan.id,
            subscription_status: "active",
            // Flutterwave uses tx_ref and flw_ref instead of Paystack's reference
            last_payment_ref: result.response?.tx_ref || "free_plan",
          })
          .eq("id", authdStudent?.id);

        if (error) throw error;

        await refreshStudentData?.();

        toaster.create({
          title: "Subscription Updated!",
          description: `You are now on the ${plan.name} plan.`,
          type: "success",
          duration: 4000,
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
      h={{ base: "auto", md: "75vh" }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-around"
        align="center"
        gap={5}
        mt={10}
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
              <Heading my={4} fontSize="2xl" color="on_backgroundColor">
                {plan.price}
              </Heading>

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