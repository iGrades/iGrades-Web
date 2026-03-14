import type { RouteObject } from "react-router-dom";
import LandingPage from "@/pages/LandingPage/index";
import CMS from "@/pages/CMS";  
import AboutPage from "@/pages/AboutPage";
import DownloadPage from "@/pages/DownloadPage";
import ContactPage from "@/pages/ContactPage";
// import Home from "../parent-app/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Verify from "@/parent-app/auth/Verify";

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
    path: "/download",
    element: <DownloadPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/upload-content",
    element: <CMS />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },
];

export default publicRoutes;
