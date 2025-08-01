import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  grade_level: string;
  profile_image: string;
  school: string;
  class: string;
}

interface Alert {
  type: "success" | "error";
  message: string;
}

interface AuthdStudentDataContextType {
  authdStudent: Student | null; // Changed to single student or null
  alert: Alert | null;
  setAuthdStudent: Dispatch<SetStateAction<Student | null>>;
  clearAlert: () => void;
}

const AuthdStudentDataContext = createContext<
  AuthdStudentDataContextType | undefined
>(undefined);

export const AuthdStudentDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Initialize state from localStorage if available
  const [authdStudent, setAuthdStudent] = useState<Student | null>(() => {
    const storedStudent = localStorage.getItem("authdStudent");
    return storedStudent ? JSON.parse(storedStudent) : null;
  });

  const [alert, setAlert] = useState<Alert | null>(null);

  // Update localStorage whenever authdStudent changes
  useEffect(() => {
    if (authdStudent) {
      localStorage.setItem("authdStudent", JSON.stringify(authdStudent));
    } else {
      localStorage.removeItem("authdStudent");
    }
  }, [authdStudent]);

  const clearAlert = () => setAlert(null);

  return (
    <AuthdStudentDataContext.Provider
      value={{ authdStudent, setAuthdStudent, alert, clearAlert }}
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
