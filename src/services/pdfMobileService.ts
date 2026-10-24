import { toaster } from "@/components/ui/toaster";
import { isNativeMobile } from "@/lib/apiConfig";

export interface PdfActionParams {
  url: string;
  title: string;
  description?: string;
  fileName?: string;
}

export interface PdfActionResult {
  success: boolean;
  cancelled?: boolean;
  path?: string;
  error?: string;
}

/**
 * Converts a Blob to a Base64 string for Capacitor Filesystem writing.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip off the "data:application/pdf;base64," prefix
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Sanitizes a title for safe filesystem storage.
 */
export function sanitizePdfFileName(title: string): string {
  const clean = title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
  return `${clean || "iGrades_Study_Guide"}.pdf`;
}

/**
 * Native device & web-compatible PDF Downloader.
 * - In Capacitor native runtime (iOS / Android):
 *   Uses @capacitor/filesystem (if available) to save into the device Documents/Cache directory.
 * - In Web browsers:
 *   Uses Blob object URL with HTML5 download anchor, falling back to window.open.
 */
export async function downloadOrSavePdf({
  url,
  title,
  fileName,
}: PdfActionParams): Promise<PdfActionResult> {
  const cleanName = fileName || sanitizePdfFileName(title);

  try {
    // 1. Fetch document stream
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download PDF (${res.status}: ${res.statusText})`);
    }
    const blob = await res.blob();

    // 2. Capacitor native filesystem route
    const win = typeof window !== "undefined" ? (window as any) : null;
    const capacitorFilesystem = win?.Capacitor?.Plugins?.Filesystem;

    if (isNativeMobile() && capacitorFilesystem) {
      try {
        const base64Data = await blobToBase64(blob);

        // Check / request storage permissions on Android if needed
        if (typeof capacitorFilesystem.checkPermissions === "function") {
          try {
            const status = await capacitorFilesystem.checkPermissions();
            if (status?.publicStorage === "denied" || status?.publicStorage === "prompt") {
              await capacitorFilesystem.requestPermissions();
            }
          } catch {
            // Non-critical on newer Android scoped storage or iOS
          }
        }

        // Save into Documents directory for easy user access
        const writeResult = await capacitorFilesystem.writeFile({
          path: cleanName,
          data: base64Data,
          directory: "DOCUMENTS",
          recursive: true,
        });

        toaster.create({
          title: "PDF Saved to Device",
          description: `"${title}" has been saved to your device Documents.`,
          type: "success",
          duration: 4000,
        });

        return {
          success: true,
          path: writeResult?.uri || cleanName,
        };
      } catch (fsErr: any) {
        console.warn("Capacitor Filesystem write error, attempting web blob download fallback:", fsErr);
        // Fall through to web download fallback
      }
    }

    // 3. Web browser / standard fallback (HTML5 Anchor)
    const tempUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = tempUrl;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(tempUrl);

    toaster.create({
      title: "Download Started",
      description: `"${cleanName}" has been downloaded.`,
      type: "success",
      duration: 4000,
    });

    return { success: true };
  } catch (err: any) {
    console.error("PDF download failed:", err);

    // Fallback: direct window open if available
    try {
      window.open(url, "_blank");
    } catch {
      // ignore
    }

    toaster.create({
      title: "Download Failed",
      description: err?.message || "Could not save the PDF. Please check your internet connection.",
      type: "error",
      duration: 5000,
    });

    return {
      success: false,
      error: err?.message || "Download failed",
    };
  }
}

/**
 * Native device & web-compatible PDF Sharer.
 * - In Capacitor native runtime:
 *   Invokes @capacitor/share with file URI or remote URL.
 * - In Web browsers:
 *   Uses navigator.share (Web Share API) where supported, or copies link to clipboard.
 */
export async function sharePdf({
  url,
  title,
  description,
  fileName,
}: PdfActionParams): Promise<PdfActionResult> {
  const cleanName = fileName || sanitizePdfFileName(title);
  const shareText = description
    ? `iGrades Curriculum Guide: ${title} — ${description}`
    : `iGrades Curriculum Study Guide: ${title}`;

  const win = typeof window !== "undefined" ? (window as any) : null;
  const capacitorShare = win?.Capacitor?.Plugins?.Share;
  const capacitorFilesystem = win?.Capacitor?.Plugins?.Filesystem;

  // 1. Capacitor Native Share Sheet
  if (isNativeMobile() && capacitorShare) {
    try {
      let fileUriToShare = url;

      // If Filesystem is present, save temporary copy to Cache to share the actual .pdf file
      if (capacitorFilesystem) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            const base64Data = await blobToBase64(blob);
            const cached = await capacitorFilesystem.writeFile({
              path: `share_${cleanName}`,
              data: base64Data,
              directory: "CACHE",
              recursive: true,
            });
            if (cached?.uri) {
              fileUriToShare = cached.uri;
            }
          }
        } catch {
          // Fall back to sharing URL
        }
      }

      await capacitorShare.share({
        title,
        text: shareText,
        url: fileUriToShare,
        dialogTitle: `Share ${title}`,
      });

      return { success: true };
    } catch (shareErr: any) {
      // Handle user cancellation gracefully
      const isCancelled =
        shareErr?.message?.toLowerCase().includes("cancel") ||
        shareErr?.message?.toLowerCase().includes("abort") ||
        shareErr?.name === "AbortError";

      if (isCancelled) {
        return { success: false, cancelled: true };
      }

      console.warn("Capacitor share sheet error:", shareErr);
    }
  }

  // 2. Web Share API (Mobile Safari, Chrome on Android, etc.)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text: shareText,
        url,
      });
      return { success: true };
    } catch (navErr: any) {
      if (navErr?.name === "AbortError") {
        // User dismissed share dialog
        return { success: false, cancelled: true };
      }
      console.warn("navigator.share failed, falling back to clipboard:", navErr);
    }
  }

  // 3. Desktop / Unsupported fallback: Copy link to clipboard
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toaster.create({
        title: "Link Copied",
        description: "PDF resource link copied to clipboard.",
        type: "info",
        duration: 3500,
      });
      return { success: true };
    }
  } catch (clipErr) {
    console.error("Clipboard copy failed:", clipErr);
  }

  toaster.create({
    title: "Share Unavailable",
    description: "Sharing is not supported on this browser.",
    type: "info",
    duration: 3000,
  });

  return { success: false, error: "Sharing not supported" };
}
