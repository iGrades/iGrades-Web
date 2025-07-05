import { Flex, Heading } from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigationStore } from "@/store/usenavigationStore";
import Sidebar from "@/components/sidebar";
import Homepage from "../parent-app/pages/HomePage";
import Student from "../parent-app/pages/StudentPage";
import Settings from "../parent-app/pages/SettingsPage";
import Community from "@/parent-app/pages/CommunityPage";
import DashboardLayout from "@/layouts/dashboard";
import Navbar from "@/components/navbar";

type Props = {};

const {
  data: { user },
} = await supabase.auth.getUser();

let { data: parents, error } = await supabase.from("parents").select("*");

console.log(parents);

console.log(user);

const Home = (props: Props) => {

  const [parent] = parents || [];
  const { t } = useTranslation();

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
    <Box
      as="main"
      display="flex"
      flexDirection="column"
      minH="100vh"
      maxH="100vh"
      overflow="hidden"
      bg={{ base: "white", md: "textFieldColor" }}
    >
      <Navbar
        userFirstName={parent?.firstname}
        userLastName={parent?.lastname}
      />

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
            "-ms-overflow-style": "none", // IE and Edge
            "scrollbar-width": "none", // Firefox
          }}
        >
          <DashboardLayout renderPage={renderPage} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
