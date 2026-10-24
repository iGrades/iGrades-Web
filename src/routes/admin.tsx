import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import AdminGuard from "@/admin-app/AdminGuard";

// Code splitting & lazy loading for heavy admin sections
const AdminLogin = lazy(() => import("@/admin-app/AdminLogin"));
const AdminDashboard = lazy(() => import("@/admin-app/AdminDashboard"));
const CMS = lazy(() => import("@/admin-app/CMS"));

const AdminLoadingFallback = () => (
  <Center minH="100vh" bg="#0f172a">
    <DancingLogoLoader size="lg" text="Loading Administrative Portal..." />
  </Center>
);

const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      // Security boundary: AdminGuard enforces authentication & admin role check independently of code splitting
      <AdminGuard>
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      </AdminGuard>
    ),
  },
  {
    path: "/admin/content-management",
    element: (
      // Security boundary: AdminGuard protects CMS content management route independently of code splitting
      <AdminGuard>
        <Suspense fallback={<AdminLoadingFallback />}>
          <CMS />
        </Suspense>
      </AdminGuard>
    ),
  },
];

export default adminRoutes;