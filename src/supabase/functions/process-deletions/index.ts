// supabase/functions/process-deletions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  // Get pending deletions (older than 5 mins)
  const { data: pending, error } = await supabaseAdmin
    .from("parents")
    .select("user_id,id")
    .eq("status", "pending_deletion")
    .lt("deletion_requested_at", new Date(Date.now() - 300000).toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Process deletions
  const results = [];
  for (const user of pending) {
    try {
      await supabaseAdmin.auth.admin.deleteUser(user.user_id);
      await supabaseAdmin.from("parents").delete().eq("id", user.id);
      results.push(user.id);
    } catch (err) {
      console.error(`Failed to delete user ${user.user_id}:`, err);
    }
  }

  return new Response(
    JSON.stringify({
      processed: results.length,
      deleted_ids: results,
      timestamp: new Date().toISOString()
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});