import type { RouteObject } from "react-router-dom";
import publicRoutes from "./public";
// import studentRoutes from "./student";

const routes: RouteObject[] = [
  ...publicRoutes,
//   ...studentRoutes,
  // Add more route groups here
];

export default routes;
