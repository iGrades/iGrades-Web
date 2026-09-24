import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";
import { PointsCelebrationModal } from "@/student-app/components/rewards/PointsCelebrationModal";
import { FloatingLanguageWidget } from "@/components/LanguageSwitcher";
import { autoTranslator } from "@/services/autoTranslation";
import { initGlobalActivityTracker, checkAndEnforceSessionExpiry } from "@/lib/authSessionManager";
import { supabase } from "@/lib/supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);

  useEffect(() => {
    autoTranslator.init();
    const cleanupTracker = initGlobalActivityTracker();
    checkAndEnforceSessionExpiry(supabase);
    return () => {
      cleanupTracker();
    };
  }, []);

  return (
    <UserProvider>
      <StudentsDataProvider>
        {element}
        <PointsCelebrationModal />
        <FloatingLanguageWidget />
      </StudentsDataProvider>
    </UserProvider>
  );
}

export default App;

