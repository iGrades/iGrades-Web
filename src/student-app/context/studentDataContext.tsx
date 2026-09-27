import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabaseClient";
import { recordActivity, clearAllLocalSessionData } from "@/lib/authSessionManager";

interface Student {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  grade_level: string;
  profile_image: string;
  school: string;
  class: string;
  registered_courses?: string[];
  active_classes?: string;
  is_child: boolean | null;
  subscription: string;           // add this
  subscription_status: string;    // add this
  last_payment_ref: string | null; // add this
  state?: string;
  lga?: string;
  ctiy?: string;
  street_address?: string;
}

interface Alert {
  type: "success" | "error";
  message: string;
}

interface AuthdStudentDataContextType {
  authdStudent: Student | null;
  loading: boolean;
  fetchError: string | null;
  alert: Alert | null;
  setAuthdStudent: Dispatch<SetStateAction<Student | null>>;
  clearAlert: () => void;
  logoutFunc: () => void;
  isPopOver?: boolean;
  setIsPopOver?: Dispatch<SetStateAction<boolean>>;
  refreshStudentData: () => Promise<void>;
}

const AuthdStudentDataContext = createContext<
  AuthdStudentDataContextType | undefined
>(undefined);

export const AuthdStudentDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [authdStudent, setAuthdStudent] = useState<Student | null>(() => {
    try {
      const storedStudent = localStorage.getItem("authdStudent");
      return storedStudent ? JSON.parse(storedStudent) : null;
    } catch {
      return null;
    }
  });
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isPopOver, setIsPopOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!authdStudent);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (authdStudent) {
      localStorage.setItem("authdStudent", JSON.stringify(authdStudent));
      recordActivity();
    }
  }, [authdStudent]);

  useEffect(() => {
    if (!authdStudent) {
      const syncSession = async () => {
        try {
          setLoading(true);
          setFetchError(null);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const { data, error } = await supabase
              .from("students")
              .select("*")
              .eq("email", session.user.email)
              .maybeSingle();
            if (error) {
              setFetchError(error.message);
            } else if (data) {
              setAuthdStudent(data);
              localStorage.setItem("authdStudent", JSON.stringify(data));
            }
          }
        } catch (err: any) {
          console.warn("Notice syncing student session:", err);
          setFetchError(err?.message || "Failed to sync student session");
        } finally {
          setLoading(false);
        }
      };
      syncSession();
    } else {
      setLoading(false);
    }
  }, [authdStudent]);

  const refreshStudentData = async (): Promise<void> => {
    // Guard: can't refresh if we don't know who the student is
    if (!authdStudent?.id) return;

    try {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", authdStudent.id)  // use the id already in state
        .single();

      if (error) {
        console.warn("Notice refreshing student data:", error?.message || error);
        setFetchError(error.message);
        return;
      }

      if (data) {
        setAuthdStudent(data); // updates state + triggers localStorage sync via useEffect
      }
    } catch (err: any) {
      setFetchError(err?.message || "Failed to refresh student profile");
    } finally {
      setLoading(false);
    }
  };

  const logoutFunc = () => {
    setAuthdStudent(null);
    clearAllLocalSessionData();
    setIsPopOver(false);
    setAlert({ type: "success", message: "Logged out successfully." });
    supabase.auth.signOut().catch(() => {});
  };

  const clearAlert = () => setAlert(null);

  return (
    <AuthdStudentDataContext.Provider
      value={{
        authdStudent,
        loading,
        fetchError,
        setAuthdStudent,
        alert,
        clearAlert,
        logoutFunc,
        isPopOver,
        setIsPopOver,
        refreshStudentData,
      }}
    >
      {children}
    </AuthdStudentDataContext.Provider>
  );
};

export function useAuthdStudentData(): AuthdStudentDataContextType {
  const context = useContext(AuthdStudentDataContext);
  if (!context) {
    throw new Error(
      "useAuthdStudentData must be used within a AuthdStudentDataProvider"
    );
  }
  return context;
}