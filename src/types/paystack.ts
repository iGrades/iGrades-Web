export interface SubscriptionPlan {
  id: string;
  name: string;
  text: string;
  price: string;
  amount: number;
  desc: string[];
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    plan_name?: string;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  message: string;
  reference: string;
  status: string;
  transaction: string;
  trxref: string;
}

export interface PaymentResult {
  success: boolean;
  response?: PaystackResponse;
  error?: Error;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}
