"use client";

import {
  Heading,
  Box,
  Text,
  Flex,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Badge,
} from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import {
  LuArrowLeft,
  LuDownload,
  LuExternalLink,
  LuBookOpen,
  LuFileText,
  LuCircleCheck,
  LuSparkles,
} from "react-icons/lu";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import PdfCustomThumbnail from "./PdfCustomThumbnail";
import { getCurriculumNote } from "./curriculumStudyNotes";

interface PDFsResource {
  id: string;
  title: string;
  url: string;
  type: string;
  topic_id?: string;
  description?: string;
  file_size?: number;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
}

type Props = {
  topic: Topic;
  pdf: PDFsResource[];
  onBack: () => void;
};

const PdfList = ({ topic, pdf, onBack }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFsResource | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "pdf">("pdf");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Curriculum Guide";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPdfUrl = useCallback((pdfFile: PDFsResource): string => {
    if (!pdfFile?.url) return "";
    if (pdfFile.url.startsWith("http")) {
      return pdfFile.url;
    }
    if (pdfFile.url.startsWith("supabase://")) {
      const path = pdfFile.url.replace("supabase://", "");
      const { data } = supabase.storage.from("test-resource").getPublicUrl(path);
      return data.publicUrl;
    }
    return pdfFile.url;
  }, []);

  // Cleanup object URL on unmount or when changing PDF
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const loadPdfBlob = useCallback(async (pdfFile: PDFsResource) => {
    const rawUrl = getPdfUrl(pdfFile);
    if (!rawUrl) return;

    setPdfLoading(true);
    setLoadError(null);

    // Safety timeout: prevent indefinite loader
    const safetyTimer = setTimeout(() => {
      setPdfLoading(false);
    }, 2500);

    try {
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to load PDF (${response.status})`);
      }
      const blob = await response.blob();

      // Check if received valid content
      if (blob.size < 100) {
        console.warn("Received empty or corrupt blob, defaulting to curriculum notes view");
        setActiveTab("notes");
      } else {
        const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setPdfBlobUrl(objectUrl);
      }
    } catch (err: any) {
      console.warn("Could not create blob URL for PDF, fallback to direct URL:", err?.message);
      // Even if fetch blob fails, fallback to direct URL and do not get stuck
      setLoadError("Notice: Using direct document stream");
    } finally {
      clearTimeout(safetyTimer);
      setPdfLoading(false);
    }
  }, [getPdfUrl]);

  const handlePdfClick = (pdfFile: PDFsResource, initialTab: "notes" | "pdf" = "pdf") => {
    setSelectedPDF(pdfFile);
    setActiveTab(initialTab);
    setIsDialogOpen(true);
    loadPdfBlob(pdfFile);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPDF(null);
    setPdfLoading(false);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };

  const handleDownloadPdf = async (pdfFile: PDFsResource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDownloading(true);

    try {
      const directUrl = getPdfUrl(pdfFile);
      const res = await fetch(directUrl);
      if (!res.ok) throw new Error("Could not fetch file");

      const blob = await res.blob();
      const cleanFileName = `${pdfFile.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Study_Guide.pdf`;
      const tempUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));

      const link = document.createElement("a");
      link.href = tempUrl;
      link.download = cleanFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(tempUrl);
    } catch (err) {
      console.error("Download error:", err);
      // Direct window open fallback
      window.open(getPdfUrl(pdfFile), "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleIframeLoad = () => {
    setPdfLoading(false);
  };

  const currentNote = selectedPDF ? getCurriculumNote(selectedPDF.title, selectedPDF.description) : null;

  return (
    <Box>
      {/* Header with back button */}
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={5}
        mx={2}
      >
        <LuArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        {topic.name} — Study Guides & PDFs
      </Heading>

      {/* List of PDFs with Custom Thumbnails */}
      {pdf.length === 0 ? (
        <Box textAlign="center" py={12} bg="gray.50" rounded="2xl" border="1px dashed" borderColor="gray.300" my={4}>
          <LuBookOpen size={40} style={{ margin: "0 auto", color: "#94a3b8" }} />
          <Text fontSize="md" fontWeight="bold" color="gray.600" mt={3}>
            No study guides available for this topic yet
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            New curriculum materials are frequently synchronized.
          </Text>
        </Box>
      ) : (
        <Box py={4}>
          {pdf.map((pdfFile) => (
            <Flex
              key={pdfFile.id}
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              mb={4}
              p={3}
              borderRadius="2xl"
              bg="white"
              boxShadow="0 2px 8px rgba(0,0,0,0.04)"
              border="1px solid"
              borderColor="gray.200"
              _hover={{
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                transform: "translateY(-2px)",
                borderColor: "blue.200",
              }}
              transition="all 0.25s ease"
              cursor="pointer"
              onClick={() => handlePdfClick(pdfFile, "pdf")}
            >
              <Flex gap={4} align="center" flex={1}>
                {/* Custom Vector Thumbnail */}
                <Box
                  flexShrink={0}
                  w={{ base: "100%", sm: "140px", md: "170px" }}
                  h={{ base: "90px", sm: "100px", md: "105px" }}
                >
                  <PdfCustomThumbnail
                    title={pdfFile.title}
                    description={pdfFile.description}
                  />
                </Box>

                {/* PDF Info */}
                <Box flex={1} minW={0} pr={2}>
                  <Flex align="center" gap={2} mb={1}>
                    <Badge colorScheme="blue" fontSize="10px" px={2} py={0.5} borderRadius="md">
                      CURRICULUM NOTE
                    </Badge>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {formatFileSize(pdfFile.file_size)}
                    </Text>
                  </Flex>

                  <Heading
                    as="h4"
                    fontWeight="700"
                    fontSize={{ base: "sm", md: "md" }}
                    color="gray.800"
                    lineHeight="1.3"
                    noOfLines={2}
                  >
                    {pdfFile.title}
                  </Heading>

                  {pdfFile.description && (
                    <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>
                      {pdfFile.description}
                    </Text>
                  )}
                </Box>
              </Flex>

              {/* Action Buttons */}
              <Flex
                align="center"
                gap={2}
                px={{ base: 2, md: 4 }}
                py={{ base: 2, md: 0 }}
                mt={{ base: 2, md: 0 }}
                justify={{ base: "flex-end", md: "center" }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="blue.500"
                  color="blue.600"
                  _hover={{ bg: "blue.50" }}
                  fontSize="xs"
                  fontWeight="600"
                  rounded="xl"
                  px={4}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePdfClick(pdfFile, "notes");
                  }}
                >
                  <LuBookOpen size={14} style={{ marginRight: "4px" }} />
                  Read Notes
                </Button>

                <Button
                  size="sm"
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: "blue.700" }}
                  fontSize="xs"
                  fontWeight="600"
                  rounded="xl"
                  px={4}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePdfClick(pdfFile, "pdf");
                  }}
                >
                  <LuFileText size={14} style={{ marginRight: "4px" }} />
                  View PDF
                </Button>

                <Button
                  size="sm"
                  variant="subtle"
                  colorScheme="gray"
                  fontSize="xs"
                  fontWeight="600"
                  rounded="xl"
                  px={3}
                  title="Download verified PDF"
                  onClick={(e) => handleDownloadPdf(pdfFile, e)}
                  loading={isDownloading}
                >
                  <LuDownload size={14} />
                </Button>
              </Flex>
            </Flex>
          ))}
        </Box>
      )}

      {/* ─── ENHANCED DUAL-VIEW FULLSCREEN PDF & STUDY VIEWER ─── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(details) => {
          if (!details.open) handleCloseDialog();
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={0} m={0}>
            <Dialog.Content
              maxW="100vw"
              w="100vw"
              h="100vh"
              m={0}
              borderRadius={0}
              display="flex"
              flexDirection="column"
              bg="white"
            >
              {/* Header with Navigation & Actions */}
              <Dialog.Header
                px={{ base: 4, md: 6 }}
                py={3}
                borderBottom="1px solid"
                borderColor="gray.200"
                bg="white"
                position="relative"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  w="100%"
                  gap={3}
                  wrap={{ base: "wrap", md: "nowrap" }}
                >
                  {/* Title & Badge */}
                  <Flex align="center" gap={3} minW={0}>
                    <Badge colorScheme="blue" fontSize="11px" px={2.5} py={1} borderRadius="md">
                      STUDY GUIDE
                    </Badge>
                    <Dialog.Title fontSize={{ base: "sm", md: "md" }} fontWeight="bold" truncate>
                      {selectedPDF?.title}
                    </Dialog.Title>
                  </Flex>

                  {/* Mode Switch Tabs */}
                  <Flex
                    bg="gray.100"
                    p={1}
                    borderRadius="xl"
                    gap={1}
                    mx="auto"
                  >
                    <Button
                      size="xs"
                      variant={activeTab === "notes" ? "solid" : "ghost"}
                      bg={activeTab === "notes" ? "white" : "transparent"}
                      color={activeTab === "notes" ? "blue.600" : "gray.600"}
                      boxShadow={activeTab === "notes" ? "sm" : "none"}
                      fontWeight="bold"
                      borderRadius="lg"
                      onClick={() => setActiveTab("notes")}
                    >
                      <LuBookOpen size={13} style={{ marginRight: "4px" }} />
                      Curriculum Notes
                    </Button>

                    <Button
                      size="xs"
                      variant={activeTab === "pdf" ? "solid" : "ghost"}
                      bg={activeTab === "pdf" ? "white" : "transparent"}
                      color={activeTab === "pdf" ? "blue.600" : "gray.600"}
                      boxShadow={activeTab === "pdf" ? "sm" : "none"}
                      fontWeight="bold"
                      borderRadius="lg"
                      onClick={() => setActiveTab("pdf")}
                    >
                      <LuFileText size={13} style={{ marginRight: "4px" }} />
                      PDF Document
                    </Button>
                  </Flex>

                  {/* Top Action Tools & Close */}
                  <Flex align="center" gap={2}>
                    {selectedPDF && (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.700"
                          _hover={{ bg: "gray.50" }}
                          rounded="lg"
                          onClick={() => window.open(getPdfUrl(selectedPDF), "_blank")}
                          title="Open original document in new browser tab"
                        >
                          <LuExternalLink size={13} style={{ marginRight: "4px" }} />
                          Popout
                        </Button>

                        <Button
                          size="xs"
                          bg="blue.600"
                          color="white"
                          _hover={{ bg: "blue.700" }}
                          rounded="lg"
                          onClick={() => handleDownloadPdf(selectedPDF)}
                          loading={isDownloading}
                        >
                          <LuDownload size={13} style={{ marginRight: "4px" }} />
                          Download PDF
                        </Button>
                      </>
                    )}

                    <CloseButton
                      size="sm"
                      onClick={handleCloseDialog}
                      cursor="pointer"
                      ml={2}
                    />
                  </Flex>
                </Flex>
              </Dialog.Header>

              {/* Body */}
              <Dialog.Body p={0} flex={1} position="relative" bg={activeTab === "pdf" ? "gray.900" : "gray.50"} overflowY="auto">
                {selectedPDF && activeTab === "notes" && currentNote && (
                  <Box maxW="850px" mx="auto" p={{ base: 4, md: 8 }}>
                    {/* Header Card */}
                    <Box
                      bg="white"
                      p={{ base: 5, md: 7 }}
                      borderRadius="2xl"
                      boxShadow="0 4px 20px rgba(0,0,0,0.06)"
                      border="1px solid"
                      borderColor="gray.200"
                      mb={6}
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge colorScheme="purple" fontSize="11px" px={2.5} py={0.5} borderRadius="md">
                          {currentNote.category}
                        </Badge>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          {currentNote.level}
                        </Text>
                      </Flex>

                      <Heading as="h2" size="lg" color="gray.900" mb={3}>
                        {selectedPDF.title}
                      </Heading>

                      <Text color="gray.700" fontSize="sm" lineHeight="1.7">
                        {currentNote.summary}
                      </Text>
                    </Box>

                    {/* Syllabus Objectives */}
                    <Box
                      bg="white"
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      boxShadow="0 4px 16px rgba(0,0,0,0.04)"
                      border="1px solid"
                      borderColor="gray.200"
                      mb={6}
                    >
                      <Heading as="h3" size="sm" color="blue.600" mb={4} display="flex" alignContent="center" gap={2}>
                        <LuCircleCheck size={18} />
                        Key Learning Objectives
                      </Heading>

                      <Flex direction="column" gap={3}>
                        {currentNote.objectives.map((obj, i) => (
                          <Flex key={i} align="flex-start" gap={3}>
                            <Box
                              w="6px"
                              h="6px"
                              borderRadius="full"
                              bg="blue.500"
                              mt="7px"
                              flexShrink={0}
                            />
                            <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                              {obj}
                            </Text>
                          </Flex>
                        ))}
                      </Flex>
                    </Box>

                    {/* Key Formulas */}
                    <Box
                      bg="blue.50"
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="blue.200"
                      mb={6}
                    >
                      <Heading as="h3" size="sm" color="blue.800" mb={3} display="flex" alignContent="center" gap={2}>
                        <LuSparkles size={18} />
                        Essential Formulas & Rules
                      </Heading>

                      <Flex direction="column" gap={2.5}>
                        {currentNote.keyFormulas.map((formula, i) => (
                          <Box
                            key={i}
                            bg="white"
                            p={3}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="blue.100"
                            fontFamily="mono"
                            fontSize="xs"
                            fontWeight="bold"
                            color="blue.900"
                          >
                            {formula}
                          </Box>
                        ))}
                      </Flex>
                    </Box>

                    {/* Step-by-Step Worked Examples */}
                    <Box mb={6}>
                      <Heading as="h3" size="sm" color="gray.800" mb={4}>
                        Step-by-Step Worked Examples
                      </Heading>

                      <Flex direction="column" gap={4}>
                        {currentNote.workedExamples.map((ex, i) => (
                          <Box
                            key={i}
                            bg="white"
                            p={{ base: 4, md: 6 }}
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 2px 10px rgba(0,0,0,0.03)"
                          >
                            <Text fontWeight="bold" color="gray.800" fontSize="sm" mb={3}>
                              Example {i + 1}: {ex.question}
                            </Text>

                            <Box bg="gray.50" p={4} borderRadius="xl" mb={3}>
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                                DETAILED STEP-BY-STEP SOLUTION:
                              </Text>
                              {ex.solution.map((step, sIdx) => (
                                <Text key={sIdx} fontSize="xs" color="gray.700" py={0.5} fontFamily="monospace">
                                  {step}
                                </Text>
                              ))}
                            </Box>

                            <Flex
                              align="center"
                              gap={2}
                              bg="green.50"
                              p={2.5}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="green.200"
                            >
                              <LuCircleCheck size={16} color="#16a34a" />
                              <Text fontSize="xs" fontWeight="bold" color="green.800">
                                {ex.answer}
                              </Text>
                            </Flex>
                          </Box>
                        ))}
                      </Flex>
                    </Box>

                    {/* Exam Tips & Pitfalls */}
                    <Box
                      bg="red.50"
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="red.200"
                      mb={8}
                    >
                      <Heading as="h3" size="sm" color="red.800" mb={3}>
                        High-Yield WAEC & JAMB Exam Tips
                      </Heading>
                      <Flex direction="column" gap={2}>
                        {currentNote.examTips.map((tip, i) => (
                          <Text key={i} fontSize="xs" color="red.900" lineHeight="1.6">
                            ⚠️ {tip}
                          </Text>
                        ))}
                      </Flex>
                    </Box>
                  </Box>
                )}

                {selectedPDF && activeTab === "pdf" && (
                  <Box w="100%" h="100%" position="relative" bg="gray.900">
                    {pdfLoading && (
                      <Flex
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        align="center"
                        justify="center"
                        bg="rgba(15, 23, 42, 0.9)"
                        zIndex={10}
                      >
                        <DancingLogoLoader size="lg" text="Opening verified study guide..." />
                      </Flex>
                    )}

                    {/* Modern Embedded PDF Object with Iframe Fallback */}
                    <object
                      data={pdfBlobUrl || `${getPdfUrl(selectedPDF)}#toolbar=1&view=FitH`}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: "block",
                      }}
                      onLoad={handleIframeLoad}
                    >
                      <iframe
                        ref={iframeRef}
                        src={pdfBlobUrl || `${getPdfUrl(selectedPDF)}#toolbar=1&view=FitH`}
                        width="100%"
                        height="100%"
                        style={{
                          border: "none",
                          display: "block",
                          width: "100%",
                          height: "100%",
                        }}
                        onLoad={handleIframeLoad}
                        title={selectedPDF.title}
                      />
                    </object>

                    {/* Bottom Floating Bar to Toggle Notes if PDF is uncomfortable to read on mobile */}
                    <Box
                      position="absolute"
                      bottom="16px"
                      left="50%"
                      transform="translateX(-50%)"
                      zIndex={5}
                      bg="rgba(15, 23, 42, 0.85)"
                      backdropFilter="blur(8px)"
                      px={4}
                      py={2}
                      borderRadius="full"
                      boxShadow="0 4px 20px rgba(0,0,0,0.4)"
                      border="1px solid rgba(255,255,255,0.15)"
                    >
                      <Flex align="center" gap={3}>
                        {loadError && (
                          <Text fontSize="10px" color="yellow.300">
                            {loadError}
                          </Text>
                        )}
                        <Text fontSize="xs" color="white" fontWeight="medium">
                          Prefer responsive text notes?
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          borderRadius="full"
                          px={3}
                          onClick={() => setActiveTab("notes")}
                        >
                          <LuBookOpen size={12} style={{ marginRight: "4px" }} />
                          Switch to Notes
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default PdfList;
