import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MobileWelcomeExperience from "@/pages/MobileWelcomeExperience";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/parent-app/auth/Verify";
import AuthCallback from "@/pages/AuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicyPage";
import TermsOfService from "@/pages/TermsOfServicePage";

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
    element: <PrivacyPolicy />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
  {
    path: "/terms-of-use",
    element: <TermsOfService />,
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
