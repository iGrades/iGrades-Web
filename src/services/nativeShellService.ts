import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

const THEME_STORAGE_KEY = "igrades_theme_mode";
const FULLSCREEN_STORAGE_KEY = "igrades_fullscreen_mode";

/**
 * Native Shell Service for Capacitor & Responsive Web.
 * 1. Phone native status bar is NEVER hidden by default; background color is determined by theme (#FFFFFF light, #000000 dark).
 * 2. Phone navigation bar is NOT hidden, with transparent background so it seamlessly adapts.
 * 3. Default theme on first launch is Light mode; user can set to Dark, Light, or System default.
 * 4. Supports optional full-screen mode toggle in settings.
 * 5. Manages keyboard and safe area CSS variables.
 */
export const nativeShellService = {
  /**
   * Initializes native bridge enhancements.
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") return;

    this.updateSafeAreaCSSVars();

    // Default theme on first launch: LIGHT MODE
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    let isDark = false;
    if (savedTheme === "dark") {
      isDark = true;
    } else if (savedTheme === "light") {
      isDark = false;
    } else if (savedTheme === "system") {
      isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      // First launch default on phone: light mode
      isDark = false;
    }

    await this.applyTheme(isDark);

    // Listen for fullscreen change events from browser/esc key
    if (typeof document !== "undefined") {
      const handleFsChange = () => {
        const isFs = Boolean(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        try {
          localStorage.setItem(FULLSCREEN_STORAGE_KEY, isFs ? "true" : "false");
          window.dispatchEvent(
            new CustomEvent("igrades-fullscreen-changed", { detail: { isFullscreen: isFs } })
          );
        } catch {
          // ignore
        }
      };
      document.addEventListener("fullscreenchange", handleFsChange);
      document.addEventListener("webkitfullscreenchange", handleFsChange);
      document.addEventListener("mozfullscreenchange", handleFsChange);
      document.addEventListener("MSFullscreenChange", handleFsChange);
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // 1. Phone status bar: DO NOT HIDE. Show and set background to theme color (#FFFFFF in light, #000000 in dark)
    try {
      await StatusBar.show();
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: isDark ? "#000000" : "#FFFFFF" });
      await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
    } catch (err) {
      console.warn("[NativeShell] StatusBar init warning:", err);
    }

    // 2. Keyboard handling
    try {
      await Keyboard.addListener("keyboardWillShow", (info) => {
        document.documentElement.classList.add("keyboard-is-open");
        document.documentElement.style.setProperty(
          "--native-keyboard-height",
          `${info.keyboardHeight}px`
        );
      });

      await Keyboard.addListener("keyboardWillHide", () => {
        document.documentElement.classList.remove("keyboard-is-open");
        document.documentElement.style.setProperty("--native-keyboard-height", "0px");
      });
    } catch (err) {
      console.warn("[NativeShell] Keyboard listener warning:", err);
    }
  },

  /**
   * Checks whether dark mode is currently active.
   */
  isDarkMode(): boolean {
    if (typeof document === "undefined") return false;
    return (
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark"
    );
  },

  /**
   * Checks whether full-screen mode is currently active.
   */
  isFullscreen(): boolean {
    if (typeof document === "undefined") return false;
    const isDocFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    if (isDocFs) return true;
    try {
      return localStorage.getItem(FULLSCREEN_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  },

  /**
   * Toggles or sets fullscreen mode for the app.
   */
  async setFullscreen(enable: boolean): Promise<void> {
    try {
      localStorage.setItem(FULLSCREEN_STORAGE_KEY, enable ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("igrades-fullscreen-changed", { detail: { isFullscreen: enable } })
      );

      if (enable) {
        const elem = (typeof document !== "undefined" ? document.documentElement : null) as any;
        if (elem) {
          if (elem.requestFullscreen && !document.fullscreenElement) {
            await elem.requestFullscreen().catch(() => {});
          } else if (elem.webkitRequestFullscreen && !(document as any).webkitFullscreenElement) {
            await elem.webkitRequestFullscreen().catch(() => {});
          } else if (elem.mozRequestFullScreen && !(document as any).mozFullScreenElement) {
            await elem.mozRequestFullScreen().catch(() => {});
          } else if (elem.msRequestFullscreen && !(document as any).msFullscreenElement) {
            await elem.msRequestFullscreen().catch(() => {});
          }
        }
        if (Capacitor.isNativePlatform()) {
          try {
            await StatusBar.hide();
          } catch (_err) {
            void _err;
          }
        }
      } else {
        const doc = typeof document !== "undefined" ? (document as any) : null;
        if (doc) {
          if (doc.exitFullscreen && doc.fullscreenElement) {
            await doc.exitFullscreen().catch(() => {});
          } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
            await doc.webkitExitFullscreen().catch(() => {});
          } else if (doc.mozCancelFullScreen && doc.mozFullScreenElement) {
            await doc.mozCancelFullScreen().catch(() => {});
          } else if (doc.msExitFullscreen && doc.msFullscreenElement) {
            await doc.msExitFullscreen().catch(() => {});
          }
        }
        if (Capacitor.isNativePlatform()) {
          const isDark = this.isDarkMode();
          try {
            await StatusBar.show();
            await StatusBar.setOverlaysWebView({ overlay: false });
            await StatusBar.setBackgroundColor({ color: isDark ? "#000000" : "#FFFFFF" });
            await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
          } catch (_err) {
            void _err;
          }
        }
      }
    } catch (err) {
      console.warn("[NativeShell] Fullscreen toggle warning:", err);
    }
  },

  /**
   * Toggles between light and dark mode.
   */
  async toggleDarkMode(): Promise<boolean> {
    const nextDark = !this.isDarkMode();
    await this.applyTheme(nextDark);
    return nextDark;
  },

  /**
   * Applies the theme across web DOM, meta tags, and native shell.
   */
  async applyTheme(isDark: boolean): Promise<void> {
    if (typeof document === "undefined") return;

    const statusBarColor = isDark ? "#000000" : "#FFFFFF";

    // 1. DOM Root class & attributes
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#F5F5F5";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.body.style.backgroundColor = "#F8FAFC";
      document.body.style.color = "#0F172A";
    }

    // 2. Sync HTML meta theme-color (controls phone status/top bar fallback)
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute("content", statusBarColor);

    // 3. Dispatch global event for React components
    window.dispatchEvent(
      new CustomEvent("igrades-theme-changed", { detail: { isDark } })
    );

    // 4. Capacitor native status bar: keep VISIBLE (unless in active user-chosen fullscreen), background determined by theme
    if (Capacitor.isNativePlatform()) {
      try {
        const isFs = this.isFullscreen();
        if (isFs) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: statusBarColor });
          await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
        }
      } catch (err) {
        console.warn("[NativeShell] StatusBar update notice:", err);
      }
    }
  },

  /**
   * Safely calculates and assigns CSS variables for safe area insets.
   * Keeps navigation bar transparent and safe-area aware.
   */
  updateSafeAreaCSSVars(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--sat", "env(safe-area-inset-top, 0px)");
    root.style.setProperty("--sab", "env(safe-area-inset-bottom, 0px)");
    root.style.setProperty("--sal", "env(safe-area-inset-left, 0px)");
    root.style.setProperty("--sar", "env(safe-area-inset-right, 0px)");
  },
};
