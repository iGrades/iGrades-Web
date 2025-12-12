// hook for tab switching detection

import { useEffect } from "react";

export const useTabSwitchDetection = (reportInfraction: (type: "tab_switch", customMessage?: string) => void) => {
  useEffect(() => {
    let switchCount = 0;
    let lastSwitchTime = 0;
    const gracePeriod = 1000; // 1 second grace before counting as infraction

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab lost focus
        lastSwitchTime = Date.now();
      } else {
        // Tab regained focus
        const timeAway = Date.now() - lastSwitchTime;
        if (timeAway > gracePeriod) {
          switchCount++;
          reportInfraction("tab_switch", `Tab switch detected (away for ${Math.round(timeAway / 1000)} seconds). This is switch #${switchCount}.`);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reportInfraction]);
};