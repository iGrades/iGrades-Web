import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

/**
 * Native Shell Service for Capacitor & Responsive Web.
 * Configures Status Bar, Keyboard listeners, and safe-area custom CSS properties.
 * Guarantees zero breakdown on web browsers and avoids double-counting insets.
 */

export const nativeShellService = {
  /**
   * Initializes native bridge enhancements if running inside a Capacitor native shell.
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") return;

    // Initialize root safe area fallbacks if not already populated
    this.updateSafeAreaCSSVars();

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // 1. Configure Native Status Bar
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Dark text on light background
      // Keep status bar within natural system flow or overlay cleanly without obstruction
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      // In some Android versions or emulators setOverlaysWebView may differ; fail silently
      console.warn("[NativeShell] StatusBar init warning:", err);
    }

    // 2. Configure Native Keyboard Handling
    try {
      // Listen to keyboard lifecycle to avoid double insets or obstructed inputs
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
   * Safely calculates and assigns CSS variables for safe area insets.
   */
  updateSafeAreaCSSVars(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    // Set fallback custom variables that use env() with graceful 0px fallbacks
    root.style.setProperty("--sat", "env(safe-area-inset-top, 0px)");
    root.style.setProperty("--sab", "env(safe-area-inset-bottom, 0px)");
    root.style.setProperty("--sal", "env(safe-area-inset-left, 0px)");
    root.style.setProperty("--sar", "env(safe-area-inset-right, 0px)");
  },
};
