"use client";

import React, { useState, useMemo } from "react";
import { Box, Flex, Text, Heading, VStack, HStack, Icon, Image } from "@chakra-ui/react";
import {
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { GiBookmarklet } from "react-icons/gi";
import {
  LuCompass,
  LuAtom,
  LuFlaskConical,
  LuDna,
  LuTrendingUp,
  LuBookOpen,
  LuScale,
  LuLeaf,
  LuCpu,
} from "react-icons/lu";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useStudentData } from "../context/dataContext";
import { getCourseThumbnail } from "../utils/courseImages";
import { courseConfig } from "../utils/courseConstants";
import Subjects from "../components/learn/subject/subjects";
import Pdfs from "../components/learn/pdf/pdfs";
import PQs from "../components/learn/pqs/PQs";

type LearnSection = "videos" | "pdfs" | "pqs";

interface SubjectItem {
  displayName: string;
  key: string;
}

// Canonical curriculum subjects matching the screenshot and school syllabi
const CURRICULUM_SUBJECTS: SubjectItem[] = [
  { displayName: "Physics", key: "physics" },
  { displayName: "English Language", key: "english language" },
  { displayName: "General Mathematics", key: "general mathematics" },
  { displayName: "Chemistry", key: "chemistry" },
  { displayName: "Economics", key: "economics" },
  { displayName: "Government", key: "government" },
  { displayName: "Biology", key: "biology" },
  { displayName: "Literature in English", key: "literature in english" },
  { displayName: "Agricultural Science", key: "agricultural science" },
  { displayName: "Commerce", key: "commerce" },
  { displayName: "Civic Education", key: "civic education" },
  { displayName: "Financial Accounting", key: "financial accounting" },
  { displayName: "Further Mathematics", key: "further mathematics" },
  { displayName: "Geography", key: "geography" },
  { displayName: "Computer Studies", key: "computer studies" },
  { displayName: "Basic Science", key: "basic science" },
  { displayName: "Basic Technology", key: "basic technology" },
  { displayName: "Business Studies", key: "business studies" },
  { displayName: "Social Studies", key: "social studies" },
];

/**
 * Returns icon and exact color matching quiz/learning analytics (courseConfig)
 */
const getSubjectIcon = (subjectName: string) => {
  const norm = (subjectName || "").toLowerCase().trim();
  const config = courseConfig[norm];
  const color = config?.color || "#2563EB";

  // Select suitable icon
  let icon = LuBookOpen;
  if (norm.includes("math")) icon = LuCompass;
  else if (norm.includes("physic")) icon = LuAtom;
  else if (norm.includes("chem")) icon = LuFlaskConical;
  else if (norm.includes("bio")) icon = LuDna;
  else if (norm.includes("econ")) icon = LuTrendingUp;
  else if (norm.includes("eng") || norm.includes("lit")) icon = LuBookOpen;
  else if (norm.includes("gov") || norm.includes("civic")) icon = LuScale;
  else if (norm.includes("agric")) icon = LuLeaf;
  else if (norm.includes("comp") || norm.includes("tech")) icon = LuCpu;

  return { icon, bg: color };
};

