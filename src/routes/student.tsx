import type { RouteObject } from "react-router-dom";
import Home from "@/student-app/Home";
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