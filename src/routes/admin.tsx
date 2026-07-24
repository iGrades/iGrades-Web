import type { RouteObject } from "react-router-dom";
import AdminLogin from "@/admin-app/AdminLogin";
import AdminDashboard from "@/admin-app/AdminDashboard";
import AdminGuard from "@/admin-app/AdminGuard";
import CMS from "@/admin-app/CMS";  

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
  {
    path: "/admin/content-management",
    element: <CMS />,
  },
];

export default adminRoutes;