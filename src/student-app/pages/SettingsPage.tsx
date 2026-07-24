import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import SettingsNav from "../components/settings/settingsNav";
import Profile from "../components/settings/profile/profile";
import Security from "../components/settings/security";
import Notifications from "../components/settings/notifications";
import Subscription from "../components/settings/subscription";



const SettingsPage = () => {
  const [settingsState, setSettingsState] = useState<string | null>("profile");

  return (
    <Flex w={{ base: "full", md: "95%" }} m="auto" mb={{base: 10, lg: 0}} direction="column">
      <SettingsNav
        settingsState={settingsState}
        setSettingsState={setSettingsState}
      />
      {settingsState === "subscription" ? (
        <Subscription />
      ) : settingsState === "notification" ? (
        <Notifications />
      ) : settingsState === "security" ? (
        <Security />
      ) : settingsState === "profile" ? (
        <Profile />
      ) : (
        <Profile />
      )}
    </Flex>
  );
};

export default SettingsPage;
