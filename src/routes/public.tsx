import type { RouteObject } from "react-router-dom";
import Home from "../parent-app/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Verify from "@/parent-app/auth/Verify";

const publicRoutes: RouteObject[] = [
  {
    path: "/",
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
    path: "/verify-parent",
    element: <Verify />,
  },
];

export default publicRoutes;
