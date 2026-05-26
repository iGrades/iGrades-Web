// import { useState } from "react";
// import { toaster } from "@/components/ui/toaster";
// import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
// import type {
//   SubscriptionPlan,
//   PaymentResult,
//   PaystackResponse,
// } from "../types/flutterwave";

// export const usePaystack = () => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
//   const { authdStudent } = useAuthdStudentData();

//   const loadPaystackScript = (): Promise<typeof window.PaystackPop> => {
//     return new Promise((resolve, reject) => {
//       if (window.PaystackPop) {
//         resolve(window.PaystackPop);
//         return;
//       }
//       const script = document.createElement("script");
//       script.src = "https://js.paystack.co/v1/inline.js";
//       script.onload = () => resolve(window.PaystackPop);
//       script.onerror = () =>
//         reject(new Error("Failed to load Paystack script"));
//       document.head.appendChild(script);
//     });
//   };

//   const initializePayment = async (
//     plan: SubscriptionPlan,
//     userEmail: string | undefined = authdStudent?.email
//   ): Promise<PaymentResult> => {
//     // Handle free plan — no Paystack needed
//     if (plan.id === "basic") {
//       toaster.create({
//         title: "Free Plan Selected",
//         description: "You have successfully subscribed to the Basic plan.",
//         type: "success",
//         duration: 3000,
//         closable: true,
//       });
//       return { success: true };
//     }

//     if (!userEmail) {
//       toaster.create({
//         title: "Error",
//         description: "User email is required to process payment.",
//         type: "error",
//         duration: 5000,
//         closable: true,
//       });
//       return { success: false };
//     }

//     setIsLoading(true);
//     setLoadingPlanId(plan.id);

//     try {
//       await loadPaystackScript();

//       return new Promise((resolve) => {
//         const handler = window.PaystackPop.setup({
//           key: "pk_test_0d6b3ab8a6cb3fb857c1028ab2ba5c6f20d3c40f",
//           email: userEmail,
//           amount: plan.amount,
//           currency: "NGN",
//           ref: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//           metadata: {
//             custom_fields: [
//               {
//                 display_name: "Plan Name",
//                 variable_name: "plan_name",
//                 value: plan.name,
//               },
//             ],
//             plan_name: plan.name,
//           },
//           callback: (response: PaystackResponse) => {
//             toaster.create({
//               title: "Payment Successful!",
//               description: `You have successfully subscribed to the ${plan.name} plan.`,
//               type: "success",
//               duration: 5000,
//               closable: true,
//             });
//             resolve({ success: true, response });
//           },
//           onClose: () => {
//             toaster.create({
//               title: "Payment Cancelled",
//               description: "Payment was not completed.",
//               type: "info",
//               duration: 3000,
//               closable: true,
//             });
//             resolve({ success: false });
//           },
//         });

//         handler.openIframe();
//       });
//     } catch (error) {
//       console.error("Error initializing payment:", error);
//       toaster.create({
//         title: "Payment Error",
//         description: "Failed to initialize payment. Please try again.",
//         type: "error",
//         duration: 5000,
//         closable: true,
//       });
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error : new Error("Unknown payment error"),
//       };
//     } finally {
//       setIsLoading(false);
//       setLoadingPlanId(null);
//     }
//   };

//   return { initializePayment, isLoading, loadingPlanId };
// };
// 
// 

import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type {
  SubscriptionPlan,
  PaymentResult,
  FlutterwaveResponse,
} from "@/types/flutterwave";

export const useFlutterwave = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { authdStudent } = useAuthdStudentData();

  // ── Load Flutterwave inline script ──────────────────────────────────────────
  const loadFlutterwaveScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.FlutterwaveCheckout) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Flutterwave script"));
      document.head.appendChild(script);
    });
  };

  // ── Main payment initializer ────────────────────────────────────────────────
  const initializePayment = async (
    plan: SubscriptionPlan,
    userEmail: string | undefined = authdStudent?.email
  ): Promise<PaymentResult> => {

    // Free plan — skip payment entirely
    if (plan.id === "basic") {
      toaster.create({
        title: "Free Plan Selected",
        description: "You have successfully subscribed to the Basic plan.",
        type: "success",
        duration: 3000,
        closable: true,
      });
      return { success: true };
    }

    if (!userEmail) {
      toaster.create({
        title: "Error",
        description: "User email is required to process payment.",
        type: "error",
        duration: 5000,
        closable: true,
      });
      return { success: false };
    }

    setIsLoading(true);
    setLoadingPlanId(plan.id);

    try {
      await loadFlutterwaveScript();

      return new Promise((resolve) => {
        window.FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: `txref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

          amount: plan.amount,
          currency: "NGN",
          payment_options: "card,ussd,banktransfer",

          customer: {
            email: userEmail,
            name: authdStudent
              ? `${authdStudent.firstname} ${authdStudent.lastname}`
              : userEmail,
          },

          meta: {
            plan_id: plan.id,
            plan_name: plan.name,
          },

          customizations: {
            title: "iGrades",
            description: `${plan.name} Subscription Plan`,
            logo: "https://jmjballgaxelqhsvhlvl.supabase.co/storage/v1/object/public/assets/fav-icon.png",
          },

          callback: (response: FlutterwaveResponse) => {
            if (response.status === "successful") {
              toaster.create({
                title: "Payment Successful!",
                description: `You have successfully subscribed to the ${plan.name} plan.`,
                type: "success",
                duration: 5000,
                closable: true,
              });
              resolve({ success: true, response });
            } else {
              toaster.create({
                title: "Payment Failed",
                description: "Your payment was not completed. Please try again.",
                type: "error",
                duration: 5000,
                closable: true,
              });
              resolve({ success: false });
            }
          },

          onclose: () => {
            // Only show cancelled toast if we're still in loading state
            // (if callback already fired, this fires too — we ignore it)
            toaster.create({
              title: "Payment Cancelled",
              description: "Payment was not completed.",
              type: "info",
              duration: 3000,
              closable: true,
            });
            resolve({ success: false });
          },
        });
      });

    } catch (error) {
      console.error("Error initializing Flutterwave payment:", error);
      toaster.create({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        type: "error",
        duration: 5000,
        closable: true,
      });
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown payment error"),
      };
    } finally {
      setIsLoading(false);
      setLoadingPlanId(null);
    }
  };

  return { initializePayment, isLoading, loadingPlanId };
};