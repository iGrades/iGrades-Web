
// useScreenshotDetection.ts (configured with SHA-256 for reliable uniqueness)

import { useEffect, useRef } from "react";

export const useScreenshotDetection = (reportInfraction: (type: "screenshot", customMessage?: string) => void, disabled: boolean) => {
  const lastInfractionTime = useRef(0);
  const knownImageHashes = useRef<Set<string>>(new Set()); // Track unique images by hash
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clipboardAvailableRef = useRef<boolean>(true);
  const debouncePeriod = 10000; // 10s global debounce between potential checks
  const imageHashTimeout = 60000; // Clear hashes after 1 min (user might clear clipboard)

  useEffect(() => {
    // If the quiz is finished or in results mode, don't attach listeners
    if (disabled) return;
    
    // Keydown for plain PrtSc (fallback) 
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'PrintScreen' || event.keyCode === 44 || event.code === 'PrintScreen') {
        const now = Date.now();
        if (now - lastInfractionTime.current > debouncePeriod) {
          reportInfraction("screenshot", "Screenshot attempt detected (Print Screen key pressed). This may violate quiz rules.");
          lastInfractionTime.current = now;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // ---HASH FUNCTION USING SHA-256---
    const getImageHash = async (imageBlob: Blob): Promise<string> => {
      try {
        const buffer = await imageBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      } catch {
        return `hash_error_${Date.now()}`; 
      }
    };
    // ---------------------------------------------------

    // Helper to safely inspect clipboard images
    const inspectClipboardImages = async () => {
      if (!clipboardAvailableRef.current) return;
      if (typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.read !== "function") {
        clipboardAvailableRef.current = false;
        return;
      }

      try {
        const clipboardItems = await navigator.clipboard.read();
        let detectedNewImage = false;
        for (const item of clipboardItems) {
          if (item.types.some(type => type.startsWith('image/'))) { 
            const imageBlob = await item.getType('image/png').catch(() => null) || 
                              await item.getType('image/jpeg').catch(() => null) || 
                              await item.getType('image/webp').catch(() => null);
            
            if (imageBlob && imageBlob.size > 0) {
              const hash = await getImageHash(imageBlob as Blob);
              if (!knownImageHashes.current.has(hash)) { 
                knownImageHashes.current.add(hash);
                detectedNewImage = true;
                setTimeout(() => knownImageHashes.current.delete(hash), imageHashTimeout);
                break;
              }
            }
          }
        }
        if (detectedNewImage) {
          reportInfraction("screenshot", "New image detected in clipboard - possible screenshot attempt.");
          lastInfractionTime.current = Date.now();
        }
      } catch (err: any) {
        // If clipboard read is blocked by document permissions policy or not allowed in iframe, disable future reads
        if (
          err?.name === "NotAllowedError" ||
          err?.name === "SecurityError" ||
          err?.message?.includes("permissions policy") ||
          err?.message?.includes("blocked")
        ) {
          clipboardAvailableRef.current = false;
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    };

    // Request permission and start polling
    const startPolling = async () => {
      if (typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.read !== "function") {
        clipboardAvailableRef.current = false;
        return;
      }

      try {
        if (navigator.permissions && typeof navigator.permissions.query === "function") {
          try {
            const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
            if (permission.state === 'denied') {
              clipboardAvailableRef.current = false;
              return;
            }
          } catch {
            // Some browsers do not support 'clipboard-read' permission query, continue to fallback
          }
        }

        pollIntervalRef.current = setInterval(async () => {
          const now = Date.now();
          if (now - lastInfractionTime.current < debouncePeriod) return;
          await inspectClipboardImages();
        }, 5000);
      } catch {
        clipboardAvailableRef.current = false;
      }
    };

    const timer = setTimeout(startPolling, 1000);

    // Fallback clipboard check on focus
    const checkClipboardOnFocus = async () => {
      const now = Date.now();
      if (now - lastInfractionTime.current < debouncePeriod) return;
      await inspectClipboardImages();
    };

    window.addEventListener('focus', checkClipboardOnFocus);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener('focus', checkClipboardOnFocus);
    };
  }, [reportInfraction, disabled]);
};