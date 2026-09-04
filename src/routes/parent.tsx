import type { RouteObject } from "react-router-dom";
import Home from "@/parent-app/Home";

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
    path: "/parent-dashboard", 
    element: <Home /> 
  },
  { 
    path: "/parent-dashboard/", 
    element: <Home /> 
  },
];

export default parentRoutes;