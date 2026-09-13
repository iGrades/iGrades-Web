import { Flex, Box } from "@chakra-ui/react";
import SettingsNav from "../components/settings/settingsNav";
import MyIgrade from "../components/settings/myIgrade";
import Security from "../components/settings/security";
import Notification from "../components/settings/notification";
import Support from "../components/settings/support";
import { useNavigationStore } from "@/store/usenavigationStore";

const SettingsPage = () => {
  const { parentSettingsTab, setParentSettingsTab } = useNavigationStore();
  const currentTab = parentSettingsTab || "igrade";

  const handleTabChange: React.Dispatch<React.SetStateAction<string | null>> = (val) => {
    if (typeof val === "function") {
      const next = val(currentTab);
      setParentSettingsTab(next || "igrade");
    } else {
      setParentSettingsTab(val || "igrade");
    }
  };

  return (
    <Flex 
      w={{ base: "full", md: "95%" }} 
      m="auto" 
      mb={{ base: "100px", md: 10 }} 
      mt={{ base: 2, md: 5 }}
      px={{ base: 4, md: 0 }} 
      direction="column"
    >
      <SettingsNav
        settingsState={currentTab}
        setSettingsState={handleTabChange}
      />
      
      {/* Wrapped the content in a Box with responsive top margin 
        to separate it from the navigation tabs/buttons 
      */}
      <Box mt={{ base: 6, md: 8 }}>
        {currentTab === "support" || currentTab === "help" || currentTab === "faqs" ? (
          <Support />
        ) : currentTab === "notification" ? (
          <Notification />
        ) : currentTab === "security" ? (
          <Security />
        ) : (
          <MyIgrade />
        )}
      </Box>
    </Flex>
  );
};

export default SettingsPage;