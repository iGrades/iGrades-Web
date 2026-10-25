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

import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

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

    // Deep link listener for native OAuth returns (com.igrades.app://)
    let removeListener: (() => void) | null = null;
    const setupDeepLinks = async () => {
      try {
        const listener = await CapApp.addListener("appUrlOpen", async (event) => {
          try {
            await Browser.close();
          } catch {
            // ignore if browser was not open
          }

          const rawUrl = event.url;
          if (!rawUrl) return;

          if (rawUrl.includes("auth/callback") || rawUrl.includes("access_token") || rawUrl.includes("code=")) {
            const dummy = new URL(rawUrl.replace(/^[a-z0-9.-]+:\/\/[^/]+/i, "https://dummy.local"));
            const targetPath = `/auth/callback${dummy.search}${dummy.hash}`;
            window.location.href = targetPath;
          }
        });
        removeListener = () => listener.remove();
      } catch (err) {
        console.warn("Notice setting up deep link listener:", err);
      }
    };
    setupDeepLinks();

    return () => {
      cleanupTracker();
      window.removeEventListener("open-walkthrough-screens", handleReopenIntro);
      if (removeListener) removeListener();
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

