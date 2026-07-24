import { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import SettingsNav from "../components/settings/settingsNav";
import MyIgrade from "../components/settings/myIgrade";
import Security from "../components/settings/security";
import Notification from "../components/settings/notification";
import Support from "../components/settings/support";

const SettingsPage = () => {
  const [settingsState, setSettingsState] = useState<string | null>("igrade");

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
        settingsState={settingsState}
        setSettingsState={setSettingsState}
      />
      
      {/* Wrapped the content in a Box with responsive top margin 
        to separate it from the navigation tabs/buttons 
      */}
      <Box mt={{ base: 6, md: 8 }}>
        {settingsState === "support" ? (
          <Support />
        ) : settingsState === "notification" ? (
          <Notification />
        ) : settingsState === "security" ? (
          <Security />
        ) : settingsState === "igrade" ? (
          <MyIgrade />
        ) : (
          <MyIgrade />
        )}
      </Box>
    </Flex>
  );
};

export default SettingsPage;