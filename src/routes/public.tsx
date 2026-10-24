import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import MobileWelcomeExperience from "@/pages/MobileWelcomeExperience";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/parent-app/auth/Verify";
import AuthCallback from "@/pages/AuthCallback";

const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsOfService = lazy(() => import("@/pages/TermsOfServicePage"));

const LegalLoadingFallback = () => (
  <Center minH="100vh" bg="#F4F7FB">
    <DancingLogoLoader size="md" />
  </Center>
);

const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MobileWelcomeExperience />,
  },
  {
    path: "/welcome",
    element: <MobileWelcomeExperience />,
  },
  {
    path: "/onboarding",
    element: <MobileWelcomeExperience />,
  },
  // Seamless fallback redirects for old public marketing website paths
  {
    path: "/about",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/download",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/contact",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/pricing",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/upcoming",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/start-a-class",
    element: <Navigate to="/" replace />,
  },
  // Mobile legal policies
  {
    path: "/privacy-policy",
    element: (
      <Suspense fallback={<LegalLoadingFallback />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Suspense fallback={<LegalLoadingFallback />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "/terms-of-service",
    element: (
      <Suspense fallback={<LegalLoadingFallback />}>
        <TermsOfService />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    element: (
      <Suspense fallback={<LegalLoadingFallback />}>
        <TermsOfService />
      </Suspense>
    ),
  },
  {
    path: "/terms-of-use",
    element: (
      <Suspense fallback={<LegalLoadingFallback />}>
        <TermsOfService />
      </Suspense>
    ),
  },
  // Core authentication and registration
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/student-login",
    element: <Login initialType="student" />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
];

export default publicRoutes;
