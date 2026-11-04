import { useEffect } from "react";
import { backButtonService } from "@/services/backButtonService";

/**
 * Register a back button handler with priority.
 * Automatically cleans up on unmount or when `enabled` is false.
 */
export function useBackButton(
  id: string,
  priority: number,
  onBack: () => boolean,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    return backButtonService.register({
      id,
      priority,
      onBack,
    });
  }, [id, priority, onBack, enabled]);
}
