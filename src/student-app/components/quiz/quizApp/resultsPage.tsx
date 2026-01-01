import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { toJpeg } from 'html-to-image';
import jsPDF from "jspdf";
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  Card,
  CardBody,
  Stack,
  Badge,
  HStack,
  VStack,
  Dialog,
  Portal,
  Center,
} from "@chakra-ui/react";
import logo from "@/assets/logo.png"; 
import { toaster } from "@/components/ui/toaster";
import { HiClipboardList } from "react-icons/hi";
import { LuArrowDownToLine } from "react-icons/lu";
import { FiUpload } from "react-icons/fi";
import { TbClipboardList } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";
import type { ResultsPageProps } from "./types";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import resultWobble from "@/assets/result_wobble.png";
import resultCourseBg from "@/assets/result_text_bg.png";
import SummaryPage from "./summaryPage";
import { ShareCard } from "./shareCard";
import { QuizReportPage } from "./quizReport";

export const ResultsPage = ({
  quizResults,
  quizData,
  setShowSideBar,
  setShowNavBar,
}: ResultsPageProps) => {
  const [showSummaryPage, setShowSummaryPage] = useState(false);
  const [showQuizReport, setShowQuizReport] = useState(false);
  // const [showDownloadReportPage, setShowDownloadReportPage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { authdStudent } = useAuthdStudentData();
  const { setCurrentStudentPage } = useNavigationStore();

  const totalCorrect = Object.values(quizResults.subjectResults).reduce(
    (acc, r) => acc + r.correct,
    0,
  );
  const totalQuestions = Object.values(quizResults.subjectResults).reduce(
    (acc, r) => acc + r.total,
    0,
  );

  const formattedDate = new Date(quizResults.timestamp).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const handleSocialShare = async () => {
    const node = document.getElementById('quiz-report-card');
    if (!node) return;
  
    setIsSharing(true); // Triggers the "faint" loading state
  
    try {
      const dataUrl = await htmlToImage.toPng(node, { 
        quality: 1, 
        pixelRatio: 2, 
        cacheBust: true 
      });
  
      // 1. Check if it's a mobile device with file-sharing support
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'quiz-report.png', { type: 'image/png' });
  
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // --- MOBILE PATH ---
        await navigator.share({
          files: [file],
          title: 'My Quiz Results',
          text: `I just scored ${quizResults.overallGrade}! 🚀`,
        });
      } else {
        // --- DESKTOP/LAPTOP PATH ---
        // trigger a download so the user has the file
        const link = document.createElement('a');
        link.download = 'My_Quiz_Report.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // toast to confirm download
        toaster.create({
          description: "Report downloaded! You can now upload it to WhatsApp or Instagram.",
          type: "success",
        });
      }
    } catch (error) {
      console.error('Sharing failed', error);
    } finally {
      setIsSharing(false); // Removes the "faint" loading state
      setShowShareModal(false);
    }
  };
  
  const downloadDetailedReport = async () => {
    const reportElement = document.getElementById("printable-report-area");
    if (!reportElement) return;
  
    setIsDownloading(true);
    try {
      // 1. Create a LARGE Watermark
      const watermark = document.createElement('div');
      watermark.innerHTML = `<img src="${logo}" style="width: 650px; opacity: 0.05;" />`;
      watermark.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-35deg);
        z-index: 0;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      `;
      
      // Add watermark before capture
      reportElement.style.position = 'relative';
      reportElement.appendChild(watermark);
  
      // 2. Generate JPEG (Smaller file size than PNG)
      const dataUrl = await toJpeg(reportElement, { 
        quality: 0.8, 
        pixelRatio: 1.5, 
        backgroundColor: "#ffffff",
      });
  
      // Remove watermark immediately
      reportElement.removeChild(watermark);
  
      // 3. Setup PDF with internal compression
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
        compress: true,
      });
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      
      const width = imgProps.width * ratio;
      const height = imgProps.height * ratio;
  
      // 4. Add Image to PDF
      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height, undefined, 'FAST');
      
      const fileName = `${authdStudent?.firstname || 'Student'}_Detailed_Report.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const backToDashboard = () => {
    setCurrentStudentPage("home");
    setShowSideBar(true);
    setShowNavBar(true);
  };

  return (
    <>
      <Box
        p={6}
        borderRadius="md"
        boxShadow="md"
        bg="white"
        w={{ base: "100%", lg: "80%" }}
        m="auto"
        minH="85vh"
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-around"
          align="center"
          gap={6}
        >
          {/* Results Summary Card */}
          <Card.Root
            bgImage={`url(${resultWobble})`}
            bgSize="cover"
            mt={8}
            w={{ base: "100%", md: "60%", lg: "38%" }}
            border="none"
            borderRadius="3xl"
            position="relative"
            overflow="hidden"
            shadow="xl"
          >
            <CardBody p={8} mb={7}>
              <Stack gap={10}>
                {/* Overall Grade Circle */}
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap={2}
                >
                  <Box
                    w="90px"
                    h="90px"
                    borderRadius="full"
                    border="5px solid"
                    borderColor={
                      quizResults.overallPassed ? "green.400" : "red.400"
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="white"
                    shadow="inner"
                  >
                    <Heading
                      size="4xl"
                      color={
                        quizResults.overallPassed ? "green.600" : "red.600"
                      }
                    >
                      {quizResults.overallGrade}
                    </Heading>
                  </Box>
                  <VStack gap={0}>
                    <Heading size="md">{quizResults.overallGradeLabel}</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Average Performance
                    </Text>
                  </VStack>
                </Flex>

                {/* Subject Breakdown */}
                <Stack gap={4} w="full">
                  <Text
                    fontWeight="bold"
                    fontSize="xs"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Subject Breakdown
                  </Text>
                  {quizData.subjects.map((subject) => {
                    const result = quizResults.subjectResults[subject.id];
                    if (!result) return null;

                    return (
                      <Flex
                        key={subject.id}
                        justify="space-between"
                        align="center"
                        p={2}
                        bg="whiteAlpha.600"
                        rounded="lg"
                      >
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="bold">
                            {subject.displayName}
                          </Text>
                          <Text fontSize="10px" color="gray.500">
                            {result.correct}/{result.total} Marks
                          </Text>
                        </VStack>
                        <HStack gap={3}>
                          <Badge
                            variant="subtle"
                            colorPalette={result.passed ? "green" : "red"}
                          >
                            {result.percentage}%
                          </Badge>
                          <Text fontWeight="black" fontSize="lg" w="15px">
                            {result.grade}
                          </Text>
                        </HStack>
                      </Flex>
                    );
                  })}
                </Stack>

                {/* Date and Footer Score */}
                <Stack
                  gap={2}
                  pt={4}
                  borderTop="1px dashed"
                  borderColor="gray.300"
                >
                  <Flex justify="space-between" fontSize="sm">
                    <Text color="gray.600">Total Score:</Text>
                    <Text fontWeight="bold">
                      {totalCorrect} / {totalQuestions}
                    </Text>
                  </Flex>
                  <Flex
                    justify="space-between"
                    fontSize="10px"
                    color="gray.400"
                  >
                    <Text>Date Attempted:</Text>
                    <Text>{formattedDate}</Text>
                  </Flex>
                </Stack>
              </Stack>
            </CardBody>

            <Flex
              align="center"
              justify="center"
              gap={2}
              bgImage={`url(${resultCourseBg})`}
              bgSize="cover"
              height="16"
              color="white"
              fontSize="sm"
              mt="-9"
              onClick={() => setShowSummaryPage(true)}
              cursor="pointer"
              _hover={{ opacity: 0.9 }}
            >
              <HiClipboardList /> Quiz Summary
            </Flex>
          </Card.Root>

          {/* Right Side: Greeting */}
          <Box w={{ base: "100%", lg: "50%" }} p={{ base: 0, lg: 6 }}>
            <Stack gap={8}>
              <Heading size="2xl" fontWeight="400">
                Hi, {authdStudent?.firstname} 👋
              </Heading>
              <Box fontSize="sm">
                <Text fontWeight="600" mb={2}>
                  Performance Note:
                </Text>
                <Text color="gray.600">
                  {quizResults.overallPassed
                    ? "Great job! You have shown a solid understanding of the selected subjects. Keep practicing to maintain your Excellent status."
                    : "Don't be discouraged. Review the quiz summary to see which areas need more focus. Consistent practice leads to better grades!"}
                </Text>
              </Box>
              <Flex gap={4} wrap="wrap">
                <Button
                  bg="primaryColor"
                  size="sm"
                  rounded="full"
                  onClick={downloadDetailedReport}
                  loading={isDownloading}
                >
                  <LuArrowDownToLine /> Download
                </Button>

                <Button
                  variant="outline"
                  bg="#1FBA791A"
                  color="greenOthers"
                  fontSize="xs"
                  p={4}
                  rounded="3xl"
                  onClick={() => setShowShareModal(true)}
                >
                  <FiUpload /> Share
                </Button>

                <Button
                  colorPalette="green"
                  variant="subtle"
                  size="sm"
                  rounded="full"
                  onClick={() => setShowQuizReport(true)}
                >
                  <TbClipboardList /> Quiz Report
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Flex>

        <Flex justify="flex-end" mt={10}>
          <Button
            bg="primaryColor"
            color="white"
            size="sm"
            onClick={backToDashboard}
          >
            <IoArrowBack /> Go to Dashboard
          </Button>
        </Flex>
      </Box>

      {showSummaryPage && (
        <SummaryPage
          quizResults={quizResults}
          quizData={quizData}
          onClose={() => setShowSummaryPage(false)}
        />
      )}
      
      {/*{showDownloadReportPage && (
        <Text> Downloading Your results</Text>
      )}*/}

      {showQuizReport && (
        <QuizReportPage
          quizResults={quizResults}
          quizData={quizData}
          isDownloading={isDownloading}
          onDownload={downloadDetailedReport}
          onClose={() => setShowQuizReport(false)}
        />
      )}

      {/*share card component render*/}

      {/* 1. HIDDEN LAYER: This is what the library "photographs" */}
      <Box position="absolute" left="-9999px" top="-9999px">
        <ShareCard
          quizResults={quizResults}
          quizData={quizData}
          studentName={`${authdStudent?.firstname} ${authdStudent?.lastname}`}
        />
      </Box>

      {/* 2. PREVIEW MODAL */}
      <Dialog.Root
        open={showShareModal}
        onOpenChange={(details) => setShowShareModal(details.open)}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Content borderRadius="2xl" p={4}>
            <Dialog.Header>
              <Heading size="md">Share Your Achievement</Heading>
              <Text fontSize="xs" color="gray.500">
                Preview your report card below
              </Text>
            </Dialog.Header>

            <Dialog.Body>
              <Center
                bg="gray.100"
                p={6}
                borderRadius="xl"
                border="1px dashed"
                borderColor="gray.300"
              >
                <VStack gap={4}>
                  {/* Visual Preview (Scale it down so it fits in the modal) */}
                  <Box transform="scale(0.85)" transformOrigin="center">
                    <ShareCard
                      quizResults={quizResults}
                      quizData={quizData}
                      studentName={`${authdStudent?.firstname} ${authdStudent?.lastname}`}
                    />
                  </Box>
                </VStack>
              </Center>
            </Dialog.Body>

            <Dialog.Footer gap={3}>
              <Button variant="ghost" onClick={() => setShowShareModal(false)}>
                Cancel
              </Button>
              <Button
                bg="primaryColor"
                color="white"
                rounded="full"
                loading={isSharing}
                onClick={handleSocialShare}
                w="full"
              >
                {isSharing
                  ? "Preparing Image..."
                  : "Share to WhatsApp / Socials"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Portal>
      </Dialog.Root>
    </>
  );
};
