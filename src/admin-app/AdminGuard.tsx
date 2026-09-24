import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { checkAndEnforceSessionExpiry, recordActivity } from "@/lib/authSessionManager";
import { Center } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import type { ReactNode } from "react";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // 1. Check 14-day inactivity
      const isValid = await checkAndEnforceSessionExpiry(supabase);
      if (!isValid) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // Check active Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // Verify they're in the admins table
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        recordActivity();
      }
      setIsAdmin(!!data);
      setChecking(false);
    };

    verify();
  }, []);

  if (checking) {
    return (
      <Center minH="100vh" bg="#f8fafc">
        <DancingLogoLoader size="lg" text="Verifying Admin Access..." />
      </Center>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default AdminGuard;