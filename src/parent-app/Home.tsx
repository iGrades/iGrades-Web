import { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useUser } from "@/parent-app/context/parentDataContext";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/parent-app/components/sidebar";
import Homepage from "./pages/HomePage";
import Student from "./pages/StudentPage";
import Settings from "./pages/SettingsPage";
import DashboardLayout from "@/parent-app/dashboard";
import Navbar from "@/parent-app/components/navbar";
import LogoutPopover from "./components/logoutPopover";


const Home = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentPage = useNavigationStore((state) => state.currentParentPage);
  const setCurrentPage = useNavigationStore((state) => state.setCurrentParentPage);
  
  const { parent } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  useEffect(() => {
    const pageMap: Record<string, ParentPage> = {
      "": "home",
      students: "student",
      settings: "settings",
    };
    
    const currentPath = location.pathname;
    const pathParts = currentPath.split("/");
    const urlPage = pathParts[pathParts.length - 1] || "";
    
    const mappedPage: ParentPage = pageMap[urlPage] || "home";
    if (mappedPage != currentPage) {
      setCurrentPage(mappedPage);
    }
    
  }, []); 
  
// Update URL only when page changes (not from URL updates)
  useEffect(() => {
    if (parent && parent.length > 0) {
      
      const parentFullName = getParentFullName();
    
      if (parentFullName) {
        const urlFriendlyName = createUrlFriendlyName(parentFullName);
        document.title = `${parentFullName} - Parent Dashboard`;
      
        // Map current page to URL path
        const pageMap: Record<string, string> = {
          home: "",
          student: "students",
          settings: "settings",
        };
      
        const pagePath = pageMap[currentPage] || "";
        const expectedPath = `/parent-dashboard/${urlFriendlyName}${pagePath ? "/" + pagePath : ""}`;
      
        // Only navigate if not already on this path
        const currentPath = location.pathname;
        if (currentPath !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }
      }
    }
  }, [currentPage, parent, navigate, location.pathname]);
  
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Homepage />;
      case "student":
        return <Student />;
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
                w={{ base: "0%", lg: "15%" }}
                overflowY="auto"
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
          {showLogoutModal && (
            <LogoutPopover setShowLogoutModal={setShowLogoutModal} />
          )}
        </>
    //   </StudentsDataProvider>
    // </UserProvider>
  );
};

export default Home;
