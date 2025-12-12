// hook for heuristic screen recording detection
// This function isn't working for OS level commands that can trigger screen recording (e.g Win + Alt + R, Snipping tool, etc...)

import { useEffect, useRef, useState } from "react";

export const useScreenRecordingDetection = (reportInfraction: (type: "screen_recording", customMessage?: string) => void) => {
  const [longTaskCount, setLongTaskCount] = useState(0);
  const lastInfractionTime = useRef(0);
  const debouncePeriod = 30000;  // 30s debounce between infractions
  const cpuThreshold = 5;  // Number of long tasks (>50ms) in 10s to flag (tune based on testing)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let taskStartTimes: number[] = [];  // Track recent long task timestamps

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'longtask' && entry.duration > 50) {  // Long task >50ms
          const now = Date.now();
          taskStartTimes = taskStartTimes.filter(time => now - time < 10000);  // Keep last 10s
          taskStartTimes.push(now);
          setLongTaskCount(taskStartTimes.length);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });

    // Periodic check for high CPU (e.g., sustained long tasks indicating recording)
    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastInfractionTime.current < debouncePeriod) return;

      if (longTaskCount >= cpuThreshold) {
        reportInfraction("screen_recording", `High CPU activity detected (${longTaskCount} long tasks in 10s) - possible screen recording.`);
        lastInfractionTime.current = now;
      }
    }, 10000);  // Check every 10s

    return () => {
      observer.disconnect();
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [reportInfraction, longTaskCount, cpuThreshold, debouncePeriod]);
};