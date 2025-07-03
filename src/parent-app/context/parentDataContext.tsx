// src/context/UserContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UserContextType = {
  user: any;
  parent: any[];
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  parent: [],
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [parent, setParent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      let { data: parent, error } = await supabase.from("parents").select("*");
      if (parent) setParent(parent);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, parent, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
