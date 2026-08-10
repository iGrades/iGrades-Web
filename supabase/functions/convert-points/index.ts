// supabase/functions/convert-points/index.ts
// Supabase Edge Function to atomically convert iGrades points to Naira (₦) subscription credit.
// Enforces 100 points = ₦1,000 conversion rate and minimum 100 pts threshold.

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

    const { student_id, points_to_convert } = await req.json();
    const targetStudentId = callerStudentId || student_id;

    if (!targetStudentId) {
      return new Response(
        JSON.stringify({ error: "Missing valid student_id or authorization." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!points_to_convert || typeof points_to_convert !== "number") {
      return new Response(
        JSON.stringify({ error: "points_to_convert must be a positive integer." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 1. Business rule validation: Minimum 100 points
    if (points_to_convert < 100) {
      return new Response(
        JSON.stringify({ error: "Minimum 100 points required per conversion (minimum ₦1,000 credit)." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Business rule validation: Must be a multiple of 100
    if (points_to_convert % 100 !== 0) {
      return new Response(
        JSON.stringify({ error: "Points to convert must be in increments of 100 points." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Execute atomic conversion PostgreSQL function
    const { data: conversionResult, error: conversionError } = await supabaseAdmin.rpc(
      "fn_convert_points_to_credit",
      {
        p_student_id: targetStudentId,
        p_points_to_convert: points_to_convert,
      }
    );

    if (conversionError) {
      return new Response(
        JSON.stringify({ error: conversionError.message || "Points conversion failed." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(conversionResult),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("convert-points error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
