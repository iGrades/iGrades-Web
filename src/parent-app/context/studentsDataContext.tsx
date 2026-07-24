import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";

// Define proper types
interface Student {
  id: string;
  firstname: string;
  lastname: string;
  grade_level: string;
  profile_image: string;
  school: string;
  class: string;
  // Add all other student fields needed
}

interface Alert {
  type: "success" | "error";
  message: string;
}

interface StudentsDataContextType {
  studentsData: Student[];
  loading: boolean;
  error: Error | null;
  alert: Alert | null;
  setStudentsData: Dispatch<SetStateAction<Student[]>>;
  getGraderDetails: () => Promise<void>;
  clearAlert: () => void;
}

// Create context 
const StudentsDataContext = createContext<StudentsDataContextType | undefined>(
  undefined
);

// Create provider component
export const StudentsDataProvider = ({ children }: { children: ReactNode }) => {
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);

  const clearAlert = () => setAlert(null);

  // fetch students details from database
  const getGraderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: students, error: supabaseError } = await supabase
        .from("students")
        .select("*");

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Ensure we always set an array, even if null
      setStudentsData(students ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch students";
      setError(new Error(message));
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGraderDetails();
  }, []);

  return (
    <StudentsDataContext.Provider
      value={{
        studentsData,
        loading,
        error,
        alert,
        setStudentsData,
        getGraderDetails,
        clearAlert,
      }}
    >
      {children}
    </StudentsDataContext.Provider>
  );
};

// Custom hook with proper type checking
export const useStudentsData = (): StudentsDataContextType => {
  const context = useContext(StudentsDataContext);
  if (!context) {
    throw new Error(
      "useStudentsData must be used within a StudentsDataProvider"
    );
  }
  return context;
};
