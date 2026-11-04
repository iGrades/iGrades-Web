"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "../context/studentDataContext";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Icon,
  Input,
  Alert,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiLock,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { toaster } from "@/components/ui/toaster";
import { useBackButton } from "@/hooks/useBackButton";

interface CourseDef {
  id: string;
  name: string;
  category: "Core" | "Science" | "Social Science" | "Arts" | "Elective";
  icon: string;
  isMandatory?: boolean;
}

const MAX_ALLOWED_SUBJECTS = 8;
const MANDATORY_CORE_IDS = ["mathematics", "english"];

const JUNIOR_COURSES: CourseDef[] = [
  { id: "mathematics", name: "Mathematics", category: "Core", icon: "📐", isMandatory: true },
  { id: "english", name: "English Language", category: "Core", icon: "📖", isMandatory: true },
  { id: "basic science", name: "Basic Science", category: "Core", icon: "🔬" },
  { id: "basic technology", name: "Basic Technology", category: "Core", icon: "⚙️" },
  { id: "social studies", name: "Social Studies", category: "Core", icon: "🌍" },
  { id: "civic education", name: "Civic Education", category: "Core", icon: "🏛️" },
  { id: "business studies", name: "Business Studies", category: "Core", icon: "💼" },
  { id: "home economics", name: "Home Economics", category: "Core", icon: "🍳" },
  { id: "agricultural science", name: "Agricultural Science", category: "Core", icon: "🌱" },
  { id: "physical education", name: "Physical & Health Education", category: "Core", icon: "🏃" },
  { id: "computer studies", name: "Computer Studies", category: "Elective", icon: "💻" },
  { id: "creative arts", name: "Creative Arts", category: "Elective", icon: "🎨" },
  { id: "music", name: "Music", category: "Elective", icon: "🎵" },
];

const SENIOR_COURSES: CourseDef[] = [
  { id: "mathematics", name: "General Mathematics", category: "Core", icon: "📐", isMandatory: true },
  { id: "english", name: "English Language", category: "Core", icon: "📖", isMandatory: true },
  { id: "physics", name: "Physics", category: "Science", icon: "⚡" },
  { id: "chemistry", name: "Chemistry", category: "Science", icon: "🧪" },
  { id: "biology", name: "Biology", category: "Science", icon: "🧬" },
  { id: "further mathematics", name: "Further Mathematics", category: "Science", icon: "♾️" },
  { id: "agricultural science", name: "Agricultural Science", category: "Science", icon: "🌱" },
  { id: "economics", name: "Economics", category: "Social Science", icon: "📊" },
  { id: "accounting", name: "Financial Accounting", category: "Social Science", icon: "🪙" },
  { id: "commerce", name: "Commerce", category: "Social Science", icon: "🤝" },
  { id: "government", name: "Government", category: "Social Science", icon: "⚖️" },
  { id: "civic education", name: "Civic Education", category: "Social Science", icon: "🏛️" },
  { id: "literature", name: "Literature in English", category: "Arts", icon: "📚" },
  { id: "history", name: "History", category: "Arts", icon: "🏺" },
  { id: "geography", name: "Geography", category: "Arts", icon: "🗺️" },
  { id: "fine arts", name: "Visual / Fine Arts", category: "Arts", icon: "🎨" },
  { id: "computer science", name: "Computer Science", category: "Elective", icon: "💻" },
  { id: "french", name: "French Language", category: "Elective", icon: "🗼" },
];

