import type { RouteObject } from "react-router-dom";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Home from "@/parent-app/Home";
import Verify from "@/parent-app/auth/Verify";

const parentRoutes: RouteObject[] = [
  // dynamic routes for parent dashboard with names
  { 
    path: "/parent-dashboard/:parentName", 
    element: <Home /> 
  },
  { 
    path: "/parent-dashboard/:parentName/:page", 
    element: <Home /> 
  },
   // Fallback for old URLs without parent name
  { 
    path: "/parent-dashboard/", 
    element: <Home /> 
  },
  
  // other routes
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
  
  // redirect to root for parent dashboard
  {
    path: "/",
    element: <Home />,
  },
];

export default parentRoutes;