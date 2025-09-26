import { Box, Flex } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useState } from "react";
import Dashboard from "./layouts/dashboard";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Homepage from "./pages/Homepage";
import QuizPage from "./pages/QuizPage";
import LearnPage from "./pages/LearnPage";
import SettingsPage from "./pages/SettingsPage";

const Home = () => {
  const currentPage = useNavigationStore((state) => state.currentStudentPage);
  const [showSideBar, setShowSideBar] = useState<boolean>(true);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Homepage />;
      case "quiz":
        return (
          <QuizPage showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
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
    <Box
      as="main"
      display="flex"
      flexDirection="column"
      minH="100vh"
      maxH="100vh"
      overflow="hidden"
      bg='textFieldColor'
    >
      <Navbar />
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
            MsOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
          }}
        >
          <Dashboard renderPage={renderPage} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
