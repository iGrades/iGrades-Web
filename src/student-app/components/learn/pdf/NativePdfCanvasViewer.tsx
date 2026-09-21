import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  Badge,
  HStack,
} from "@chakra-ui/react";
import {
  LuZoomIn,
  LuZoomOut,
  LuChevronLeft,
  LuChevronRight,
  LuMaximize,
  LuRotateCw,
  LuExternalLink,
  LuDownload,
  LuTriangleAlert,
  LuRefreshCw,
} from "react-icons/lu";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import * as pdfjsLib from "pdfjs-dist";

// Point worker to same-origin public file
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfViewerProps {
  url: string;
  title?: string;
  onDownload?: () => void;
  onOpenNotes?: () => void;
}

export const NativePdfCanvasViewer: React.FC<PdfViewerProps> = ({
  url,
  title: _title,
  onDownload,
  onOpenNotes,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pdfDocRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Document
  const loadPdf = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      // Fetch binary to avoid CORS issues and pass Uint8Array
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength < 100) {
        throw new Error("File content is empty or invalid PDF.");
      }

      const uint8 = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8,
        cMapUrl: "https://unpkg.com/pdfjs-dist@6.3.289/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setLoading(false);
    } catch (err: any) {
      console.error("PDF.js document loading error:", err);
      setError(err?.message || "Failed to render document.");
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    loadPdf();
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Task already completed or cannot be cancelled
        }
      }
    };
  }, [loadPdf]);

  // Render Page onto Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdf = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Task already completed or cancelled
        }
      }

      setRendering(true);

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale, rotation });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Device pixel ratio for ultra-crisp text rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        setRendering(false);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
        setRendering(false);
      }
    },
    [scale, rotation]
  );

  useEffect(() => {
    if (!loading && pdfDocRef.current && numPages > 0) {
      renderPage(currentPage);
    }
  }, [loading, currentPage, scale, rotation, numPages, renderPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(s + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(s - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleFitWidth = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      // standard page width ratio
      setScale(Math.max(containerWidth / 620, 0.8));
    }
  };

  return (
    <Flex direction="column" w="100%" h="100%" bg="#0f172a" overflow="hidden" position="relative">
      {/* Viewer Control Bar */}
      <Flex
        px={4}
        py={2}
        bg="#1e293b"
        borderBottom="1px solid"
        borderColor="gray.700"
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={2}
        zIndex={15}
      >
        {/* Page navigation */}
        <HStack gap={2}>
          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
          >
            <LuChevronLeft size={14} />
          </Button>

          <Flex align="center" gap={1} px={2} bg="gray.900" py={1} borderRadius="md">
            <Text fontSize="xs" fontWeight="bold" color="white">
              {currentPage}
            </Text>
            <Text fontSize="xs" color="gray.400">
              / {numPages || 1}
            </Text>
          </Flex>

          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
          >
            <LuChevronRight size={14} />
          </Button>

          {rendering && (
            <Badge colorPalette="blue" variant="subtle" fontSize="10px">
              Rendering...
            </Badge>
          )}
        </HStack>

        {/* Zoom and Display tools */}
        <HStack gap={1.5}>
          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <LuZoomOut size={13} />
          </Button>

          <Text fontSize="xs" color="gray.300" minW="42px" textAlign="center" fontWeight="medium">
            {Math.round(scale * 100)}%
          </Text>

          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <LuZoomIn size={13} />
          </Button>

          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handleFitWidth}
            title="Fit to Width"
          >
            <LuMaximize size={13} />
          </Button>

          <Button
            size="xs"
            variant="subtle"
            bg="gray.800"
            color="white"
            _hover={{ bg: "gray.700" }}
            onClick={handleRotate}
            title="Rotate Page"
          >
            <LuRotateCw size={13} />
          </Button>
        </HStack>

        {/* Action Shortcuts */}
        <HStack gap={2}>
          <Button
            size="xs"
            variant="outline"
            borderColor="gray.600"
            color="gray.200"
            _hover={{ bg: "gray.800" }}
            onClick={() => window.open(url, "_blank")}
          >
            <LuExternalLink size={12} style={{ marginRight: "4px" }} />
            Open Tab
          </Button>

          {onDownload && (
            <Button
              size="xs"
              bg="blue.600"
              color="white"
              _hover={{ bg: "blue.500" }}
              onClick={onDownload}
            >
              <LuDownload size={12} style={{ marginRight: "4px" }} />
              Download
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Main Canvas Scroll Area */}
      <Box
        ref={containerRef}
        flex={1}
        overflow="auto"
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent={loading || error ? "center" : "flex-start"}
        position="relative"
        bg="#0b1120"
      >
        {loading && (
          <Flex direction="column" align="center" justify="center" p={8}>
            <DancingLogoLoader size="lg" text="Loading study guide pages..." />
            <Text fontSize="xs" color="gray.400" mt={2}>
              Rendering crisp vector document
            </Text>
          </Flex>
        )}

        {error && (
          <Box
            maxW="480px"
            p={6}
            bg="gray.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="red.500"
            textAlign="center"
          >
            <LuTriangleAlert size={36} color="#ef4444" style={{ margin: "0 auto" }} />
            <Text fontSize="md" fontWeight="bold" color="white" mt={3}>
              Could not display embedded PDF
            </Text>
            <Text fontSize="xs" color="gray.300" mt={1} mb={4}>
              {error}
            </Text>
            <HStack justify="center" gap={3}>
              <Button size="sm" bg="blue.600" color="white" onClick={loadPdf}>
                <LuRefreshCw size={14} style={{ marginRight: "6px" }} />
                Retry Loading
              </Button>
              {onOpenNotes && (
                <Button size="sm" variant="outline" color="white" onClick={onOpenNotes}>
                  View Notes Instead
                </Button>
              )}
            </HStack>
          </Box>
        )}

        {/* Canvas for rendering pages */}
        <Box
          display={loading || error ? "none" : "block"}
          boxShadow="0 10px 40px rgba(0,0,0,0.6)"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
          transition="transform 0.15s ease-out"
          my={2}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </Box>

        {/* Page indicator pill at bottom */}
        {!loading && !error && numPages > 1 && (
          <Flex
            position="sticky"
            bottom={4}
            bg="rgba(15, 23, 42, 0.85)"
            backdropFilter="blur(8px)"
            border="1px solid rgba(255,255,255,0.15)"
            borderRadius="full"
            px={4}
            py={1.5}
            gap={3}
            align="center"
            boxShadow="0 4px 20px rgba(0,0,0,0.4)"
            zIndex={10}
            mt={4}
          >
            <Button
              size="2xs"
              variant="ghost"
              color="white"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              Prev Page
            </Button>
            <Text fontSize="xs" color="gray.300" fontWeight="bold">
              Page {currentPage} of {numPages}
            </Text>
            <Button
              size="2xs"
              variant="ghost"
              color="white"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
            >
              Next Page
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default NativePdfCanvasViewer;
