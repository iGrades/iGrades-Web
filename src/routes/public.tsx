import type { RouteObject } from "react-router-dom";
import LandingPage from "@/pages/LandingPage/index";
import Home from "../parent-app/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/parent-app/auth/Verify";

const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
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
