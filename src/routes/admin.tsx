import type { RouteObject } from "react-router-dom";
import AdminLogin from "@/admin-app/AdminLogin";
import AdminDashboard from "@/admin-app/AdminDashboard";
import AdminGuard from "@/admin-app/AdminGuard";

const adminRoutes: RouteObject[] = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminGuard>
        <AdminDashboard />
      </AdminGuard>
    ),
  },
];

export default adminRoutes;