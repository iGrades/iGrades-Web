
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Parent = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  profile_image?: string;
  user_id: string;
};

type UserContextType = {
  user: any;
  parent: Parent[]; 
  loading: boolean;
  getParentData: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  parent: [],
  loading: true,
  getParentData: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [parent, setParent] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  const getParentData = async () => {
    try {
      setLoading(true);

      // Get auth user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      setUser(user);

      // Get parent data
      const { data: parents } = await supabase
        .from("parents")
        .select("*")
        .eq("user_id", user?.id);

      // Always set parent as array, even if empty or null
      setParent(parents ? (Array.isArray(parents) ? parents : [parents]) : []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setParent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParentData();
  }, []);

  return (
    <UserContext.Provider value={{ user, parent, loading, getParentData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
