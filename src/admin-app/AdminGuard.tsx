import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Center, Spinner } from "@chakra-ui/react";
import type { ReactNode } from "react";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verify = async () => {
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

      setIsAdmin(!!data);
      setChecking(false);
    };

    verify();
  }, []);

  if (checking) {
    return (
      <Center minH="100vh">
        <Spinner color="primaryColor" size="lg" />
      </Center>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default AdminGuard;