import { useState } from "react";
import { UserProvider } from "../context/parentDataContext";
import SettingsNav from "../components/settingsNav";
import MyIgrade from "../components/settings/myIgrade";
import Security from "../components/settings/security";
import Notification from "../components/settings/notification";


type Props = {};

const SettingsPage = (props: Props) => {
  const [settingsState, setSettingsState] = useState<string | null>(null);
  return (
    <UserProvider>
      <SettingsNav
        settingsState={settingsState}
        setSettingsState={setSettingsState}
      />
      {settingsState === "notification" ? (
        <Notification />
      ) : settingsState === "security" ? (
        <Security />
      ) : (
        <MyIgrade />
      )}
    </UserProvider>
  );
};

export default SettingsPage;
