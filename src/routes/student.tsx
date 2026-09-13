import type { RouteObject } from "react-router-dom";
import Home from "@/student-app/Home";
import Verify from "@/student-app/auth/Verify";
import CourseSelectionPage from "@/student-app/pages/CourseSelectionPage";
import StudentRedirect from "@/student-app/components/StudentRedirect";

const studentRoutes: RouteObject[] = [
  // dynamic routes for student dashboard with names
  {
    path: "/student-dashboard/:studentName",
    element: <Home />,
  },
  {
    path: "/student-dashboard/:studentName/:page",
    element: <Home />,
  },
  {
    path: "/student-dashboard/:studentName/:page/:subpage",
    element: <Home />,
  },
  // Fallback for old URLs without student name
  {
    path: "/student-dashboard",
    element: <Home />,
  },
  {
    path: "/student/learn",
    element: <StudentRedirect targetPage="learn" />,
  },
  {
    path: "/student/learning",
    element: <StudentRedirect targetPage="learn" />,
  },
  {
    path: "/student/quiz",
    element: <StudentRedirect targetPage="quiz" />,
  },
  {
    path: "/student/quizzes",
    element: <StudentRedirect targetPage="quiz" />,
  },
  {
    path: "/student/help",
    element: <StudentRedirect targetPage="settings" targetTab="help" />,
  },
  {
    path: "/student/faqs",
    element: <StudentRedirect targetPage="settings" targetTab="help" />,
  },
  {
    path: "/student/security",
    element: <StudentRedirect targetPage="settings" targetTab="security" />,
  },
  {
    path: "/student/profile",
    element: <StudentRedirect targetPage="settings" targetTab="profile" />,
  },
  {
    path: "/student/settings",
    element: <StudentRedirect targetPage="settings" />,
  },
  {
    path: "/student",
    element: <StudentRedirect targetPage="home" />,
  },
  {
    path: "/verify-student",
    element: <Verify />,
  },
  {
    path: "/course-selection",
    element: <CourseSelectionPage />,
  },
];

export default studentRoutes;