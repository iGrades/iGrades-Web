import { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  parent_id?: string | null;
  registered_courses?: string[] | string | null;
  [key: string]: any;
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
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedStudent: Student | null;
}

// Create context 
const StudentsDataContext = createContext<StudentsDataContextType | undefined>(
  undefined
);

// Create provider component
export const StudentsDataProvider = ({ children }: { children: ReactNode }) => {
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("parent_selected_student_id") || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);

  const setSelectedStudentId = useCallback((id: string | null) => {
    setSelectedStudentIdState(id);
    try {
      if (id) {
        localStorage.setItem("parent_selected_student_id", id);
      } else {
        localStorage.removeItem("parent_selected_student_id");
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // Keep selectedStudent in sync
  useEffect(() => {
    if (studentsData.length > 0) {
      if (!selectedStudentId || !studentsData.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsData[0].id);
      }
    }
  }, [studentsData, selectedStudentId, setSelectedStudentId]);

  const selectedStudent =
    studentsData.find((s) => s.id === selectedStudentId) || (studentsData[0] ?? null);

  const clearAlert = () => setAlert(null);

  // fetch students details from database for THIS SPECIFIC PARENT ONLY
  const getGraderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setStudentsData([]);
        return;
      }

      // 2. Resolve parent ID from parents table
      let parentRows: Array<{ id: string }> = [];

      const { data: parentsByUserId } = await supabase
        .from("parents")
        .select("id")
        .eq("user_id", user.id);

      if (parentsByUserId && parentsByUserId.length > 0) {
        parentRows = parentsByUserId;
      } else if (user.email) {
        const { data: parentsByEmail } = await supabase
          .from("parents")
          .select("id")
          .eq("email", user.email);
        if (parentsByEmail && parentsByEmail.length > 0) {
          parentRows = parentsByEmail;
        }
      }

      // Collect all candidate parent IDs (table id + auth user id)
      const parentIds = Array.from(
        new Set([
          ...parentRows.map((p) => p.id),
          user.id,
        ])
      ).filter(Boolean);

      if (parentIds.length === 0) {
        setStudentsData([]);
        return;
      }

      // 3. Query ONLY students connected to this parent
      const { data: students, error: supabaseError } = await supabase
        .from("students")
        .select("*")
        .in("parent_id", parentIds)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(new Error(supabaseError.message));
        setStudentsData([]);
        return;
      }

      // Ensure we always set an array, even if null
      setStudentsData(students ?? []);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getGraderDetails();

    // Listen to auth changes so parent log in/out immediately updates children list
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getGraderDetails();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getGraderDetails]);

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
        selectedStudentId,
        setSelectedStudentId,
        selectedStudent,
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

