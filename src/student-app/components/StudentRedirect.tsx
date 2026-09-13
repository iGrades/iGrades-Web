import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "@/store/usenavigationStore";

interface StudentRedirectProps {
  targetPage: "learn" | "quiz" | "home" | "rewards" | "settings";
  targetTab?: string;
}

const StudentRedirect = ({ targetPage, targetTab }: StudentRedirectProps) => {
  const navigate = useNavigate();
  const setCurrentStudentPage = useNavigationStore((s) => s.setCurrentStudentPage);
  const setStudentSettingsTab = useNavigationStore((s) => s.setStudentSettingsTab);

  useEffect(() => {
    setCurrentStudentPage(targetPage);
    if (targetTab) {
      setStudentSettingsTab(targetTab);
    }
    navigate("/student-dashboard", { replace: true });
  }, [targetPage, targetTab, navigate, setCurrentStudentPage, setStudentSettingsTab]);

  return null;
};

export default StudentRedirect;
