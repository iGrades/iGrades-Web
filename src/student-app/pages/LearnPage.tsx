import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  Icon,
  Grid,
  Button,
  Center,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useStudentData } from "../context/dataContext";
import { courseConfig } from "../utils/courseConstants";
import {
  getCourseThumbnail,
  DEFAULT_COURSE_IMAGES,
  normalizeCourseKey,
} from "../utils/courseImages";
import Subjects from "../components/learn/subject/subjects";
import Pdfs from "../components/learn/pdf/pdfs";
import PQs from "../components/learn/pqs/PQs";
import { useBackButton } from "@/hooks/useBackButton";

type LearnSection = "videos" | "pdfs" | "pqs";

interface SubjectItem {
  displayName: string;
  key: string;
}

// Canonical curriculum subjects matching school syllabi
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

const LearnPage: React.FC = () => {
  const { authdStudent } = useAuthdStudentData();
  const { subjectImages } = useStudentData();

  const [learnSection, setLearnSection] = useState<LearnSection>("videos");
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);

  // Native phone back button closes the subject modal if open
  useBackButton("learn-subject-modal", 75, () => {
    if (showSubjectModal) {
      setShowSubjectModal(false);
      return true;
    }
    return false;
  });

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

  // Subject list strictly containing courses that the student is offering (or curriculum fallback)
  const allSubjects = useMemo<SubjectItem[]>(() => {
    const seen = new Set<string>();
    const list: SubjectItem[] = [];

    // Add registered courses formatted nicely with canonical curriculum names
    for (const rawName of studentRegisteredCourses) {
      const norm = rawName.trim();
      if (!norm) continue;
      const lower = normalizeCourseKey(norm);
      const config = courseConfig[lower];
      const matched = CURRICULUM_SUBJECTS.find((c) => {
        const cNorm = normalizeCourseKey(c.key);
        const cDispNorm = normalizeCourseKey(c.displayName);
        return cNorm === lower || cDispNorm === lower;
      });
      const displayName = config?.displayName || matched?.displayName || (norm.charAt(0).toUpperCase() + norm.slice(1));
      const key = lower;

      if (!seen.has(normalizeCourseKey(displayName))) {
        seen.add(normalizeCourseKey(displayName));
        list.push({ displayName, key });
      }
    }

    // Only courses that the student is offering are shown if they have registered courses
    if (list.length > 0) {
      return list;
    }

    // Safe fallback if student hasn't picked courses yet: full curriculum subjects
    return CURRICULUM_SUBJECTS;
  }, [studentRegisteredCourses]);

  // Default selected subject: first registered or saved or "General Mathematics"
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem("lastSelectedLearnSubject");
      if (saved) return saved;
    } catch {
      // ignore
    }
    if (studentRegisteredCourses.length > 0) {
      const first = studentRegisteredCourses[0];
      const norm = normalizeCourseKey(first);
      const config = courseConfig[norm];
      const matched = CURRICULUM_SUBJECTS.find((c) => {
        const cNorm = normalizeCourseKey(c.key);
        const cDispNorm = normalizeCourseKey(c.displayName);
        return cNorm === norm || cDispNorm === norm;
      });
      return config?.displayName || matched?.displayName || first;
    }
    return "General Mathematics";
  });

  const handleSelectSubject = (subjectName: string) => {
    if (!subjectName) return;
    const norm = normalizeCourseKey(subjectName);
    const config = courseConfig[norm];
    const canonicalName = config?.displayName || subjectName;
    setSelectedSubject(canonicalName);
    try {
      sessionStorage.setItem("lastSelectedLearnSubject", canonicalName);
    } catch {
      // ignore
    }
  };

  // Ensure selectedSubject is initialized if empty
  useEffect(() => {
    if (!selectedSubject && allSubjects.length > 0) {
      handleSelectSubject(allSubjects[0].displayName);
    }
  }, [allSubjects, selectedSubject]);

  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const activeNormKey = normalizeCourseKey(selectedSubject);
  const activeCourseThumbnail =
    getCourseThumbnail(activeNormKey, subjectImages) ||
    DEFAULT_COURSE_IMAGES[activeNormKey] ||
    getCourseThumbnail(selectedSubject, subjectImages);
  const activeConfig = courseConfig[activeNormKey] || {
    displayName: selectedSubject,
    color: "#206CE1",
  };
  const displayedSubjectName =
    activeConfig.displayName ||
    (selectedSubject
      ? selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)
      : "General Mathematics");

  // Handle clicking top bar sections:
  // For 'videos' and 'pdfs', switch section.
  // For 'pqs', reset exam so user sees exam choices.
  const handleSectionClick = (section: LearnSection) => {
    setLearnSection(section);
    if (section === "pqs") {
      setSelectedExam(null);
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
              bg={{ base: "#F8FAFC", _dark: "#1A1A1A" }}
              border="1px solid"
              borderColor={{ base: "#E2E8F0", _dark: "#262626" }}
              borderRadius="xl"
              px={3}
              py={2}
              align="center"
              justify="space-between"
              cursor="pointer"
              onClick={() => setShowSubjectModal(true)}
              _hover={{ bg: { base: "#F1F5F9", _dark: "#242424" } }}
              _active={{ bg: { base: "#E2E8F0", _dark: "#2E2E2E" } }}
              transition="background 0.15s"
              w="100%"
            >
              <HStack gap={2.5} align="center">
                {/* Subject Thumbnail or Color Badge */}
                {activeCourseThumbnail ? (
                  <Box
                    w="40px"
                    h="24px"
                    borderRadius="md"
                    background={`url("${activeCourseThumbnail.trim()}")`}
                    backgroundSize="100% 100%"
                    backgroundPosition="center"
                    backgroundRepeat="no-repeat"
                    flexShrink={0}
                    border="1px solid rgba(0,0,0,0.08)"
                  />
                ) : (
                  <Flex
                    boxSize="26px"
                    borderRadius="md"
                    bg={activeConfig.color}
                    color="white"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={FiChevronDown} boxSize="14px" />
                  </Flex>
                )}
                {/* Subject Title */}
                <Text fontSize="13px" fontWeight="700" color={{ base: "#0F172A", _dark: "#F5F5F5" }} noOfLines={1}>
                  {displayedSubjectName}
                </Text>
              </HStack>

              <HStack gap={1} color="#206CE1" fontSize="12px" fontWeight="600">
                <Text display={{ base: "none", sm: "inline" }}>Change Subject</Text>
                <Icon as={FiChevronDown} boxSize="16px" color={{ base: "#64748B", _dark: "#A1A1AA" }} />
              </HStack>
            </Flex>
          </Box>
        )}
      </Box>

      {/* ─── Active Content View (Fills page width) ─── */}
      <Box w="100%" px={{ base: 3, sm: 4 }} mt={3}>
        {learnSection === "pdfs" ? (
          <Pdfs
            selectedSubject={selectedSubject}
            onSelectSubject={handleSelectSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
          />
        ) : learnSection === "pqs" ? (
          <PQs
            selectedSubject={selectedSubject}
            onSelectSubject={handleSelectSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
            selectedExam={selectedExam}
            onSelectExam={setSelectedExam}
          />
        ) : (
          <Subjects
            selectedSubject={selectedSubject}
            onSelectSubject={handleSelectSubject}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
          />
        )}
      </Box>

      {/* ─── Select Subject Modal (Returned to Former Design) ─── */}
      {showSubjectModal && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={2000}
            backdropFilter="blur(3px)"
            onClick={() => setShowSubjectModal(false)}
            transition="opacity 0.2s ease"
          />

          {/* Modal Container */}
          <Box
            position="fixed"
            bottom={0}
            left="50%"
            transform="translateX(-50%)"
            w="100%"
            maxW={{ base: "100%", md: "680px", lg: "740px" }}
            maxH={{ base: "84vh", md: "85vh" }}
            bg={{ base: "white", _dark: "#121212" }}
            borderTopRadius="24px"
            border="1px solid"
            borderColor={{ base: "gray.200", _dark: "#262626" }}
            zIndex={2001}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            boxShadow="0 -4px 24px rgba(0, 0, 0, 0.18)"
            animation="slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
          >
            {/* Header with Title and Integrated Close Button */}
            <Flex
              justify="space-between"
              align="center"
              px={{ base: 4, sm: 6 }}
              py={4}
              borderBottom="1px solid"
              borderColor={{ base: "gray.100", _dark: "#222" }}
            >
              <Box>
                <Heading
                  fontSize={{ base: "18px", sm: "20px" }}
                  fontWeight="800"
                  color={{ base: "#0F172A", _dark: "#F8FAFC" }}
                >
                  Select Subject
                </Heading>
                <Text fontSize="12px" color={{ base: "#64748B", _dark: "#94A3B8" }} mt={0.5}>
                  Choose a subject to study ({allSubjects.length} courses)
                </Text>
              </Box>

              <Button
                variant="ghost"
                size="sm"
                borderRadius="full"
                p={1.5}
                onClick={() => setShowSubjectModal(false)}
                aria-label="Close subject selector"
              >
                <IoClose size={20} />
              </Button>
            </Flex>

            {/* Scrollable Subjects Grid in Former Design */}
            <Box
              flex="1"
              overflowY="auto"
              px={{ base: 3.5, sm: 6 }}
              py={5}
              pb={8}
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Grid
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                }}
                gap={{ base: 3, sm: 4, md: 5 }}
              >
                {allSubjects.map((subject, index) => {
                  const isSelected =
                    selectedSubject.toLowerCase() === subject.displayName.toLowerCase();
                  const normKey = normalizeCourseKey(subject.key || subject.displayName);
                  const courseImage =
                    getCourseThumbnail(normKey, subjectImages) ||
                    DEFAULT_COURSE_IMAGES[normKey] ||
                    getCourseThumbnail(subject.displayName, subjectImages);
                  const config = courseConfig[normKey] || {
                    displayName: subject.displayName,
                    color: "#206CE1",
                  };

                  return (
                    <Box
                      key={subject.key || index}
                      borderRadius="xl"
                      p={{ base: 3, sm: 4 }}
                      textAlign="center"
                      w="100%"
                      aspectRatio="254 / 101"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      transition="all 0.25s ease"
                      _hover={{ transform: "translateY(-4px)", shadow: "md" }}
                      _active={{ transform: "scale(0.98)" }}
                      background={courseImage ? `url("${courseImage.trim()}")` : config.color}
                      backgroundSize="100% 100%"
                      backgroundPosition="center"
                      backgroundRepeat="no-repeat"
                      cursor="pointer"
                      position="relative"
                      overflow="hidden"
                      border={isSelected ? "3px solid #206CE1" : "1.5px solid transparent"}
                      boxShadow={
                        isSelected
                          ? "0 4px 14px rgba(32, 108, 225, 0.4)"
                          : "0 2px 6px rgba(0, 0, 0, 0.06)"
                      }
                      onClick={() => {
                        handleSelectSubject(subject.displayName);
                        setShowSubjectModal(false);
                      }}
                    >
                      {/* Selected Checkmark Badge (Former Design) */}
                      {isSelected && (
                        <Box
                          position="absolute"
                          top={2}
                          right={2}
                          bg="white"
                          borderRadius="full"
                          p={0.5}
                          boxShadow="md"
                          zIndex={4}
                        >
                          <IoIosCheckmarkCircle color="#48BB78" size={24} />
                        </Box>
                      )}

                      {/* Subject Title Fallback if image not yet loaded */}
                      <Center flexDirection="column" zIndex={2} position="relative">
                        {!courseImage && (
                          <Text
                            fontSize="md"
                            fontWeight="800"
                            color="white"
                            textShadow="2px 2px 4px rgba(0,0,0,0.7)"
                          >
                            {subject.displayName}
                          </Text>
                        )}
                      </Center>
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default LearnPage;