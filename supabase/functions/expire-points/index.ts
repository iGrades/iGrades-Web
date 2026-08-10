// supabase/functions/expire-points/index.ts
// Scheduled Supabase Edge Function to process rolling 12-month points expiry.
// Inserts auditable negative 'expiry' entries in points_transactions for points past expires_at.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const nowIso = new Date().toISOString();

    // 1. Fetch expired earning rows that haven't been processed yet
    const { data: expiredEarns, error: fetchErr } = await supabaseAdmin
      .from("points_transactions")
      .select("id, student_id, points, expires_at, created_at")
      .not("expires_at", "is", null)
      .lte("expires_at", nowIso)
      .gt("points", 0);

    if (fetchErr) {
      throw fetchErr;
    }

    if (!expiredEarns || expiredEarns.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed_count: 0, message: "No expired points found." }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Group expired earnings by student_id
    const studentExpiredMap: Record<string, { totalPoints: number; originalTxIds: string[] }> = {};

    for (const row of expiredEarns) {
      // Check if this specific earning row was already offset by an expiry transaction
      const { data: existingExpiry } = await supabaseAdmin
        .from("points_transactions")
        .select("id")
        .eq("student_id", row.student_id)
        .eq("type", "expiry")
        .contains("metadata", { original_earning_tx_id: row.id })
        .maybeSingle();

      if (!existingExpiry) {
        if (!studentExpiredMap[row.student_id]) {
          studentExpiredMap[row.student_id] = { totalPoints: 0, originalTxIds: [] };
        }
        studentExpiredMap[row.student_id].totalPoints += row.points;
        studentExpiredMap[row.student_id].originalTxIds.push(row.id);
      }
    }

    const insertedExpiries = [];

    for (const [studentId, details] of Object.entries(studentExpiredMap)) {
      if (details.totalPoints <= 0) continue;

      // Verify current active points balance before deducting to prevent negative balance
      const { data: currentBalance } = await supabaseAdmin.rpc("get_points_balance", {
        p_student_id: studentId,
      });

      const expireAmount = Math.min(details.totalPoints, currentBalance || details.totalPoints);

      if (expireAmount > 0) {
        for (const origTxId of details.originalTxIds) {
          const origRow = expiredEarns.find((r) => r.id === origTxId);
          if (!origRow) continue;

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("points_transactions")
            .insert({
              student_id: studentId,
              type: "expiry",
              points: -origRow.points,
              expires_at: null,
              metadata: {
                original_earning_tx_id: origRow.id,
                original_created_at: origRow.created_at,
                expired_at: nowIso,
                audit_note: "Rolling 12-month points expiry processed",
              },
            })
            .select()
            .single();

          if (!insErr && inserted) {
            insertedExpiries.push(inserted);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: insertedExpiries.length,
        expiries: insertedExpiries,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("expire-points error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
