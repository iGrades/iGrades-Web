import type { RouteObject } from "react-router-dom";
import publicRoutes from "./public";
import studentRoutes from "./student";
import parentRoutes from "./parent";
import adminRoutes from "./admin";

const routes: RouteObject[] = [
  ...publicRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...adminRoutes,
  // Add more route groups here
];

export default routes;
