import { Box, Flex } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useState, useEffect } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./layouts/dashboard";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Popover from "./modals/popover";
import Homepage from "./pages/Homepage";
import QuizPage from "./pages/QuizPage";
import LearnPage from "./pages/LearnPage";
import SettingsPage from "./pages/SettingsPage";

const Home = () => {
  const currentPage = useNavigationStore((state) => state.currentStudentPage);
  const setCurrentPage = useNavigationStore(
    (state) => state.setCurrentStudentPage
  );
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const [showNavBar, setShowNavBar] = useState<boolean>(true);
  const { authdStudent, logoutFunc, isPopOver, setIsPopOver  } = useAuthdStudentData();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to create URL-friendly names
  const createUrlFriendlyName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // Get the student's full name from firstname and lastname
  const getStudentFullName = () => {
    if (!authdStudent) return null;

    const { firstname, lastname } = authdStudent;

    if (firstname && lastname) {
      return `${firstname} ${lastname}`.trim();
    } else if (firstname) {
      return firstname.trim();
    } else if (lastname) {
      return lastname.trim();
    }

    return null;
  };

  // Initialize page from URL on component mount
  // Define the StudentPage type if not already imported
  type StudentPage = "home" | "quiz" | "learn" | "settings";

  useEffect(() => {
    const pageMap: Record<string, StudentPage> = {
      "": "home",
      quizzes: "quiz",
      learning: "learn",
      settings: "settings",
    };

    const currentPath = location.pathname;
    const pathParts = currentPath.split("/");
    const urlPage = pathParts[pathParts.length - 1] || "";

    const mappedPage: StudentPage = pageMap[urlPage] || "home";
    if (mappedPage !== currentPage) {
      setCurrentPage(mappedPage);
    }
  }, []); // only run on mount

  // Update URL only when page changes (not from URL updates)
  useEffect(() => {
    if (authdStudent) {
      const studentFullName = getStudentFullName();

      if (studentFullName) {
        const urlFriendlyName = createUrlFriendlyName(studentFullName);
        document.title = `${studentFullName} - Student Dashboard`;

        // map current page to URL path
        const pageMap: Record<string, string> = {
          home: "",
          quiz: "quizzes",
          learn: "learning",
          settings: "settings",
        };

        const pagePath = pageMap[currentPage] || "";
        const expectedPath = `/student-dashboard/${urlFriendlyName}${
          pagePath ? "/" + pagePath : ""
        }`;

        // Only navigate if we're not already on this path
        const currentPath = location.pathname;
        if (currentPath !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }
      }
    }
  }, [currentPage, authdStudent, navigate, location.pathname]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Homepage />;
      case "quiz":
        return (
          <QuizPage showSideBar={showSideBar} setShowSideBar={setShowSideBar} showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
        );
      case "learn":
        return <LearnPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Homepage />;
    }
  };

  return (
<>
  <Box
    as="main"
    display="flex"
    flexDirection="column"
    minH="100vh"
    maxH="100vh"
    overflow="hidden"
    bg="textFieldColor"
  >
   {showNavBar &&  <Navbar />}
    <Flex flex="1" overflow="hidden">
      {showSideBar && (
        <Box
          position="relative"
          flexShrink={0}
          w={{ base: "0%", lg: "15%" }}
          overflowY="auto"
        >
          <Sidebar />
        </Box>
      )}

      <Box
        flex="1"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          MsOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Dashboard renderPage={renderPage} />
      </Box>
    </Flex>
  </Box>
  {isPopOver && (
    // <LogoutPopover setShowLogoutModal={setShowLogoutModal} />
    <Popover
      head="Logout Student Request"
      info="  You have clicked the button to logout. All sessions and cookies will be lost"
      firstBtnText="Yes! logout"
      secondBtnText="Cancel"
      clickFunc={logoutFunc}
      setIsPopOver={setIsPopOver}
    />
  )}
</>
  );
};

export default Home;