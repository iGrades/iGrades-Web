import { useState, useEffect, useRef } from "react";
import { Flex } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useUser } from "@/parent-app/context/parentDataContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { checkAndEnforceSessionExpiry, recordActivity } from "@/lib/authSessionManager";
import Sidebar from "@/parent-app/components/sidebar";
import Homepage from "./pages/HomePage";
import Student from "./pages/StudentPage";
import Settings from "./pages/SettingsPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import { WeeklyReportPopupBanner } from "./components/intelligence/weeklyReport/WeeklyReportPopupBanner";
import DashboardLayout from "@/parent-app/dashboard";
import Navbar from "@/parent-app/components/navbar";
import LogoutPopover from "./components/logoutPopover";


const Home = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentPage = useNavigationStore((state) => state.currentParentPage);
  const setCurrentPage = useNavigationStore((state) => state.setCurrentParentPage);
  const parentSettingsTab = useNavigationStore((state) => state.parentSettingsTab);
  const setParentSettingsTab = useNavigationStore((state) => state.setParentSettingsTab);
  
  const { parent, getParentData } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyParentSession = async () => {
      // 1. Enforce 14-day inactivity policy
      const isValid = await checkAndEnforceSessionExpiry(supabase);
      if (!isValid) {
        return;
      }

      const cached = localStorage.getItem("authdParent");
      if (!cached) {
        navigate("/login", { replace: true });
        return;
      }

      recordActivity();

      if (!parent || parent.length === 0) {
        getParentData();
      }
    };

    verifyParentSession();
  }, [parent, getParentData, navigate]);
  
   // Function to create URL-friendly names
   function createUrlFriendlyName  (name: string)  {
     return name
       .toLowerCase()
       .replace(/\s+/g, "-")
       .replace(/[^a-z0-9-]/g, "");
   }

   //get the user's full name from firstname and lastname
  function getParentFullName() { 
    if (!parent || parent.length === 0) return null;
    const firstParent = parent[0]
    if (!firstParent) return null;
    
    const { firstname, lastname} = firstParent  

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
  // Define the ParentPage type if not already imported
  type ParentPage = "home" | "student" | "settings";
  const isInitializedRef = useRef<boolean>(false);
  
  useEffect(() => {
    const pageMap: Record<string, ParentPage> = {
      "": "home",
      students: "student",
      "weekly-report": "weekly_report",
      "weekly_report": "weekly_report",
      settings: "settings",
      help: "settings",
      support: "settings",
      faqs: "settings",
    };
    
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);
    let urlPage = "";
    let urlSubpage = "";

    if (pathParts[0] === "parent-dashboard") {
      if (pathParts.length >= 3) {
        urlPage = pathParts[2];
        if (pathParts.length >= 4) {
          urlSubpage = pathParts[3];
        }
      }
    } else {
      urlPage = pathParts[pathParts.length - 1] || "";
    }

    const searchParams = new URLSearchParams(location.search);
    const queryTab = searchParams.get("tab");
    
    const mappedPage: ParentPage = pageMap[urlPage] || "home";
    if (mappedPage != currentPage) {
      setCurrentPage(mappedPage);
    }

    if (urlPage === "help" || urlPage === "support" || urlPage === "faqs") {
      setParentSettingsTab("support");
    } else if (mappedPage === "settings") {
      const targetTab = urlSubpage || queryTab;
      if (targetTab) {
        setParentSettingsTab(targetTab === "profile" ? "igrade" : targetTab);
      }
    }
    isInitializedRef.current = true;
  }, []); 
  
  // Update URL only when page changes (not from URL updates)
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    if (parent && parent.length > 0) {
      const parentFullName = getParentFullName();
    
      if (parentFullName) {
        const urlFriendlyName = createUrlFriendlyName(parentFullName);
        document.title = `${parentFullName} - Parent Dashboard`;
      
        // Map current page to URL path
        const pageMap: Record<string, string> = {
          home: "",
          student: "students",
          weekly_report: "weekly-report",
          settings: "settings",
        };
      
        const pagePath = pageMap[currentPage] || "";
        let subPath = "";
        if (currentPage === "settings" && parentSettingsTab) {
          const mappedTab =
            parentSettingsTab === "igrade"
              ? "profile"
              : parentSettingsTab === "support"
              ? "help"
              : parentSettingsTab;
          subPath = `/${mappedTab}`;
        }

        const expectedPath = `/parent-dashboard/${urlFriendlyName}${
          pagePath ? "/" + pagePath + subPath : ""
        }`;
      
        // Only navigate if not already on this path
        const currentPath = location.pathname;
        if (currentPath !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }
      }
    }
  }, [currentPage, parentSettingsTab, parent, navigate, location.pathname]);
  
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Homepage />;
      case "student":
        return <Student />;
      case "weekly_report":
        return <WeeklyReportPage />;
      case "settings":
        return <Settings />;
      default:
        return <Homepage />;
    }
  };
  return (
    // <UserProvider>
    //   <StudentsDataProvider>
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
            <Navbar setShowLogoutModal={setShowLogoutModal} />

            <Flex flex="1" overflow="hidden">
              {/* Sidebar - will not scroll */}
              <Box
                position="relative"
                flexShrink={0}
                w={{ base: "0px", md: "76px", lg: "16%" }}
                minW={{ md: "76px", lg: "190px" }}
                overflow="visible"
                zIndex={90}
              >
                <Sidebar />
              </Box>

              <Box
                flex="1"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  MsOverflowStyle: "none", // IE and Edge
                  scrollbarWidth: "none", // Firefox
                }}
              >
                <DashboardLayout renderPage={renderPage} />
              </Box>
            </Flex>
          </Box>

          {/* Floating bottom popup banner 5 seconds after parent arrives */}
          <WeeklyReportPopupBanner />

          {showLogoutModal && (
            <LogoutPopover setShowLogoutModal={setShowLogoutModal} />
          )}
        </>
    //   </StudentsDataProvider>
    // </UserProvider>
  );
};

export default Home;
