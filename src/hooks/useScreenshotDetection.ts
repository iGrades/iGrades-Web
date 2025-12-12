
// useScreenshotDetection.ts (configured with SHA-256 for reliable uniqueness)

import { useEffect, useRef } from "react";

export const useScreenshotDetection = (reportInfraction: (type: "screenshot", customMessage?: string) => void) => {
  const lastInfractionTime = useRef(0);
  const knownImageHashes = useRef<Set<string>>(new Set()); // Track unique images by hash
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const debouncePeriod = 10000; // 10s global debounce between potential checks
  const imageHashTimeout = 60000; // Clear hashes after 1 min (user might clear clipboard)

  useEffect(() => {
    // Keydown for plain PrtSc (fallback) - NO CHANGE NEEDED HERE
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
        // Read the Blob data into an ArrayBuffer
        const buffer = await imageBlob.arrayBuffer();
        
        // Use the Web Crypto API to compute SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        
        // Convert the ArrayBuffer to a hexadecimal string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      } catch (e) {
        console.error("Error generating SHA-256 hash:", e);
        // Fallback or a unique error string if hashing fails
        return `hash_error_${Date.now()}`; 
      }
    };
    // ---------------------------------------------------

    // Request permission and start polling
    const startPolling = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          pollIntervalRef.current = setInterval(async () => {
            const now = Date.now();
            // Global Infraction Debounce Check
            if (now - lastInfractionTime.current < debouncePeriod) return;

            try {
              const clipboardItems = await navigator.clipboard.read();
              let detectedNewImage = false;
              for (const item of clipboardItems) {
                if (item.types.some(type => type.startsWith('image/'))) { 
                  // Prioritize 'image/png' if it exists, otherwise get the first image type
                  const imageBlob = await item.getType('image/png') || await item.getType('image/jpeg') || await item.getType('image/webp') || item.types.map(t => t.startsWith('image/') ? item.getType(t) : null).filter(Boolean)[0];
                  
                  if (imageBlob) {
                    // Check image size before hashing, for performance optimization
                    if (imageBlob.size === 0) continue; 
                    
                    const hash = await getImageHash(imageBlob as Blob);
                    
                    // hash checking
                    if (!knownImageHashes.current.has(hash)) { 
                      knownImageHashes.current.add(hash);
                      detectedNewImage = true;
                      // Auto-clear old hashes periodically
                      setTimeout(() => knownImageHashes.current.delete(hash), imageHashTimeout);
                      break; // Only check one image per poll
                    }
                  }
                }
              }
              if (detectedNewImage) {
                reportInfraction("screenshot", "New image detected in clipboard - possible screenshot attempt.");
                lastInfractionTime.current = now;
              }
            } catch (err) {
              console.error('Clipboard read error:', err);
            }
          }, 2000); // Poll every 2s
        } else {
          console.warn('Clipboard permission denied');
        }
      } catch (err) {
        console.error('Permission query error:', err);
      }
    };

    const timer = setTimeout(startPolling, 1000);

    // Fallback check on focus
    const checkClipboardOnFocus = async () => {
      const now = Date.now();
      if (now - lastInfractionTime.current < debouncePeriod) return;

      try {
        const clipboardItems = await navigator.clipboard.read();
        let detectedNewImage = false;
        for (const item of clipboardItems) {
          if (item.types.some(type => type.startsWith('image/'))) {
            const imageBlob = await item.getType('image/png') || await item.getType('image/jpeg') || await item.getType('image/webp') || item.types.map(t => t.startsWith('image/') ? item.getType(t) : null).filter(Boolean)[0];
            if (imageBlob) {
              if ((imageBlob as Blob).size === 0) continue;

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
          reportInfraction("screenshot", "New image detected in clipboard on tab focus - possible screenshot attempt.");
          lastInfractionTime.current = now;
        }
      } catch (err) {
        // Silent fail
        console.error(err);
      }
    };

    window.addEventListener('focus', checkClipboardOnFocus);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener('focus', checkClipboardOnFocus);
    };
  }, [reportInfraction]);
};