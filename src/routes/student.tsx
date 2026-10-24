import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import Home from "@/student-app/Home";
import StudentRedirect from "@/student-app/components/StudentRedirect";

const Verify = lazy(() => import("@/student-app/auth/Verify"));
const CourseSelectionPage = lazy(() => import("@/student-app/pages/CourseSelectionPage"));

const RouteLoadingFallback = () => (
  <Center minH="100vh" bg="#F4F7FB">
    <DancingLogoLoader size="md" />
  </Center>
);

const studentRoutes: RouteObject[] = [
  // dynamic routes for student dashboard with names
  {
    path: "/student-dashboard/:studentName",
    element: <Home />,
  },
  {
    path: "/student-dashboard/:studentName/:page",
    element: <Home />,
  },
  {
    path: "/student-dashboard/:studentName/:page/:subpage",
    element: <Home />,
  },
  // Fallback for old URLs without student name
  {
    path: "/student-dashboard",
    element: <Home />,
  },
  {
    path: "/student/learn",
    element: <StudentRedirect targetPage="learn" />,
  },
  {
    path: "/student/learning",
    element: <StudentRedirect targetPage="learn" />,
  },
  {
    path: "/student/quiz",
    element: <StudentRedirect targetPage="quiz" />,
  },
  {
    path: "/student/quizzes",
    element: <StudentRedirect targetPage="quiz" />,
  },
  {
    path: "/student/chat",
    element: <StudentRedirect targetPage="chat" />,
  },
  {
    path: "/student/spark",
    element: <StudentRedirect targetPage="chat" />,
  },
  {
    path: "/student/help",
    element: <StudentRedirect targetPage="settings" targetTab="help" />,
  },
  {
    path: "/student/faqs",
    element: <StudentRedirect targetPage="settings" targetTab="help" />,
  },
  {
    path: "/student/security",
    element: <StudentRedirect targetPage="settings" targetTab="security" />,
  },
  {
    path: "/student/profile",
    element: <StudentRedirect targetPage="settings" targetTab="profile" />,
  },
  {
    path: "/student/settings",
    element: <StudentRedirect targetPage="settings" />,
  },
  {
    path: "/student/subscription",
    element: <StudentRedirect targetPage="settings" targetTab="subscription" />,
  },
  {
    path: "/student",
    element: <StudentRedirect targetPage="home" />,
  },
  {
    path: "/verify-student",
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <Verify />
      </Suspense>
    ),
  },
  {
    path: "/course-selection",
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <CourseSelectionPage />
      </Suspense>
    ),
  },
];

export default studentRoutes;