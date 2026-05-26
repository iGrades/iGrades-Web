// export interface SubscriptionPlan {
//   id: string;
//   name: string;
//   text: string;
//   price: string;
//   amount: number;
//   desc: string[];
// }

// export interface PaystackConfig {
//   key: string;
//   email: string;
//   amount: number;
//   currency: string;
//   ref: string;
//   metadata?: {
//     custom_fields?: Array<{
//       display_name: string;
//       variable_name: string;
//       value: string;
//     }>;
//     plan_name?: string;
//   };
//   callback?: (response: PaystackResponse) => void;
//   onClose?: () => void;
// }

// export interface PaystackResponse {
//   message: string;
//   reference: string;
//   status: string;
//   transaction: string;
//   trxref: string;
// }

// export interface PaymentResult {
//   success: boolean;
//   response?: PaystackResponse;
//   error?: Error;
// }

// declare global {
//   interface Window {
//     PaystackPop: {
//       setup: (config: PaystackConfig) => {
//         openIframe: () => void;
//       };
//     };
//   }
// }
// 
// 
// 


// ─── Subscription Plan (unchanged) ───────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  text: string;
  price: string;
  amount: number; 
  desc: string[];
}

// ─── Flutterwave Config ───────────────────────────────────────────────────────

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    name?: string;
  };
  meta?: Record<string, string>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

// ─── Flutterwave Response ─────────────────────────────────────────────────────

export interface FlutterwaveResponse {
  status: string;           // "successful" | "cancelled" | "failed"
  transaction_id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
  };
}

// ─── Payment Result ───────────────────────────────────────────────────────────

export interface PaymentResult {
  success: boolean;
  response?: FlutterwaveResponse;
  error?: Error;
}

// ─── Global Window Declaration ────────────────────────────────────────────────

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}
