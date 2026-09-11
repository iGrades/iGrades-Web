import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "@/store/usenavigationStore";

interface StudentRedirectProps {
  targetPage: "learn" | "quiz" | "home" | "rewards" | "settings";
}

const StudentRedirect = ({ targetPage }: StudentRedirectProps) => {
  const navigate = useNavigate();
  const setCurrentStudentPage = useNavigationStore((s) => s.setCurrentStudentPage);

  useEffect(() => {
    setCurrentStudentPage(targetPage);
    navigate("/student-dashboard", { replace: true });
  }, [targetPage, navigate, setCurrentStudentPage]);

  return null;
};

export default StudentRedirect;
