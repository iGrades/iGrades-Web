import { useState, useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { StudentsDataProvider } from "@/parent-app/context/studentsDataContext";
import { UserProvider } from "@/parent-app/context/parentDataContext";
import { PointsCelebrationModal } from "@/student-app/components/rewards/PointsCelebrationModal";
import { SplashScreen } from "@/components/SplashScreen";
import { WalkthroughScreens } from "@/components/WalkthroughScreens";
import { autoTranslator } from "@/services/autoTranslation";
import { initGlobalActivityTracker, checkAndEnforceSessionExpiry, STORAGE_KEYS } from "@/lib/authSessionManager";
import { supabase } from "@/lib/supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    autoTranslator.init();
    const cleanupTracker = initGlobalActivityTracker();
    checkAndEnforceSessionExpiry(supabase);

    const handleReopenIntro = () => setShowWalkthrough(true);
    window.addEventListener("open-walkthrough-screens", handleReopenIntro);

    return () => {
      cleanupTracker();
      window.removeEventListener("open-walkthrough-screens", handleReopenIntro);
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

  const handleSplashFinish = () => {
    setShowSplash(false);
    const isAuthDashboard =
      location.pathname.startsWith("/student-dashboard") ||
      location.pathname.startsWith("/parent-dashboard") ||
      location.pathname.startsWith("/admin");
    const hasCompleted = localStorage.getItem("igrades_onboarding_completed") === "true";
    const forceIntro = new URLSearchParams(window.location.search).get("intro") === "true";

    // Show walkthrough if not already on authenticated dashboard, or if forced
    if (!isAuthDashboard && (!hasCompleted || forceIntro)) {
      setShowWalkthrough(true);
    }
  };

  return (
    <UserProvider>
      <StudentsDataProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        {showWalkthrough && (
          <WalkthroughScreens onFinish={() => setShowWalkthrough(false)} />
        )}
        {element}
        <PointsCelebrationModal />
      </StudentsDataProvider>
    </UserProvider>
  );
}

export default App;

