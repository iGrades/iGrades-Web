import { App as CapApp } from "@capacitor/app";
import { isNativeMobile } from "@/lib/apiConfig";

export interface BackHandler {
  id: string;
  priority: number; // Higher numbers run first (e.g. 100 for modals, 50 for sub-views, 10 for tabs)
  onBack: () => boolean; // Return true if handled, false to delegate to next handler
}

class BackButtonService {
  private handlers: BackHandler[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    // 1. Capacitor Native Android Back Button
    if (isNativeMobile()) {
      try {
        CapApp.addListener("backButton", ({ canGoBack }) => {
          this.handleBackPress(canGoBack);
        });
      } catch (err) {
        console.warn("Notice: could not register Capacitor backButton listener:", err);
      }
    }

    // 2. Browser / Web popstate & keyboard Escape support
    window.addEventListener("popstate", () => {
      this.handleBackPress(true);
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.handleBackPress(true);
      }
    });
  }

  public register(handler: BackHandler): () => void {
    this.handlers.push(handler);
    // Sort descending by priority
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.handlers = this.handlers.filter((h) => h.id !== handler.id);
    };
  }

  public handleBackPress(canGoBack?: boolean) {
    // Run handlers from highest priority to lowest
    for (const handler of this.handlers) {
      try {
        const handled = handler.onBack();
        if (handled) {
          return;
        }
      } catch (e) {
        console.warn(`Error running back handler ${handler.id}:`, e);
      }
    }

    // If no handlers consumed the event and browser has history
    if (canGoBack && window.history.length > 1 && window.history.state?.idx > 0) {
      window.history.back();
      return;
    }

    // On native Android, if at root and nothing handled, exit the app
    if (isNativeMobile()) {
      try {
        CapApp.exitApp();
      } catch {
        // ignore
      }
    }
  }
}

export const backButtonService = new BackButtonService();
