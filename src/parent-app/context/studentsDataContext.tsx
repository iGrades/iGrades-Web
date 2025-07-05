import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Alert } from "@chakra-ui/react";

interface StudentsDataContextType {
  studentsData: any[];
  setStudentsData: Dispatch<SetStateAction<any[]>>;
  getGraderDetails: () => Promise<void>;
}

// Create context
const StudentsDataContext = createContext<StudentsDataContextType | undefined>(
  undefined
);

// Create provider component
export const StudentsDataProvider = ({ children }: { children: ReactNode }) => {
  const [studentsData, setStudentsData] = useState<any[]>([]);
   const [alert, setAlert] = useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

  const getGraderDetails = async () => {
    const { data: students, error } = await supabase
      .from("students")
      .select("*");

    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
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
    <StudentsDataContext.Provider
      value={{ studentsData, setStudentsData, getGraderDetails }}
    >
      {alert && (
        <Alert.Root status={alert.type} variant="subtle" mt={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {alert.type === "error" ? "Error!" : "Success!"}
            </Alert.Title>
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
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
