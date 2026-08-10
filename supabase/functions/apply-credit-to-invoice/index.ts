// supabase/functions/apply-credit-to-invoice/index.ts
// Supabase Edge Function to apply available ₦ store credit balance against subscription invoices at checkout/billing.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    let callerStudentId: string | null = null;

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        callerStudentId = user.id;
      }
    }

    const { student_id, invoice_id, invoice_amount_naira } = await req.json();
    const targetStudentId = callerStudentId || student_id;

    if (!targetStudentId || !invoice_id || !invoice_amount_naira) {
      return new Response(
        JSON.stringify({ error: "student_id, invoice_id, and invoice_amount_naira are required." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (typeof invoice_amount_naira !== "number" || invoice_amount_naira <= 0) {
      return new Response(
        JSON.stringify({ error: "invoice_amount_naira must be a positive number." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Call atomic PostgreSQL function to deduct available credit against invoice
    const { data: applyResult, error: applyError } = await supabaseAdmin.rpc(
      "fn_apply_credit_to_invoice",
      {
        p_student_id: targetStudentId,
        p_invoice_id: invoice_id,
        p_invoice_amount: invoice_amount_naira,
      }
    );

    if (applyError) {
      return new Response(
        JSON.stringify({ error: applyError.message || "Failed to apply credit to invoice." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(applyResult),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("apply-credit-to-invoice error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
