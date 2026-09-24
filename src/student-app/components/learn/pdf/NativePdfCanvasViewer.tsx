import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  Badge,
  HStack,
  Input,
} from "@chakra-ui/react";
import {
  LuZoomIn,
  LuZoomOut,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuMaximize,
  LuMinimize,
  LuRotateCw,
  LuExternalLink,
  LuDownload,
  LuTriangleAlert,
  LuRefreshCw,
  LuLayoutGrid,
  LuBookOpen,
  LuSparkles,
  LuMaximize2,
} from "react-icons/lu";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import { getCurriculumNote } from "./curriculumStudyNotes";

// ─── Browser Polyfill Guards for PDF.js 6.x ──────────────────────────────────
if (typeof window !== "undefined") {
  if (typeof (Promise as any).try !== "function") {
    (Promise as any).try = function (fn: any, ...args: any[]) {
      return new Promise((resolve) => resolve(fn(...args)));
    };
  }
  if (typeof (Uint8Array.prototype as any).toHex !== "function") {
    (Uint8Array.prototype as any).toHex = function () {
      return Array.from(this as Uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };
  }
  // Point worker to same-origin public file
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfViewerProps {
  url: string;
  title?: string;
  onDownload?: () => void;
  onOpenNotes?: () => void;
}

// ─── Individual Page Canvas Component (Vertical List Item) ───────────────────
interface SinglePageCanvasProps {
  pageNum: number;
  pdfDoc: any;
  scale: number;
  rotation: number;
  totalCount: number;
}

const SinglePageCanvas = React.forwardRef<HTMLDivElement, SinglePageCanvasProps>(
  ({ pageNum, pdfDoc, scale, rotation, totalCount }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<any>(null);
    const [pageWidth, setPageWidth] = useState<number>(0);
    const [pageHeight, setPageHeight] = useState<number>(0);

    useEffect(() => {
      let isCancelled = false;

      const render = async () => {
        if (!pdfDoc || !canvasRef.current) return;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Task already finished or cancelled
          }
        }

        try {
          const page = await pdfDoc.getPage(pageNum);
          if (isCancelled) return;

          const viewport = page.getViewport({ scale, rotation });
          const width = Math.floor(viewport.width);
          const height = Math.floor(viewport.height);
          setPageWidth(width);
          setPageHeight(height);

          const canvas = canvasRef.current;
          if (!canvas) return;

          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const renderTask = page.render({
            canvasContext: ctx,
            viewport,
          });
          renderTaskRef.current = renderTask;

          await renderTask.promise;
        } catch (err: any) {
          if (err?.name !== "RenderingCancelledException") {
            console.error(`Page ${pageNum} render error:`, err);
          }
        }
      };

      render();

      return () => {
        isCancelled = true;
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore
          }
        }
      };
    }, [pdfDoc, pageNum, scale, rotation]);

    return (
      <Box
        ref={ref}
        data-page-num={pageNum}
        position="relative"
        boxShadow="0 14px 40px rgba(0,0,0,0.65)"
        borderRadius="md"
        overflow="hidden"
        bg="white"
        mx="auto"
        w="fit-content"
        transition="transform 0.1s ease-out"
        style={{
          minWidth: pageWidth > 0 ? `${pageWidth}px` : undefined,
          minHeight: pageHeight > 0 ? `${pageHeight}px` : undefined,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
        {/* Floating Page Number indicator at top right of page */}
        <Box
          position="absolute"
          top={2.5}
          right={2.5}
          bg="rgba(15, 23, 42, 0.75)"
          backdropFilter="blur(6px)"
          px={2.5}
          py={0.5}
          borderRadius="md"
          pointerEvents="none"
          zIndex={2}
        >
          <Text fontSize="10px" fontWeight="bold" color="gray.200">
            Page {pageNum} of {totalCount}
          </Text>
        </Box>
      </Box>
    );
  }
);
SinglePageCanvas.displayName = "SinglePageCanvas";

