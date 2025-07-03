import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {ReactNode} from "react"
import type { Dispatch, SetStateAction } from "react";

interface StudentsDataContextType {
  studentsData: any[];
  setStudentsData: Dispatch<SetStateAction<any[]>>;
}

// Create context
const StudentsDataContext = createContext<StudentsDataContextType | undefined>(
  undefined
);

// Create provider component
export const StudentsDataProvider = ({ children }: { children: ReactNode }) => {
  const [studentsData, setStudentsData] = useState<any[]>([]);

  const getGraderDetails = async () => {
    const { data: students, error } = await supabase
      .from("students")
      .select("*");

    if (error) {
      alert("Failed to fetch students");
      console.error(error);
    }

    setStudentsData(students ?? []);
  };
  useEffect(() => {
    // Initial fetch
    getGraderDetails();

    // Realtime subscription to INSERT and DELETE
    const channel = supabase
      .channel("students_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        (payload) => {
          console.log("Change received!", payload);
          getGraderDetails(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up on unmount
    };
  }, []);

  return (
    <StudentsDataContext.Provider value={{ studentsData, setStudentsData }}>
      {children}
    </StudentsDataContext.Provider>
  );
};

// Custom hook for easy access
export const useStudentsData = () => {
  const context = useContext(StudentsDataContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
