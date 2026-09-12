import type { RouteObject } from "react-router-dom";
import LandingPage from "@/pages/LandingPage/index";

import AboutPage from "@/pages/AboutPage";
import DownloadPage from "@/pages/DownloadPage";
import ContactPage from "@/pages/ContactPage";
import Pricing from "@/pages/PricingPage";
// import Home from "../parent-app/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/parent-app/auth/Verify";
import AuthCallback from "@/pages/AuthCallback";
import UpcomingPage from "@/pages/UpcomingPage";
import PrivacyPolicy from "@/pages/PrivacyPolicyPage";
import TermsOfService from "@/pages/TermsOfServicePage";

const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
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
  {
    path: "/upcoming",
    element: <UpcomingPage />,
  },
  {
    path: "/start-a-class",
    element: <UpcomingPage />,
  },
  {
    path: "/download",
    element: <DownloadPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
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
