import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/components/ui/color-mode";
import { nativeShellService } from "@/services/nativeShellService";

/**
 * Custom React hook for controlling Theme (Light / Dark / System Default)
 * and Fullscreen mode across the iGrades application.
 */
export const useAppTheme = () => {
  const { theme, resolvedTheme, systemTheme, setTheme: setContextTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";

  const [isFullscreen, setIsFullscreenState] = useState<boolean>(() => {
    return nativeShellService.isFullscreen();
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      nativeShellService.applyTheme(isDark).catch(() => {});
    }
  }, [isDark]);

  useEffect(() => {
    const handleFsChange = (e: any) => {
      if (e.detail && typeof e.detail.isFullscreen === "boolean") {
        setIsFullscreenState(e.detail.isFullscreen);
      } else {
        setIsFullscreenState(nativeShellService.isFullscreen());
      }
    };
    window.addEventListener("igrades-fullscreen-changed", handleFsChange);
    return () => window.removeEventListener("igrades-fullscreen-changed", handleFsChange);
  }, []);

  const setTheme = useCallback(
    async (mode: "light" | "dark" | "system") => {
      setContextTheme(mode);
      const isTargetDark = mode === "dark" || (mode === "system" && systemTheme === "dark");
      await nativeShellService.applyTheme(isTargetDark);
    },
    [setContextTheme, systemTheme]
  );

  const toggleTheme = useCallback(async () => {
    const next = isDark ? "light" : "dark";
    await setTheme(next);
    return next === "dark";
  }, [isDark, setTheme]);

  const setDarkMode = useCallback(
    async (dark: boolean) => {
      await setTheme(dark ? "dark" : "light");
    },
    [setTheme]
  );

  const setFullscreen = useCallback(async (enable: boolean) => {
    await nativeShellService.setFullscreen(enable);
    setIsFullscreenState(enable);
  }, []);

  return {
    theme: theme || "light",
    resolvedTheme: resolvedTheme || "light",
    systemTheme,
    isDark,
    setTheme,
    toggleTheme,
    setDarkMode,
    isFullscreen,
    setFullscreen,
  };
};
