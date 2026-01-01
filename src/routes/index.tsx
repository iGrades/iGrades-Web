import type { RouteObject } from "react-router-dom";
import publicRoutes from "./public";
import studentRoutes from "./student";
import parentRoutes from "./parent";

const routes: RouteObject[] = [
  ...publicRoutes,
  ...studentRoutes,
  ...parentRoutes,
  // Add more route groups here
];

export default routes;
