
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  getParentData: () => Promise<Parent[]>;
  logoutParent: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  parent: [],
  loading: true,
  getParentData: async () => [],
  logoutParent: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [parent, setParent] = useState<Parent[]>(() => {
    try {
      const cached = localStorage.getItem("authdParent");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const isLoggingOutRef = useRef(false);

  const getParentData = useCallback(async (): Promise<Parent[]> => {
    if (isLoggingOutRef.current) {
      return [];
    }

    try {
      setLoading(true);

      // Check auth user or active session
      let authUser: any = null;
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (!authError && userData?.user) {
          authUser = userData.user;
        } else {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            authUser = sessionData.session.user;
          }
        }
      } catch (authCheckErr) {
        console.warn("Auth check warning:", authCheckErr);
      }
      
      if (!authUser) {
        // Retain cached parent from localStorage if available so refreshing does not log the user out
        const cached = localStorage.getItem("authdParent");
        if (cached && !isLoggingOutRef.current) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setParent(parsed);
              return parsed;
            }
          } catch {
            // ignore invalid cache
          }
        }
        setUser(null);
        setParent([]);
        return [];
      }

      setUser(authUser);

      // Get parent data
      let { data: parents } = await supabase
        .from("parents")
        .select("*")
        .eq("user_id", authUser.id);

      if ((!parents || parents.length === 0) && authUser.email) {
        const { data: parentsByEmail } = await supabase
          .from("parents")
          .select("*")
          .eq("email", authUser.email);
        if (parentsByEmail && parentsByEmail.length > 0) {
          parents = parentsByEmail;
          // Optionally update user_id if null
          await supabase
            .from("parents")
            .update({ user_id: authUser.id })
            .eq("id", parentsByEmail[0].id)
            .is("user_id", null);
        }
      }

      const parentList = parents ? (Array.isArray(parents) ? parents : [parents]) : [];
      if (parentList.length > 0) {
        if (!isLoggingOutRef.current) {
          setParent(parentList);
          localStorage.setItem("authdParent", JSON.stringify(parentList));
        }
      } else {
        // Check if there's existing cached parent before clearing
        const cached = localStorage.getItem("authdParent");
        if (cached && !isLoggingOutRef.current) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setParent(parsed);
              return parsed;
            }
          } catch {
            // ignore
          }
        }
        if (!isLoggingOutRef.current) {
          setParent([]);
        }
      }
      return parentList;
    } catch {
      // On network failure or error, preserve cache if present
      const cached = localStorage.getItem("authdParent");
      if (cached && !isLoggingOutRef.current) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setParent(parsed);
            return parsed;
          }
        } catch {
          // ignore
        }
      }
      if (!isLoggingOutRef.current) {
        setUser(null);
        setParent([]);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const logoutParent = async (): Promise<void> => {
    isLoggingOutRef.current = true;
    setUser(null);
    setParent([]);
    localStorage.removeItem("authdParent");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Parent sign out error:", e);
    } finally {
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    getParentData();

    // Listen to Supabase auth events (e.g. login, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isLoggingOutRef.current) return;

      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await getParentData();
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setParent([]);
        localStorage.removeItem("authdParent");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [getParentData]);

  return (
    <UserContext.Provider value={{ user, parent, loading, getParentData, logoutParent }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
