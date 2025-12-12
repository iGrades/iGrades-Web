import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type {
  SubscriptionPlan,
  PaymentResult,
  PaystackResponse,
} from "../types/paystack";

export const usePaystack = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
    const { authdStudent } = useAuthdStudentData();

  const loadPaystackScript = (): Promise<typeof window.PaystackPop> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve(window.PaystackPop);
      script.onerror = () =>
        reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  };

  const initializePayment = async (
    plan: SubscriptionPlan,
    userEmail: string | undefined = authdStudent?.email
  ): Promise<PaymentResult> => {
    // Handle free plan
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

    try {
      await loadPaystackScript();

      return new Promise((resolve) => {
        const handler = window.PaystackPop.setup({
          key:
            // process.env.REACT_APP_PAYSTACK_PUBLIC_KEY ||
            "pk_live_63315661de6ed0ff4deaee36c3ee29fdd2f95bbd",
          email: userEmail,
          amount: plan.amount,
          currency: "NGN",
          ref: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            custom_fields: [
              {
                display_name: "Plan Name",
                variable_name: "plan_name",
                value: plan.name,
              },
            ],
            plan_name: plan.name,
          },
          callback: (response: PaystackResponse) => {
            toaster.create({
              title: "Payment Successful!",
              description: `You have successfully subscribed to ${plan.name} plan.`,
              type: "success",
              duration: 5000,
              closable: true,
            });
            resolve({ success: true, response });
          },
          onClose: () => {
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

        handler.openIframe();
      });
    } catch (error) {
      console.error("Error initializing payment:", error);
      toaster.create({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        type: "error",
        duration: 5000,
        closable: true,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error("Unknown payment error"),
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { initializePayment, isLoading };
};