function safeParseCourses(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : String(item).trim().toLowerCase()))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "{}" || trimmed === '""') return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
        }
      } catch {
        // continue
      }
    }
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.replace(/^["']|["']$/g, "").trim().toLowerCase())
        .filter(Boolean);
    }
    return trimmed
      .split(",")
      .map((s) => s.replace(/^["'\[\]]|["'\[\]]$/g, "").trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

const CourseSelectionPage = () => {
  const { authdStudent, setAuthdStudent } = useAuthdStudentData();
  const navigate = useNavigate();

  // Selected courses always include Mathematics and English
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() => [
    "mathematics",
    "english",
  ]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  // Native phone back button navigates back to dashboard
  useBackButton("course-selection", 50, () => {
    navigate("/student-dashboard");
    return true;
  });

  // Normalize selectedCourses as a guaranteed array at all times, always keeping mandatory core
  const selectedCoursesList = useMemo(() => {
    const parsed = Array.isArray(selectedCourses) ? selectedCourses : safeParseCourses(selectedCourses);
    const set = new Set(parsed);
    // Ensure math and english are always present
    set.add("mathematics");
    set.add("english");
    return Array.from(set);
  }, [selectedCourses]);

  // Redirect if not signed in & protect registered courses from being re-edited
  useEffect(() => {
    if (!authdStudent) {
      navigate("/student-login");
    } else {
      const parsed = safeParseCourses(authdStudent.registered_courses);
      if (parsed.length > 0) {
        toaster.create({
          title: "Courses Already Registered",
          description: "Courses selected during registration cannot be edited.",
          type: "info",
        });
        navigate("/student-dashboard", { replace: true });
      }
    }
  }, [authdStudent, navigate]);

  // Determine course pool based on class
  const isSenior = authdStudent?.class?.toUpperCase().includes("SSS") ?? true;
  const availableCourses = useMemo(() => {
    return isSenior ? SENIOR_COURSES : JUNIOR_COURSES;
  }, [isSenior]);

  // Categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    availableCourses.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [availableCourses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) => {
      const matchesCategory =
        activeCategory === "All" || course.category === activeCategory;
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [availableCourses, activeCategory, searchQuery]);

  // Toggle selection
  const toggleCourse = (courseId: string) => {
    if (MANDATORY_CORE_IDS.includes(courseId)) {
      toaster.create({
        title: "Compulsory Core Subject",
        description: "Mathematics and English Language are mandatory core subjects in the curriculum.",
        type: "info",
        duration: 2500,
      });
      return;
    }

    const current = selectedCoursesList;
    if (current.includes(courseId)) {
      setSelectedCourses(current.filter((id) => id !== courseId));
      setAlert(null);
    } else {
      if (current.length >= MAX_ALLOWED_SUBJECTS) {
        toaster.create({
          title: "Maximum 8 Subjects Reached",
          description: "You can select up to 8 subjects in total. Deselect an optional subject to pick this one.",
          type: "warning",
          duration: 3000,
        });
        return;
      }
      setSelectedCourses([...current, courseId]);
      setAlert(null);
    }
  };

  // Submit and save
  const handleSubmit = async () => {
    const coursesToSave = selectedCoursesList;

    if (coursesToSave.length > MAX_ALLOWED_SUBJECTS) {
      setAlert({
        status: "error",
        message: `Maximum ${MAX_ALLOWED_SUBJECTS} subjects can be selected.`,
      });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const { error } = await supabase
        .from("students")
        .update({
          registered_courses: coursesToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authdStudent?.id);

      if (error) throw error;

      if (authdStudent) {
        setAuthdStudent({
          ...authdStudent,
          registered_courses: coursesToSave,
        });
      }

      toaster.create({
        title: "Curriculum Saved!",
        description: `${coursesToSave.length} subjects registered. Loading your dashboard...`,
        type: "success",
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/student-dashboard");
      }, 1000);
    } catch (err: any) {
      setAlert({
        status: "error",
        message: err.message || "Failed to save selected courses. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Core":
        return { bg: "blue.50", text: "#1D4ED8", border: "#BFDBFE" };
      case "Science":
        return { bg: "teal.50", text: "#0F766E", border: "#99F6E4" };
      case "Social Science":
        return { bg: "purple.50", text: "#7E22CE", border: "#E9D5FF" };
      case "Arts":
        return { bg: "amber.50", text: "#B45309", border: "#FDE68A" };
      default:
        return { bg: "gray.100", text: "#475569", border: "#E2E8F0" };
    }
  };

  if (!authdStudent) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={{ base: "#F8FAFC", _dark: "#000000" }}>
        <DancingLogoLoader size="lg" text="Loading your student profile..." />
      </Flex>
    );
  }

  const remainingSlots = Math.max(0, MAX_ALLOWED_SUBJECTS - selectedCoursesList.length);

  return (
    <Box
      minH="100vh"
      bg={{ base: "#F8FAFC", _dark: "#000000" }}
      pb="110px"
    >
      {/* ── MOBILE APP APP-BAR HEADER ── */}
      <Box
        position="sticky"
        top={0}
        zIndex={30}
        bg={{ base: "white", _dark: "#121212" }}
        borderBottom="1px solid"
        borderColor={{ base: "gray.100", _dark: "#262626" }}
        boxShadow="xs"
      >
        <Flex
          maxW="640px"
          mx="auto"
          px={4}
          h="56px"
          align="center"
          justify="space-between"
        >
          <HStack gap={2.5} align="center">
            <Box>
              <Heading fontSize="16px" fontWeight="800" color={{ base: "#0F172A", _dark: "#F8FAFC" }}>
                Course Selection
              </Heading>
              <Text fontSize="11px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
                {authdStudent.class || "Secondary School"} · Maximum 8 Subjects
              </Text>
            </Box>
          </HStack>

          {/* Subject Counter Badge */}
          <Badge
            bg={{ base: "#EFF6FF", _dark: "rgba(37, 99, 235, 0.2)" }}
            color={{ base: "#206CE1", _dark: "#93C5FD" }}
            px={2.5}
            py={1}
            borderRadius="full"
            fontSize="12px"
            fontWeight="800"
            border="none"
          >
            {selectedCoursesList.length} / {MAX_ALLOWED_SUBJECTS}
          </Badge>
        </Flex>
      </Box>

      {/* ── MOBILE CONTENT CONTAINER ── */}
      <Box maxW="640px" mx="auto" px={4} pt={4}>
        {/* Core Rules Callout Card */}
        <Box
          p={3.5}
          borderRadius="xl"
          bg={{ base: "white", _dark: "#121212" }}
          border="1px solid"
          borderColor={{ base: "blue.100", _dark: "#262626" }}
          boxShadow="xs"
          mb={3.5}
        >
          <Flex align="flex-start" gap={3}>
            <Flex
              w="32px"
              h="32px"
              borderRadius="lg"
              bg={{ base: "blue.50", _dark: "rgba(37, 99, 235, 0.25)" }}
              color="#206CE1"
              align="center"
              justify="center"
              flexShrink={0}
              mt={0.5}
            >
              <Icon as={FiLayers} fontSize="16px" />
            </Flex>
            <Box flex={1}>
              <Text fontSize="xs" fontWeight="700" color={{ base: "#0F172A", _dark: "#F8FAFC" }}>
                Mandatory Core + Electives (Max 8)
              </Text>
              <Text fontSize="11.5px" color={{ base: "#475569", _dark: "#94A3B8" }} mt={0.5} lineHeight="1.5">
                <strong>Mathematics</strong> and <strong>English Language</strong> are compulsory core subjects and locked in. You can choose up to <strong>{remainingSlots}</strong> more {remainingSlots === 1 ? "subject" : "subjects"}.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Alert message if any */}
        {alert && (
          <Alert.Root status={alert.status} borderRadius="xl" mb={3.5} variant="subtle">
            <Alert.Indicator />
            <Alert.Description fontSize="xs" fontWeight="500">
              {alert.message}
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Search Input Bar */}
        <Box position="relative" mb={3}>
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
            h="42px"
            borderRadius="xl"
            pl={9}
            fontSize="xs"
            bg={{ base: "white", _dark: "#181818" }}
            borderColor={{ base: "gray.200", _dark: "#262626" }}
            _focus={{ borderColor: "#206CE1" }}
          />
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
          >
            <Icon as={FiSearch} fontSize="14px" />
          </Box>
          {searchQuery && (
            <Box
              position="absolute"
              right="12px"
              top="50%"
              transform="translateY(-50%)"
              cursor="pointer"
              color="gray.400"
              onClick={() => setSearchQuery("")}
            >
              <Icon as={FiX} fontSize="14px" />
            </Box>
          )}
        </Box>

        {/* Category Horizontal Filter Pills */}
        <Flex
          gap={1.5}
          overflowX="auto"
          pb={2.5}
          mb={3}
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Button
                key={cat}
                size="xs"
                variant={isActive ? "solid" : "outline"}
                bg={isActive ? "#206CE1" : { base: "white", _dark: "#181818" }}
                color={isActive ? "white" : { base: "gray.600", _dark: "gray.300" }}
                borderColor={isActive ? "#206CE1" : { base: "gray.200", _dark: "#262626" }}
                borderRadius="full"
                fontWeight="700"
                fontSize="11px"
                px={3}
                h="28px"
                flexShrink={0}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            );
          })}
        </Flex>

        {/* ── SUBJECT ITEMS LIST (PURE SUBJECT NAMES & CLEAN MOBILE ROWS) ── */}
        <VStack gap={2.5} align="stretch">
          {filteredCourses.map((course) => {
            const isSelected = selectedCoursesList.includes(course.id);
            const isMandatory = MANDATORY_CORE_IDS.includes(course.id);
            const catColor = getCategoryColor(course.category);
            const isMaxReached = !isSelected && selectedCoursesList.length >= MAX_ALLOWED_SUBJECTS;

            return (
              <Flex
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                align="center"
                justify="space-between"
                p={3.5}
                borderRadius="xl"
                border="1.5px solid"
                borderColor={
                  isMandatory
                    ? { base: "#93C5FD", _dark: "#1D4ED8" }
                    : isSelected
                    ? { base: "#206CE1", _dark: "#3B82F6" }
                    : { base: "gray.100", _dark: "#262626" }
                }
                bg={
                  isMandatory
                    ? { base: "#F0F7FF", _dark: "rgba(30, 58, 138, 0.22)" }
                    : isSelected
                    ? { base: "#F4F8FE", _dark: "rgba(37, 99, 235, 0.16)" }
                    : { base: "white", _dark: "#121212" }
                }
                cursor="pointer"
                transition="all 0.15s ease"
                _active={{ transform: "scale(0.99)" }}
                opacity={isMaxReached ? 0.6 : 1}
              >
                {/* Left: Icon, Subject Name & Category */}
                <HStack gap={3} align="center" flex={1}>
                  <Text fontSize="20px" lineHeight="1">
                    {course.icon}
                  </Text>
                  <Box>
                    <HStack gap={1.5} align="center">
                      <Text
                        fontSize="13.5px"
                        fontWeight="700"
                        color={{ base: "#0F172A", _dark: "#F8FAFC" }}
                        lineHeight="1.3"
                      >
                        {course.name}
                      </Text>
                      {isMandatory && (
                        <Icon as={FiLock} fontSize="11px" color="#206CE1" />
                      )}
                    </HStack>

                    <HStack gap={1.5} mt={0.5}>
                      <Badge
                        bg={catColor.bg}
                        color={catColor.text}
                        border="1px solid"
                        borderColor={catColor.border}
                        borderRadius="md"
                        fontSize="9.5px"
                        fontWeight="700"
                        px={1.5}
                        py={0.2}
                      >
                        {course.category}
                      </Badge>
                      {isMandatory && (
                        <Badge
                          bg="blue.100"
                          color="#1D4ED8"
                          fontSize="9.5px"
                          fontWeight="700"
                          px={1.5}
                          py={0.2}
                          borderRadius="md"
                        >
                          Compulsory
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>

                {/* Right: Check indicator */}
                <Flex
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  bg={
                    isMandatory || isSelected
                      ? "#206CE1"
                      : "transparent"
                  }
                  border="2px solid"
                  borderColor={
                    isMandatory || isSelected
                      ? "#206CE1"
                      : { base: "gray.300", _dark: "gray.600" }
                  }
                  color="white"
                  flexShrink={0}
                  transition="all 0.15s ease"
                >
                  {(isMandatory || isSelected) && (
                    <Icon as={FiCheck} fontSize="13px" strokeWidth={3} />
                  )}
                </Flex>
              </Flex>
            );
          })}
        </VStack>
      </Box>

      {/* ── MOBILE FIXED FLOATING BOTTOM ACTION BAR ── */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={40}
        bg={{ base: "rgba(255, 255, 255, 0.95)", _dark: "rgba(18, 18, 18, 0.96)" }}
        backdropFilter="blur(16px)"
        borderTop="1px solid"
        borderColor={{ base: "gray.200", _dark: "#262626" }}
        boxShadow="0 -4px 16px rgba(0, 0, 0, 0.06)"
        px={4}
        pt={3}
        pb="max(calc(env(safe-area-inset-bottom, 0px) + 10px), 12px)"
      >
        <Flex
          maxW="640px"
          mx="auto"
          align="center"
          justify="space-between"
          gap={3}
        >
          <Box>
            <HStack gap={1.5}>
              <Icon as={FiCheckCircle} color="#206CE1" fontSize="14px" />
              <Text fontSize="xs" fontWeight="700" color={{ base: "#0F172A", _dark: "#F8FAFC" }}>
                {selectedCoursesList.length} of {MAX_ALLOWED_SUBJECTS} Subjects
              </Text>
            </HStack>
            <Text fontSize="10.5px" color={{ base: "#64748B", _dark: "#94A3B8" }}>
              {remainingSlots === 0
                ? "Maximum 8 subjects selected"
                : `${remainingSlots} more slot${remainingSlots === 1 ? "" : "s"} available`}
            </Text>
          </Box>

          <Button
            onClick={handleSubmit}
            loading={isLoading}
            loadingText="Saving..."
            bg="#206CE1"
            color="white"
            h="44px"
            px={6}
            borderRadius="xl"
            fontWeight="700"
            fontSize="xs"
            disabled={selectedCoursesList.length < 2 || isLoading}
            shadow="md"
            _hover={{ bg: "#1852B2" }}
            _active={{ transform: "scale(0.98)" }}
          >
            Save & Continue →
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default CourseSelectionPage;
