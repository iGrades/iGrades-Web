import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigationStore } from "@/store/usenavigationStore";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";
import Sidebar from "@/parent-app/components/sidebar";
import Homepage from "./pages/HomePage";
import Student from "./pages/StudentPage";
import Settings from "./pages/SettingsPage";
import DashboardLayout from "@/parent-app/dashboard";
import Navbar from "@/parent-app/components/navbar";
import LogoutPopover from "./components/logoutPopover";

type Props = {};

const Home = (props: Props) => {
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentPage = useNavigationStore((state) => state.currentPage);

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
    <UserProvider>
      <StudentsDataProvider>
        <>
          <Box
            as="main"
            display="flex"
            flexDirection="column"
            minH="100vh"
            maxH="100vh"
            overflow="hidden"
            bg={{ base: "white", md: "textFieldColor" }}
          >
            <Navbar showLogoutModal={showLogoutModal} setShowLogoutModal={setShowLogoutModal} />

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
      </StudentsDataProvider>
    </UserProvider>
  );
};

export default Home;
