import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; admin?: Admin }> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign in via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError || !authData.user) {
        setError("Invalid email or password.");
        return { success: false };
      }

      // 2. Check that this auth user exists in the admins table
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        // Valid Supabase Auth user but NOT an admin — sign them out immediately
        await supabase.auth.signOut();
        setError("You do not have admin access.");
        return { success: false };
      }

      // 3. Persist admin info to sessionStorage
      sessionStorage.setItem("admin", JSON.stringify(adminData));
      return { success: true, admin: adminData };

    } catch {
      setError("Something went wrong. Please try again.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("admin");
    window.location.assign("/admin/login");
  };

  const getAdmin = (): Admin | null => {
    const stored = sessionStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  };

  return { loginAdmin, logoutAdmin, getAdmin, isLoading, error };
};