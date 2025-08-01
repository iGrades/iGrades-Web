import type { RouteObject } from "react-router-dom";
import Home from "@/student-app/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/pages/Verify";

const studentRoutes: RouteObject[] = [
  {
    path: "/student-dashboard",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },
];

export default studentRoutes
