import { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";
import { PointsCelebrationModal } from "@/student-app/components/rewards/PointsCelebrationModal";
import { autoTranslator } from "@/services/autoTranslation";
import { initGlobalActivityTracker, checkAndEnforceSessionExpiry, STORAGE_KEYS } from "@/lib/authSessionManager";
import { supabase } from "@/lib/supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);
  const location = useLocation();

  useEffect(() => {
    autoTranslator.init();
    const cleanupTracker = initGlobalActivityTracker();
    checkAndEnforceSessionExpiry(supabase);
    return () => {
      cleanupTracker();
    };
  }, []);

  // Track active authenticated paths so reloads or returning to '/' preserves context
  useEffect(() => {
    const p = location.pathname;
    if (
      p.startsWith("/student-dashboard") ||
      p.startsWith("/parent-dashboard") ||
      p.startsWith("/course-selection") ||
      (p.startsWith("/admin") && !p.includes("/login"))
    ) {
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_PATH, p + location.search);
      } catch {
        // ignore
      }
    }
  }, [location.pathname, location.search]);


  return (
    <UserProvider>
      <StudentsDataProvider>
        {element}
        <PointsCelebrationModal />
      </StudentsDataProvider>
    </UserProvider>
  );
}

export default App;

