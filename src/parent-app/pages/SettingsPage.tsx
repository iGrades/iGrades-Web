import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import SettingsNav from "../components/settings/settingsNav";
import MyIgrade from "../components/settings/myIgrade";
import Security from "../components/settings/security";
import Notification from "../components/settings/notification";
import Support from "../components/settings/support";

const SettingsPage = () => {
  const [settingsState, setSettingsState] = useState<string | null>("igrade");
  

  return (
    <Flex w={{ base: "full", md: "95%" }} m="auto" mb={10} direction="column">
      <SettingsNav
        settingsState={settingsState}
        setSettingsState={setSettingsState}
      />
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
    </Flex>
  );
};

export default SettingsPage;
