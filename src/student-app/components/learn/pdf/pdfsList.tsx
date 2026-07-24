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
  Image,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PDFsResource {
  id: string;
  title: string;
  url: string;
  type: string;
  topic_id?: string;
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
  const [pdfLoading, setPdfLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePdfClick = (pdfFile: PDFsResource) => {
    setSelectedPDF(pdfFile);
    setIsDialogOpen(true);
    setPdfLoading(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPDF(null);
    setPdfLoading(false);
  };

  const getPdfUrl = (pdfFile: PDFsResource) => {
    if (pdfFile.url.startsWith("http")) {
      return pdfFile.url;
    }
    if (pdfFile.url.startsWith("supabase://")) {
      const path = pdfFile.url.replace("supabase://", "");
      const { data } = supabase.storage.from("pdfs").getPublicUrl(path);
      return data.publicUrl;
    }
    return pdfFile.url;
  };

  const getPdfThumbnailUrl = (pdfFile: PDFsResource) => {
    const encodedTitle = encodeURIComponent(pdfFile.title);
    return `https://placehold.co/320x180/3B82F6/white?text=📄+${encodedTitle}`;
  };

  const handleIframeLoad = () => {
    setPdfLoading(false);
  };

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
        {topic.name} PDF
      </Heading>

      {/* List of PDFs with thumbnails */}
      {pdf.length === 0 ? (
        <Text fontSize="sm" color="gray.400" textAlign="center" mt={8}>
          No PDFs available for this topic yet.
        </Text>
      ) : (
        <Box py={6}>
          {pdf.map((pdfFile) => (
            <Flex
              key={pdfFile.id}
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              mb={4}
              p={2}
              borderRadius="2xl"
              overflow="hidden"
              bg="white"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              _hover={{
                boxShadow: "md",
                transform: "translateY(-2px)",
              }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => handlePdfClick(pdfFile)}
            >
              <Flex>
                {/* PDF Thumbnail */}
                <Box flexShrink={0} w={{ base: 28, md: 40 }} h="auto" p={2}>
                  <Image
                    src={getPdfThumbnailUrl(pdfFile)}
                    alt={pdfFile.title}
                    objectFit="contain"
                    rounded={"xl"}
                  />
                </Box>

                {/* PDF Info */}
                <Box p={4}>
                  <Heading
                    as="h4"
                    fontWeight="500"
                    fontSize={{ base: "md", md: "lg" }}
                    mb={2}
                  >
                    {pdfFile.title}
                  </Heading>
                  {pdfFile.file_size && (
                    <Text fontSize="xs" color="gray.500">
                      {formatFileSize(pdfFile.file_size)}
                    </Text>
                  )}
                </Box>
              </Flex>
              <Flex
                align="center"
                gap={{ base: 3, md: 6 }}
                px={{ base: 2, md: 4 }}
                py={{ base: 4, md: 2 }}
              >
                <Button
                  bg="white"
                  border="1px solid"
                  borderColor="primaryColor"
                  color="primaryColor"
                  fontSize={{ base: "xs", md: "xs" }}
                  w={{ base: "28", md: "32" }}
                  p={{ base: 2, md: 3 }}
                  rounded={{ base: "lg", md: "3xl" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePdfClick(pdfFile);
                  }}
                >
                  Preview
                </Button>

                <Link
                  href={getPdfUrl(pdfFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  bg="primaryColor"
                  color="white"
                  textAlign="center"
                  display="inline-block"
                  textDecoration="none"
                  fontSize={{ base: "xs", md: "xs" }}
                  w={{ base: "28", md: "32" }}
                  p={{ base: 2, md: 3 }}
                  rounded={{ base: "lg", md: "3xl" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </Link>
              </Flex>
            </Flex>
          ))}
        </Box>
      )}

      {/* ─── FIXED DOCK FULL SCREEN PDF VIEWER DIALOG ─── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
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
            >
              {/* Header block with absolute alignment layout keys */}
              <Dialog.Header 
                px={6} 
                py={4} 
                borderBottom="1px solid" 
                borderColor="gray.100" 
                position="relative"
              >
                <Dialog.Title fontSize="md" fontWeight="bold" pr={12} truncate>
                  {selectedPDF?.title}
                </Dialog.Title>
                <CloseButton
                  size="sm"
                  position="absolute"
                  right="16px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={handleCloseDialog}
                  cursor="pointer"
                />
              </Dialog.Header>

              <Dialog.Body p={0} flex={1} position="relative" bg="gray.800">
                {selectedPDF && (
                  <Box w="100%" h="100%" position="relative">
                    {pdfLoading && (
                      <Flex
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        align="center"
                        justify="center"
                        bg="rgba(255, 255, 255, 0.9)"
                        zIndex={10}
                      >
                        <Spinner size="xl" color="blue.500" />
                        <Text ml={3} fontWeight="500">Loading PDF View Documents...</Text>
                      </Flex>
                    )}

                    {/* True Edge-to-Edge Fluid Frame Canvas Integration */}
                    <iframe
                      ref={iframeRef}
                      src={`${getPdfUrl(selectedPDF)}#toolbar=1&view=FitH`}
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