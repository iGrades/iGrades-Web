// Hook for tab and app focus switching detection across Desktop & Mobile
import { useEffect } from "react";

export const useTabSwitchDetection = (
  reportInfraction: (type: "tab_switch", customMessage?: string) => void,
  disabled: boolean
) => {
  useEffect(() => {
    // If the quiz is finished or in results mode, don't attach listeners
    if (disabled) return;

    let switchCount = 0;
    let lastSwitchTime = 0;
    let isAway = false;
    const gracePeriod = 1000; // 1 second grace period before counting as infraction

    const onLeave = () => {
      if (!isAway) {
        isAway = true;
        lastSwitchTime = Date.now();
      }
    };

    const onReturn = () => {
      if (isAway) {
        isAway = false;
        const timeAway = Date.now() - lastSwitchTime;
        if (lastSwitchTime > 0 && timeAway > gracePeriod) {
          switchCount++;
          const secondsAway = Math.max(1, Math.round(timeAway / 1000));
          reportInfraction(
            "tab_switch",
            `Tab/App focus lost (${secondsAway}s away). Infraction #${switchCount}. Return to exam immediately.`
          );
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onLeave();
      } else {
        onReturn();
      }
    };

    const handleBlur = () => {
      onLeave();
    };

    const handleFocus = () => {
      onReturn();
    };

    const handlePageHide = () => {
      onLeave();
    };

    const handlePageShow = () => {
      onReturn();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [reportInfraction, disabled]);
};