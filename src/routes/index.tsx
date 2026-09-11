import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import publicRoutes from "./public";
import studentRoutes from "./student";
import parentRoutes from "./parent";
import adminRoutes from "./admin";

const routes: RouteObject[] = [
  ...publicRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...adminRoutes,
  // Fallbacks for common aliases and catch-all to avoid blank screen
  {
    path: "/dashboard",
    element: <Navigate to="/student-dashboard" replace />,
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/parent",
    element: <Navigate to="/parent-dashboard" replace />,
  },
  {
    path: "/pqs",
    element: <Navigate to="/student/learn" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
