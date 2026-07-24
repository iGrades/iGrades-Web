import type { RouteObject } from "react-router-dom";
import Home from "@/student-app/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/student-app/auth/Verify";
import CourseSelectionPage from "@/student-app/pages/CourseSelectionPage";

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
  // Fallback for old URLs without student name
  {
    path: "/student-dashboard",
    element: <Home />,
  },
  // Other routes
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/verify-student",
    element: <Verify />,
  },
  {
    path: "/course-selection",
    element: <CourseSelectionPage />,
  },
  // Redirect root to student dashboard
  {
    path: "/",
    element: <Home />,
  },
];

export default studentRoutes;