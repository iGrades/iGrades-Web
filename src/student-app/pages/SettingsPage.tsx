import { Flex } from "@chakra-ui/react";
import SettingsNav from "../components/settings/settingsNav";
import Profile from "../components/settings/profile/profile";
import Security from "../components/settings/security";
import Notifications from "../components/settings/notifications";
import Subscription from "../components/settings/subscription";
import HelpFaqs from "../components/settings/helpFaqs";
import { useNavigationStore } from "@/store/usenavigationStore";

const SettingsPage = () => {
  const { studentSettingsTab, setStudentSettingsTab } = useNavigationStore();
  const currentTab = studentSettingsTab || "profile";

  const handleTabChange: React.Dispatch<React.SetStateAction<string | null>> = (val) => {
    if (typeof val === "function") {
      const next = val(currentTab);
      setStudentSettingsTab(next || "profile");
    } else {
      setStudentSettingsTab(val || "profile");
    }
  };

  return (
    <Flex w={{ base: "full", md: "95%" }} m="auto" mb={{ base: 10, lg: 0 }} direction="column">
      <SettingsNav
        settingsState={currentTab}
        setSettingsState={handleTabChange}
      />
      {currentTab === "subscription" ? (
        <Subscription />
      ) : currentTab === "notification" ? (
        <Notifications />
      ) : currentTab === "security" ? (
        <Security />
      ) : currentTab === "help" || currentTab === "faqs" ? (
        <HelpFaqs />
      ) : (
        <Profile />
      )}
    </Flex>
  );
};

export default SettingsPage;