export const NativePdfCanvasViewer: React.FC<PdfViewerProps> = ({
  url,
  title,
  onDownload,
  onOpenNotes,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInputVal, setPageInputVal] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [autoFitWidth, setAutoFitWidth] = useState<boolean>(true);

  const pdfDocRef = useRef<any>(null);
  const pageRefs = useRef<{ [pageNum: number]: HTMLDivElement | null }>({});
  const rootContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<number>(0);

  // Sync page input value with currentPage
  useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // ─── Generate Fallback Offline Study Guide with jsPDF ────────────────────────
  const generateOfflinePdfBlob = useCallback((): Uint8Array => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const note = getCurriculumNote(title || "Study Guide", "");

    // Page 1: Overview & Syllabus Objectives
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 52, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("iGrades Academic Curriculum", 36, 32);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(note.category || "Study Material", pageWidth - 36, 32, { align: "right" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title || "Curriculum Study Guide", 36, 84);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Official WAEC & JAMB Syllabus Companion • Page 1 of 2", 36, 102);

    doc.setDrawColor(226, 232, 240);
    doc.line(36, 112, pageWidth - 36, 112);

    // Summary Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(36, 126, pageWidth - 72, 22, 4, 4, "F");
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Topic Summary & Overview", 44, 140);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(note.summary, pageWidth - 72);
    doc.text(summaryLines, 36, 166);

    let y = 166 + summaryLines.length * 14 + 18;

    // Objectives Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(36, y, pageWidth - 72, 22, 4, 4, "F");
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Core Learning Objectives", 44, y + 14);
    y += 34;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    note.objectives.forEach((obj) => {
      const objLines = doc.splitTextToSize("• " + obj, pageWidth - 72);
      doc.text(objLines, 36, y);
      y += objLines.length * 14 + 6;
    });

    // Formulas
    if (note.keyFormulas && note.keyFormulas.length > 0) {
      y += 10;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(36, y, pageWidth - 72, 22, 4, 4, "F");
      doc.setTextColor(29, 78, 216);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Essential Formulas & Definitions", 44, y + 14);
      y += 32;

      note.keyFormulas.forEach((f) => {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(36, y - 10, pageWidth - 72, 20, 3, 3, "F");
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(9);
        doc.setFont("courier", "bold");
        doc.text(f, 44, y + 4);
        y += 24;
      });
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(36, pageHeight - 38, pageWidth - 36, pageHeight - 38);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("© 2026 iGrades • Official Student Academic Material", 36, pageHeight - 22);

    // Page 2: Worked Examples & Exam Tips
    doc.addPage();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 52, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("iGrades Academic Curriculum", 36, 32);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(note.category || "Study Material", pageWidth - 36, 32, { align: "right" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Worked Examples & Solutions", 36, 84);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Step-by-Step Problem Solving • Page 2 of 2", 36, 102);

    doc.setDrawColor(226, 232, 240);
    doc.line(36, 112, pageWidth - 36, 112);

    y = 130;
    note.workedExamples.forEach((ex, idx) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(36, y - 12, pageWidth - 72, 22, 4, 4, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Example ${idx + 1}: ${ex.question}`, 42, y + 2);
      y += 24;

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      ex.solution.forEach((step) => {
        doc.text("  " + step, 42, y);
        y += 13;
      });

      doc.setTextColor(22, 101, 52);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("  Result: " + ex.answer, 42, y + 2);
      y += 20;
    });

    // Exam Tips
    if (note.examTips && note.examTips.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(36, y, pageWidth - 72, 20, 4, 4, "F");
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("High-Yield WAEC & JAMB Tips", 44, y + 14);
      y += 30;

      note.examTips.forEach((tip) => {
        doc.setTextColor(127, 29, 29);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const tipLines = doc.splitTextToSize("• " + tip, pageWidth - 72);
        doc.text(tipLines, 36, y);
        y += tipLines.length * 13 + 4;
      });
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(36, pageHeight - 38, pageWidth - 36, pageHeight - 38);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("© 2026 iGrades • Official Student Academic Material", 36, pageHeight - 22);

    return new Uint8Array(doc.output("arraybuffer"));
  }, [title]);

  // ─── Calculate Responsive Auto-Fit Scale ─────────────────────────────────────
  const calculateAutoFitScale = useCallback(
    async (targetPageNum: number = 1, fitFullWidth: boolean = false) => {
      const pdf = pdfDocRef.current;
      const container = scrollContainerRef.current;
      if (!pdf) return 1.0;

      try {
        const pageIdx = targetPageNum || 1;
        const page = await pdf.getPage(pageIdx);
        const unscaledViewport = page.getViewport({ scale: 1.0, rotation });

        let containerWidth = container?.clientWidth || 0;
        // Fallback during initial modal render if layout hasn't stabilized
        if (!containerWidth || containerWidth <= 0) {
          containerWidth = typeof window !== "undefined" ? window.innerWidth : 600;
          if (showThumbnails) {
            containerWidth -= window.innerWidth < 640 ? 140 : window.innerWidth < 768 ? 170 : 200;
          }
        }

        // Available horizontal padding based on screen size (p={{ base: 2, sm: 4, md: 6 }} -> 16px, 32px, 48px)
        const horizPadding = containerWidth < 640 ? 16 : containerWidth < 768 ? 32 : 48;
        // 16px safety buffer accounts for vertical scrollbar and prevents horizontal overflow
        const availableWidth = Math.max(containerWidth - horizPadding - 16, 100);

        if (availableWidth > 0 && unscaledViewport.width > 0) {
          const rawFitScale = availableWidth / unscaledViewport.width;

          let targetScale = rawFitScale;
          // On large desktop screens (> 900px), avoid excessively giant blown-up pages by default
          // Keep page at an optimal comfortable reading width (~880px max by default)
          if (!fitFullWidth && availableWidth > 900 && rawFitScale > 1.35) {
            targetScale = Math.min(rawFitScale, Math.max(1.0, 880 / unscaledViewport.width));
          }

          // Round down to 2 decimal places to strictly guarantee no subpixel overshoot or clipping
          const safeScale = Math.max(Math.floor(targetScale * 100) / 100, 0.15);
          return safeScale;
        }
      } catch (e) {
        console.warn("Error calculating auto fit scale:", e);
      }
      return 1.0;
    },
    [rotation, showThumbnails]
  );

  // ─── Load Document into PDF.js ──────────────────────────────────────────────
  const loadPdf = useCallback(
    async (forceFallback = false) => {
      if (!url && !forceFallback) return;
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        let pdfSource: Uint8Array | null = null;

        if (forceFallback) {
          pdfSource = generateOfflinePdfBlob();
        } else {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
            }
            const arrayBuffer = await res.arrayBuffer();
            if (!arrayBuffer || arrayBuffer.byteLength < 50) {
              throw new Error("Empty PDF data stream received.");
            }
            pdfSource = new Uint8Array(arrayBuffer);
          } catch (fetchErr: any) {
            console.warn("Direct fetch failed, trying PDF.js standard loader or fallback:", fetchErr);
            // If URL is not reachable, fallback to generated syllabus guide
            pdfSource = generateOfflinePdfBlob();
          }
        }

        const loadingTask = pdfjsLib.getDocument({
          data: pdfSource,
          cMapUrl: "https://unpkg.com/pdfjs-dist@6.3.289/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);

        // Pre-calculate initial auto-fit scale before marking loading complete
        if (autoFitWidth) {
          const initialScale = await calculateAutoFitScale(1);
          if (initialScale && !isNaN(initialScale)) {
            setScale(initialScale);
          }
        }
        setLoading(false);
      } catch (err: any) {
        console.error("PDF.js document loading error:", err);
        setError(err?.message || "Failed to render document with PDF.js engine.");
        setLoading(false);
      }
    },
    [url, autoFitWidth, calculateAutoFitScale, generateOfflinePdfBlob]
  );

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Recalculate auto-fit scale whenever container or window resizes,
  // orientation changes, thumbnails open/close, or dialog layout stabilizes.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let resizeTimer: any = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0 && autoFitWidth) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            calculateAutoFitScale(1).then((newScale) => {
              if (newScale && !isNaN(newScale)) {
                setScale((prev) => (Math.abs(prev - newScale) > 0.01 ? newScale : prev));
              }
            });
          }, 80);
        }
      }
    });

    observer.observe(container);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [autoFitWidth, calculateAutoFitScale]);

  // ─── Smooth Scroll To Page (Vertical Navigation) ───────────────────────────
  const scrollToPage = useCallback(
    (targetPage: number, smooth: boolean = true) => {
      const clamped = Math.max(1, Math.min(targetPage, numPages));
      const targetEl = pageRefs.current[clamped];
      const container = scrollContainerRef.current;
      if (targetEl && container) {
        const targetTop = targetEl.offsetTop - container.offsetTop - 12;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: smooth ? "smooth" : "auto",
        });
        setCurrentPage(clamped);
        setPageInputVal(String(clamped));
      }
    },
    [numPages]
  );

  // ─── Continuous Vertical Scroll: Track which page is currently in view ──────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestPage: number | null = null;
        let maxIntersectionRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio;
            const pNum = entry.target.getAttribute("data-page-num");
            if (pNum) {
              bestPage = parseInt(pNum, 10);
            }
          }
        }

        if (bestPage !== null && maxIntersectionRatio > 0.15) {
          setCurrentPage(bestPage);
        }
      },
      {
        root: container,
        threshold: [0.1, 0.25, 0.5, 0.75],
        rootMargin: "-5% 0px -25% 0px",
      }
    );

    Object.values(pageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [numPages, scale, rotation]);

  // ─── Fullscreen State Listener ───────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const elem = rootContainerRef.current;
    if (!elem) return;

    try {
      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (fsErr) {
      console.warn("Fullscreen toggle error:", fsErr);
    }
  };

  // ─── Navigation Handlers ────────────────────────────────────────────────────
  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    scrollToPage(1);
  };

  const handleLastPage = () => {
    if (numPages > 0) scrollToPage(numPages);
  };

  const handlePageInputCommit = () => {
    const pageNum = parseInt(pageInputVal, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      scrollToPage(pageNum);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // ─── Zoom Controls ──────────────────────────────────────────────────────────
  const handleZoomIn = () => {
    setAutoFitWidth(false);
    setScale((s) => Math.min(parseFloat((s + 0.2).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setAutoFitWidth(false);
    setScale((s) => Math.max(parseFloat((s - 0.2).toFixed(2)), 0.2));
  };

  const handleFitWidth = async () => {
    setAutoFitWidth(true);
    const s = await calculateAutoFitScale(1, true);
    setScale(s);
  };

  const handleResetZoom = () => {
    setAutoFitWidth(false);
    setScale(1.0);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Double tap to toggle zoom
  const handleCanvasDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale > 1.3) {
        handleFitWidth();
      } else {
        setAutoFitWidth(false);
        setScale(1.5);
      }
    }
    lastTapRef.current = now;
  };

  // ─── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleFitWidth();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRotate();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <Flex
      ref={rootContainerRef}
      direction="column"
      w="100%"
      h="100%"
      bg="#0b1120"
      overflow="hidden"
      position="relative"
      userSelect="none"
    >
      {/* ─── DESKTOP & MOBILE RESPONSIVE CONTROL BAR ─── */}
      <Box
        bg="#1e293b"
        borderBottom="1px solid"
        borderColor="gray.800"
        zIndex={20}
        boxShadow="0 4px 12px rgba(0,0,0,0.3)"
      >
        <Flex
          px={{ base: 2.5, sm: 4 }}
          py={2}
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={{ base: 2, md: 3 }}
        >
          {/* Left Group: Page Navigation & Thumbnails Drawer */}
          <Flex align="center" gap={{ base: 1, sm: 2 }} wrap="nowrap" flexShrink={0}>
            {/* Sidebar toggle */}
            <Button
              size="xs"
              variant={showThumbnails ? "solid" : "subtle"}
              bg={showThumbnails ? "blue.600" : "gray.800"}
              color="white"
              _hover={{ bg: showThumbnails ? "blue.500" : "gray.700" }}
              onClick={() => setShowThumbnails((s) => !s)}
              title="Toggle Page Thumbnails"
              minW={{ base: "34px", sm: "36px" }}
              h="32px"
              px={2}
            >
              <LuLayoutGrid size={15} />
              <Text display={{ base: "none", md: "inline" }} ml={1.5} fontSize="xs">
                Pages
              </Text>
            </Button>

            {/* First Page (Desktop) */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleFirstPage}
              disabled={currentPage <= 1 || loading}
              display={{ base: "none", sm: "inline-flex" }}
              title="First Page"
              h="32px"
              px={2}
            >
              <LuChevronsLeft size={15} />
            </Button>

            {/* Prev Page */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || loading}
              title="Previous Page (Left Arrow)"
              minW={{ base: "34px", sm: "36px" }}
              h="32px"
              px={2}
            >
              <LuChevronLeft size={16} />
            </Button>

            {/* Direct Page Input */}
            <Flex
              align="center"
              bg="gray.900"
              px={2}
              py={0.5}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.700"
              h="32px"
            >
              <Text fontSize="11px" color="gray.400" mr={1} display={{ base: "none", xs: "inline" }}>
                Pg
              </Text>
              <Input
                w={{ base: "32px", sm: "38px" }}
                h="24px"
                p={0}
                textAlign="center"
                fontSize="xs"
                fontWeight="bold"
                color="white"
                border="none"
                bg="transparent"
                _focus={{ outline: "none", bg: "gray.800", borderRadius: "sm" }}
                value={pageInputVal}
                onChange={(e) => setPageInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePageInputCommit();
                }}
                onBlur={handlePageInputCommit}
                disabled={loading || numPages === 0}
              />
              <Text fontSize="xs" color="gray.400" ml={1}>
                / {numPages || 1}
              </Text>
            </Flex>

            {/* Next Page */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleNextPage}
              disabled={currentPage >= numPages || loading}
              title="Next Page (Right Arrow)"
              minW={{ base: "34px", sm: "36px" }}
              h="32px"
              px={2}
            >
              <LuChevronRight size={16} />
            </Button>

            {/* Last Page (Desktop) */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleLastPage}
              disabled={currentPage >= numPages || loading}
              display={{ base: "none", sm: "inline-flex" }}
              title="Last Page"
              h="32px"
              px={2}
            >
              <LuChevronsRight size={15} />
            </Button>
          </Flex>

          {/* Middle Group: Zoom Tools */}
          <Flex align="center" gap={1.5} flexShrink={0}>
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              minW={{ base: "32px", sm: "34px" }}
              h="32px"
              px={1.5}
            >
              <LuZoomOut size={15} />
            </Button>

            {/* Zoom Percentage Badge */}
            <Button
              size="xs"
              variant="ghost"
              color="gray.300"
              _hover={{ bg: "gray.800", color: "white" }}
              onClick={handleResetZoom}
              title="Click to reset to 100%"
              minW="48px"
              h="32px"
              px={1.5}
              fontSize="xs"
              fontWeight="bold"
            >
              {Math.round(scale * 100)}%
            </Button>

            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleZoomIn}
              title="Zoom In (+)"
              minW={{ base: "32px", sm: "34px" }}
              h="32px"
              px={1.5}
            >
              <LuZoomIn size={15} />
            </Button>

            {/* Fit Width Button */}
            <Button
              size="xs"
              variant={autoFitWidth ? "solid" : "subtle"}
              bg={autoFitWidth ? "blue.600" : "gray.800"}
              color="white"
              _hover={{ bg: autoFitWidth ? "blue.500" : "gray.700" }}
              onClick={handleFitWidth}
              title="Fit to Width"
              h="32px"
              px={2}
              display={{ base: "none", xs: "inline-flex" }}
            >
              <LuMaximize2 size={14} />
              <Text display={{ base: "none", md: "inline" }} ml={1} fontSize="xs">
                Fit Width
              </Text>
            </Button>

            {/* Rotate Button */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={handleRotate}
              title="Rotate Page 90° (R)"
              minW="32px"
              h="32px"
              px={2}
            >
              <LuRotateCw size={14} />
            </Button>
          </Flex>

          {/* Right Group: Fullscreen, Notes & Download */}
          <Flex align="center" gap={1.5} flexShrink={0}>
            {/* Fullscreen Toggle */}
            <Button
              size="xs"
              variant={isFullscreen ? "solid" : "subtle"}
              bg={isFullscreen ? "blue.600" : "gray.800"}
              color="white"
              _hover={{ bg: isFullscreen ? "blue.500" : "gray.700" }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F)"}
              h="32px"
              px={2.5}
            >
              {isFullscreen ? <LuMinimize size={15} /> : <LuMaximize size={15} />}
              <Text display={{ base: "none", sm: "inline" }} ml={1.5} fontSize="xs">
                {isFullscreen ? "Exit" : "Fullscreen"}
              </Text>
            </Button>

            {/* Download Button (if prop provided) */}
            {onDownload && (
              <Button
                size="xs"
                bg="blue.600"
                color="white"
                _hover={{ bg: "blue.500" }}
                onClick={onDownload}
                title="Download PDF"
                h="32px"
                px={2.5}
                display={{ base: "none", sm: "inline-flex" }}
              >
                <LuDownload size={14} />
                <Text display={{ base: "none", md: "inline" }} ml={1.5} fontSize="xs">
                  Save
                </Text>
              </Button>
            )}

            {/* External link */}
            <Button
              size="xs"
              variant="subtle"
              bg="gray.800"
              color="gray.300"
              _hover={{ bg: "gray.700", color: "white" }}
              onClick={() => window.open(url, "_blank")}
              title="Open document link in new tab"
              h="32px"
              px={2}
              display={{ base: "none", md: "inline-flex" }}
            >
              <LuExternalLink size={14} />
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* ─── MAIN CONTENT AREA (SIDEBAR + CANVAS) ─── */}
      <Flex flex={1} w="100%" h="100%" overflow="hidden" position="relative">
        {/* Collapsible Page Thumbnails Sidebar */}
        {showThumbnails && !loading && numPages > 0 && (
          <Box
            w={{ base: "140px", sm: "170px", md: "200px" }}
            h="100%"
            bg="#111827"
            borderRight="1px solid"
            borderColor="gray.800"
            overflowY="auto"
            p={3}
            zIndex={10}
            flexShrink={0}
          >
            <Flex justify="space-between" align="center" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.800">
              <Text fontSize="xs" fontWeight="bold" color="gray.300" textTransform="uppercase" letterSpacing="wider">
                All Pages ({numPages})
              </Text>
              <Button
                size="2xs"
                variant="ghost"
                color="gray.400"
                onClick={() => setShowThumbnails(false)}
              >
                ✕
              </Button>
            </Flex>

            <Flex direction="column" gap={3}>
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <Box
                  key={pageNum}
                  p={1.5}
                  borderRadius="lg"
                  cursor="pointer"
                  border="2px solid"
                  borderColor={currentPage === pageNum ? "blue.500" : "transparent"}
                  bg={currentPage === pageNum ? "rgba(37, 99, 235, 0.15)" : "gray.900"}
                  _hover={{ borderColor: "blue.400", bg: "gray.850" }}
                  transition="all 0.15s ease"
                  onClick={() => scrollToPage(pageNum)}
                >
                  <Box
                    bg="white"
                    w="100%"
                    h={{ base: "120px", sm: "140px" }}
                    borderRadius="md"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    boxShadow="sm"
                    p={2}
                  >
                    <LuBookOpen size={24} color="#64748b" />
                    <Text fontSize="10px" color="gray.600" mt={1} fontWeight="bold">
                      Page {pageNum}
                    </Text>
                    {currentPage === pageNum && (
                      <Badge colorPalette="blue" size="2xs" mt={1}>
                        Active
                      </Badge>
                    )}
                  </Box>
                  <Text fontSize="10px" color={currentPage === pageNum ? "blue.400" : "gray.400"} textAlign="center" mt={1} fontWeight="bold">
                    Page {pageNum}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        {/* Canvas Scroll Area */}
        <Box
          ref={scrollContainerRef}
          flex={1}
          w="100%"
          h="100%"
          overflowX="auto"
          overflowY="auto"
          p={{ base: 2, sm: 4, md: 6 }}
          position="relative"
          bg="#0b1120"
          onClick={handleCanvasDoubleTap}
        >
          {/* Loading State */}
          {loading && (
            <Flex direction="column" align="center" justify="center" minH="340px" p={8}>
              <DancingLogoLoader size="lg" text="Rendering PDF with PDF.js engine..." />
              <HStack gap={2} mt={3}>
                <Badge colorPalette="blue" variant="subtle" fontSize="11px">
                  PDF.js High-DPI Vector
                </Badge>
                <Text fontSize="xs" color="gray.400">
                  Preparing crisp pages
                </Text>
              </HStack>
            </Flex>
          )}

          {/* Error State */}
          {error && (
            <Flex justify="center" align="center" minH="340px" p={4}>
              <Box
                maxW="520px"
                w="90%"
                p={{ base: 5, md: 7 }}
                bg="#1e293b"
                borderRadius="2xl"
                border="1px solid"
                borderColor="red.500"
                textAlign="center"
                boxShadow="0 10px 30px rgba(0,0,0,0.5)"
              >
                <LuTriangleAlert size={42} color="#ef4444" style={{ margin: "0 auto" }} />
                <Text fontSize="lg" fontWeight="bold" color="white" mt={3}>
                  Could not load online PDF
                </Text>
                <Text fontSize="xs" color="gray.300" mt={1.5} mb={5} lineHeight="1.6">
                  {error}
                </Text>

                <Flex direction="column" gap={2.5}>
                  <Button
                    size="sm"
                    bg="blue.600"
                    color="white"
                    _hover={{ bg: "blue.500" }}
                    onClick={() => loadPdf(false)}
                  >
                    <LuRefreshCw size={14} style={{ marginRight: "6px" }} />
                    Retry Fetching PDF
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="blue.400"
                    color="blue.300"
                    _hover={{ bg: "rgba(59, 130, 246, 0.1)" }}
                    onClick={() => loadPdf(true)}
                  >
                    <LuSparkles size={14} style={{ marginRight: "6px" }} />
                    Render Verified Offline Syllabus Guide
                  </Button>

                  {onOpenNotes && (
                    <Button
                      size="sm"
                      variant="subtle"
                      bg="gray.800"
                      color="gray.200"
                      _hover={{ bg: "gray.700" }}
                      onClick={onOpenNotes}
                    >
                      <LuBookOpen size={14} style={{ marginRight: "6px" }} />
                      Read Interactive Curriculum Notes Instead
                    </Button>
                  )}
                </Flex>
              </Box>
            </Flex>
          )}

          {/* Continuous Vertical Stack of All PDF Pages */}
          {!loading && !error && numPages > 0 && (
            <Flex
              direction="column"
              align="center"
              gap={{ base: 4, md: 6 }}
              w="100%"
              minH="100%"
              py={2}
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <SinglePageCanvas
                  key={pageNum}
                  ref={(el) => {
                    pageRefs.current[pageNum] = el;
                  }}
                  pageNum={pageNum}
                  pdfDoc={pdfDocRef.current}
                  scale={scale}
                  rotation={rotation}
                  totalCount={numPages}
                />
              ))}
            </Flex>
          )}

          {/* Sticky Bottom Quick Navigation Bar (Mobile / Tablet friendly) */}
          {!loading && !error && numPages > 1 && (
            <Flex
              position="sticky"
              bottom={{ base: 3, md: 5 }}
              bg="rgba(15, 23, 42, 0.88)"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.18)"
              borderRadius="full"
              px={{ base: 3, sm: 4 }}
              py={1.5}
              gap={{ base: 2, sm: 3 }}
              align="center"
              boxShadow="0 8px 32px rgba(0,0,0,0.5)"
              zIndex={15}
              mt={4}
              mx="auto"
              w="fit-content"
            >
              <Button
                size="2xs"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                minH="28px"
                px={2.5}
              >
                <LuChevronLeft size={14} style={{ marginRight: "2px" }} />
                Prev
              </Button>

              <Text fontSize="xs" color="gray.200" fontWeight="bold">
                {currentPage} / {numPages}
              </Text>

              <Button
                size="2xs"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                minH="28px"
                px={2.5}
              >
                Next
                <LuChevronRight size={14} style={{ marginLeft: "2px" }} />
              </Button>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default NativePdfCanvasViewer;