const LearnPage: React.FC = () => {
  const { authdStudent } = useAuthdStudentData();
  const { subjectImages } = useStudentData();

  const [learnSection, setLearnSection] = useState<LearnSection>("videos");
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);

  // Extract student's registered courses
  const studentRegisteredCourses = useMemo<string[]>(() => {
    const raw = authdStudent?.registered_courses;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return String(raw).split(",").map((s) => s.trim());
    }
  }, [authdStudent?.registered_courses]);

  // Combined subject list with registered courses prioritized, matching the design in screenshot
  const allSubjects = useMemo<SubjectItem[]>(() => {
    const seen = new Set<string>();
    const list: SubjectItem[] = [];

    // First add registered courses formatted nicely
    for (const rawName of studentRegisteredCourses) {
      const norm = rawName.trim();
      if (!norm) continue;
      const lower = norm.toLowerCase();
      // Match against known curriculum subjects or use capitalized name
      const matched = CURRICULUM_SUBJECTS.find(
        (c) => c.key === lower || c.displayName.toLowerCase() === lower
      );
      const displayName = matched ? matched.displayName : norm;
      if (!seen.has(displayName.toLowerCase())) {
        seen.add(displayName.toLowerCase());
        list.push({ displayName, key: lower });
      }
    }

    // Then ensure the primary subjects from screenshot are present
    for (const subj of CURRICULUM_SUBJECTS) {
      if (!seen.has(subj.displayName.toLowerCase())) {
        seen.add(subj.displayName.toLowerCase());
        list.push(subj);
      }
    }

    return list;
  }, [studentRegisteredCourses]);

  // Default selected subject: first registered or "General Mathematics" (matching screenshot)
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (studentRegisteredCourses.length > 0) {
      const first = studentRegisteredCourses[0];
      const matched = CURRICULUM_SUBJECTS.find(
        (c) => c.key === first.toLowerCase() || c.displayName.toLowerCase() === first.toLowerCase()
      );
      return matched ? matched.displayName : first;
    }
    return "General Mathematics";
  });

  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const activeIconInfo = getSubjectIcon(selectedSubject);

  // Handle clicking top bar sections:
  // For 'videos' and 'pdfs', open subject selection popup.
  // For 'pqs', do NOT open subjects popup immediately (user must pick exam first!).
  const handleSectionClick = (section: LearnSection) => {
    setLearnSection(section);
    if (section === "pqs") {
      setSelectedExam(null); // Reset exam so user sees exam choices
    } else {
      setShowSubjectModal(true);
    }
  };

  return (
    <Box w="100%" minH="100vh" bg="white" pb={24}>
      {/* ─── Compact Mobile Top Bar (Videos, PDFs, PQs & Subject Pill) ─── */}
      <Box w="100%" bg="white" px={{ base: 3, sm: 4 }} pt={2} pb={2} borderBottom="1px solid" borderColor="#F1F5F9">
        {/* Top Bar Grouped by 'Videos', 'PDFs', and 'PQs' */}
        <Box w="100%">
          <Flex
            bg="#F1F5F9"
            borderRadius="xl"
            p="3px"
            gap="2px"
            w="100%"
            align="center"
            border="1px solid"
            borderColor="#E2E8F0"
          >
            {/* Videos Tab */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              py={1.5}
              borderRadius="lg"
              bg={learnSection === "videos" ? "white" : "transparent"}
              color={learnSection === "videos" ? "#0F172A" : "#64748B"}
              fontWeight={learnSection === "videos" ? "700" : "500"}
              cursor="pointer"
              fontSize="12.5px"
              transition="all 0.15s ease"
              onClick={() => handleSectionClick("videos")}
            >
              Videos
            </Flex>

            {/* PDFs Tab */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              py={1.5}
              borderRadius="lg"
              bg={learnSection === "pdfs" ? "white" : "transparent"}
              color={learnSection === "pdfs" ? "#0F172A" : "#64748B"}
              fontWeight={learnSection === "pdfs" ? "700" : "500"}
              cursor="pointer"
              fontSize="12.5px"
              transition="all 0.15s ease"
              onClick={() => handleSectionClick("pdfs")}
            >
              PDFs
            </Flex>

            {/* PQs Tab */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              py={1.5}
              borderRadius="lg"
              bg={learnSection === "pqs" ? "white" : "transparent"}
              color={learnSection === "pqs" ? "#0F172A" : "#64748B"}
              fontWeight={learnSection === "pqs" ? "700" : "500"}
              cursor="pointer"
              fontSize="12.5px"
              transition="all 0.15s ease"
              onClick={() => handleSectionClick("pqs")}
            >
              PQs
            </Flex>
          </Flex>
        </Box>

        {/* ─── Compact Selected Subject Selector Pill (Hidden on PQs until exam is chosen) ─── */}
        {!(learnSection === "pqs" && !selectedExam) && (
          <Box mt={2} w="100%">
            <Flex
              bg="#F8FAFC"
              border="1px solid"
              borderColor="#E2E8F0"
              borderRadius="xl"
              px={3}
              py={2}
              align="center"
              justify="space-between"
              cursor="pointer"
              onClick={() => setShowSubjectModal(true)}
              _hover={{ bg: "#F1F5F9" }}
              _active={{ bg: "#E2E8F0" }}
              transition="background 0.15s"
              w="100%"
            >
              <HStack gap={2.5}>
                {/* Subject Icon Badge with exact subject color */}
                <Flex
                  boxSize="28px"
                  borderRadius="md"
                  bg={activeIconInfo.bg}
                  color="white"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={GiBookmarklet} boxSize="16px" />
                </Flex>
                {/* Subject Title */}
                <Text fontSize="13px" fontWeight="600" color="#0F172A" noOfLines={1}>
                  {selectedSubject}
                </Text>
              </HStack>

              {/* Chevron Down */}
              <Icon as={FiChevronDown} boxSize="16px" color="#64748B" />
            </Flex>
          </Box>
        )}
      </Box>

      {/* ─── Active Content View (Fills page width) ─── */}
      <Box w="100%" px={{ base: 3, sm: 4 }} mt={3}>
        {learnSection === "pdfs" ? (
          <Pdfs
            selectedSubject={selectedSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
          />
        ) : learnSection === "pqs" ? (
          <PQs
            selectedSubject={selectedSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
            selectedExam={selectedExam}
            onSelectExam={setSelectedExam}
          />
        ) : (
          <Subjects
            selectedSubject={selectedSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
          />
        )}
      </Box>

      {/* ─── Subject Selection Popup Bottom Sheet (Connected to Bottom, stops at Top) ─── */}
      {showSubjectModal && (
        <>
          {/* Dimmed Backdrop */}
          <Box
            position="fixed"
            inset={0}
            bg="black/45"
            zIndex={2000}
            onClick={() => setShowSubjectModal(false)}
            transition="opacity 0.2s ease"
          />

          {/* Floating 'X' Close Button right above sheet (as shown in screenshot) */}
          <Flex
            position="fixed"
            top={{ base: "8.5%", sm: "9%" }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={2002}
            align="center"
            justify="center"
            boxSize="40px"
            borderRadius="full"
            bg="rgba(148, 163, 184, 0.45)"
            backdropFilter="blur(8px)"
            border="1.5px solid rgba(255, 255, 255, 0.6)"
            color="white"
            cursor="pointer"
            onClick={() => setShowSubjectModal(false)}
            _hover={{ bg: "rgba(100, 116, 139, 0.7)" }}
            _active={{ transform: "translateX(-50%) scale(0.95)" }}
            transition="all 0.15s ease"
            aria-label="Close subject selector"
          >
            <Icon as={FiX} boxSize="20px" />
          </Flex>

          {/* Bottom Sheet Modal Container (docked to bottom, stops near top) */}
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            top={{ base: "14%", sm: "15%" }}
            bg="white"
            borderTopRadius="28px"
            border="1px solid"
            borderColor="#E2E8F0"
            zIndex={2001}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            animation="slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
          >
            {/* Scrollable Subjects Content */}
            <Box
              flex="1"
              overflowY="auto"
              px={{ base: 3.5, sm: 5 }}
              pt={5}
              pb={12}
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Header inside popup */}
              <Heading
                fontSize={{ base: "17px", sm: "18px" }}
                fontWeight="700"
                color="#0F172A"
                mb={3.5}
                textAlign="left"
              >
                Select Subjects
              </Heading>

              {/* Subject Pictures List: 1 subject to 1 line, correctly sized with native aspect ratio (no stretching) */}
              <VStack gap={3} w="100%" align="stretch">
                {allSubjects.map((subject) => {
                  const cardThumbnail = getCourseThumbnail(subject.displayName, subjectImages);
                  const isSelected =
                    selectedSubject.toLowerCase() === subject.displayName.toLowerCase();

                  return (
                    <Flex
                      key={subject.displayName}
                      w="100%"
                      justify="center"
                      align="center"
                    >
                      <Box
                        w="auto"
                        maxW="100%"
                        borderRadius="xl"
                        overflow="hidden"
                        cursor="pointer"
                        border={isSelected ? "2.5px solid #2563EB" : "1px solid #E2E8F0"}
                        bg="#F8FAFC"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => {
                          setSelectedSubject(subject.displayName);
                          setShowSubjectModal(false);
                        }}
                        _hover={{ opacity: 0.95 }}
                        _active={{ transform: "scale(0.99)" }}
                        transition="transform 0.15s ease, opacity 0.15s ease"
                        aria-label={subject.displayName}
                      >
                        <Image
                          src={cardThumbnail}
                          alt={subject.displayName}
                          h={{ base: "80px", sm: "90px" }}
                          w="auto"
                          maxW="100%"
                          objectFit="contain"
                          display="block"
                        />
                      </Box>
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default LearnPage;