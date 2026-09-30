import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "../context/studentDataContext";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Image,
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  Input,
  Alert,
  Container,
} from "@chakra-ui/react";
import { FiSearch, FiCheck, FiX, FiLayers, FiBookOpen } from "react-icons/fi";
import { PiShootingStarDuotone, PiCheckCircleFill, PiStudentBold } from "react-icons/pi";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import logo from "@/assets/landing-page/logo.png";
import courseSelectIllustration from "@/assets/course-select-image.png";
import { getCourseThumbnail } from "@/student-app/utils/courseImages";

interface CourseDef {
  id: string;
  name: string;
  category: "Core" | "Science" | "Social Science" | "Arts" | "Elective";
  icon: string;
}

const JUNIOR_COURSES: CourseDef[] = [
  { id: "mathematics", name: "Mathematics", category: "Core", icon: "📐" },
  { id: "english", name: "English Language", category: "Core", icon: "📖" },
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
  { id: "mathematics", name: "General Mathematics", category: "Core", icon: "📐" },
  { id: "english", name: "English Language", category: "Core", icon: "📖" },
  { id: "physics", name: "Physics", category: "Science", icon: "⚡" },
  { id: "chemistry", name: "Chemistry", category: "Science", icon: "🧪" },
  { id: "biology", name: "Biology", category: "Science", icon: "🧬" },
  { id: "further mathematics", name: "Further Mathematics", category: "Science", icon: "♾️" },
  { id: "economics", name: "Economics", category: "Social Science", icon: "📊" },
  { id: "accounting", name: "Financial Accounting", category: "Social Science", icon: "🪙" },
  { id: "commerce", name: "Commerce", category: "Social Science", icon: "🤝" },
  { id: "government", name: "Government", category: "Social Science", icon: "⚖️" },
  { id: "literature", name: "Literature in English", category: "Arts", icon: "📚" },
  { id: "history", name: "History", category: "Arts", icon: "🏺" },
  { id: "geography", name: "Geography", category: "Arts", icon: "🗺️" },
  { id: "fine arts", name: "Visual / Fine Arts", category: "Arts", icon: "🎨" },
  { id: "computer science", name: "Computer Science", category: "Elective", icon: "💻" },
  { id: "french", name: "French Language", category: "Elective", icon: "🗼" },
];

/**
 * Safely parses any database/session course representation (array, JSON string, comma string, Postgres array)
 * into a clean lowercase string array.
 */
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
  const {
    effectivePlan,
    maxAllowedSubjects,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  // Normalize selectedCourses as a guaranteed array at all times
  const selectedCoursesList = useMemo(() => {
    return Array.isArray(selectedCourses) ? selectedCourses : safeParseCourses(selectedCourses);
  }, [selectedCourses]);

  // Redirect if not signed in & pre-fill existing courses safely
  useEffect(() => {
    if (!authdStudent) {
      navigate("/student-login");
    } else {
      const parsed = safeParseCourses(authdStudent.registered_courses);
      if (parsed.length > 0) {
        setSelectedCourses(parsed);
      }
    }
  }, [authdStudent, navigate]);

  // Determine course pool based on class
  const isSenior = authdStudent?.class?.toUpperCase().includes("SSS") ?? true;
  const availableCourses = useMemo(() => {
    return isSenior ? SENIOR_COURSES : JUNIOR_COURSES;
  }, [isSenior]);

  // Unique categories for filtering
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
    const current = selectedCoursesList;
    if (current.includes(courseId)) {
      setSelectedCourses(current.filter((id) => id !== courseId));
      setAlert(null);
    } else {
      if (current.length >= maxAllowedSubjects) {
        if (effectivePlan === "basic") {
          promptUpgrade(
            "Expanded Subject Selection",
            "standard",
            `You have reached the ${maxAllowedSubjects} starter subjects allowed on the Basic plan. Upgrade to Standard to select up to 8 subjects + full exam archives!`
          );
        } else {
          setAlert({
            status: "error",
            message: `You have selected the maximum ${maxAllowedSubjects} subjects permitted on the ${effectivePlan.toUpperCase()} plan.`,
          });
        }
        return;
      }
      setSelectedCourses([...current, courseId]);
      setAlert(null);
    }
  };

  // Submit and save
  const handleSubmit = async () => {
    const coursesToSave = selectedCoursesList;

    if (coursesToSave.length === 0) {
      setAlert({
        status: "error",
        message: "Please select at least 1 course to proceed.",
      });
      return;
    }

    if (coursesToSave.length > maxAllowedSubjects) {
      setAlert({
        status: "error",
        message: `Your current ${effectivePlan.toUpperCase()} plan allows up to ${maxAllowedSubjects} subjects.`,
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

      setAlert({
        status: "success",
        message: "Your academic curriculum has been configured! Launching your dashboard...",
      });

      setTimeout(() => {
        navigate("/student-dashboard");
      }, 1500);
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
        return { bg: "slate.100", text: "#475569", border: "#E2E8F0" };
    }
  };

  if (!authdStudent) {
    return (
      <Container centerContent py={20}>
        <DancingLogoLoader size="lg" text="Loading your student profile..." />
      </Container>
    );
  }

  const progressPercentage = Math.min(
    100,
    Math.round((selectedCoursesList.length / maxAllowedSubjects) * 100)
  );

  return (
    <Box minH="100vh" bg="#F8FAFC">
      {/* ── TOP NAVIGATION BAR ── */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
        position="sticky"
        top={0}
        zIndex={20}
        shadow="xs"
      >
        <Flex
          maxW="1440px"
          mx="auto"
          px={{ base: 4, md: 6, lg: 8 }}
          h="70px"
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <HStack gap={3}>
              <Image src={logo} alt="iGrade logo" h="38px" objectFit="contain" />
            </HStack>
          </RouterLink>

          {/* Student Badge & Onboarding Step */}
          <HStack gap={{ base: 2, sm: 4 }}>
            <Box textAlign="right" display={{ base: "none", sm: "block" }}>
              <Text fontSize="xs" fontWeight="700" color="#0F172A">
                {authdStudent.firstname} {authdStudent.lastname}
              </Text>
              <Text fontSize="11px" color="#64748B">
                Class: {authdStudent.class} · {effectivePlan.toUpperCase()} Plan
              </Text>
            </Box>
            <Flex
              w="38px"
              h="38px"
              borderRadius="full"
              bg="#EBF3FF"
              color="#206CE1"
              align="center"
              justify="center"
              fontWeight="700"
              fontSize="sm"
            >
              <Icon as={PiStudentBold} fontSize="20px" />
            </Flex>
          </HStack>
        </Flex>
      </Box>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <Box maxW="1440px" mx="auto" px={{ base: 4, md: 6, lg: 8 }} py={{ base: 6, lg: 8 }}>
        <Flex
          gap={{ base: 6, lg: 8 }}
          flexDirection={{ base: "column", lg: "row" }}
          align="stretch"
        >
          {/* ── LEFT HERO & ILLUSTRATION PANEL ── */}
          <Box
            w={{ base: "100%", lg: "38%", xl: "35%" }}
            flexShrink={0}
          >
            <Box
              bg="white"
              borderRadius={{ base: "2xl", sm: "3xl" }}
              p={{ base: 4, sm: 6, md: 7 }}
              border="1px solid"
              borderColor="gray.100"
              boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.05)"
              position={{ lg: "sticky" }}
              top={{ lg: "90px" }}
            >
              {/* Header Badge */}
              <HStack gap={2} mb={2}>
                <Badge
                  bg="#206CE1"
                  color="white"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Academic Setup
                </Badge>
                <Badge
                  colorPalette={effectivePlan === "basic" ? "gray" : "blue"}
                  variant="subtle"
                  fontSize="10px"
                  borderRadius="full"
                >
                  {isSenior ? "Senior Secondary (SSS)" : "Junior Secondary (JSS)"}
                </Badge>
              </HStack>

              <Heading
                as="h1"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="800"
                color="#0F172A"
                lineHeight="1.3"
                mb={2}
              >
                Welcome, {authdStudent.firstname}!
              </Heading>

              <Text fontSize="xs" color="#64748B" lineHeight="1.6" mb={4}>
                Select the subjects you are studying for <strong>{authdStudent.class}</strong>. This customizes your Spark AI tutor, generated revision tests, and past question archives.
              </Text>

              {/* ── PROMINENT ILLUSTRATION SHOWCASE ── */}
              <Box
                bg="linear-gradient(165deg, #F0F6FF 0%, #E2EDFD 50%, #EFF6FF 100%)"
                borderRadius="2xl"
                p={2}
                my={3}
                w="full"
                h={{ base: "190px", sm: "240px", md: "280px" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
                border="1px solid"
                borderColor="rgba(32, 108, 225, 0.18)"
                boxShadow="inset 0 1px 3px rgba(255, 255, 255, 0.9), 0 4px 16px -2px rgba(32, 108, 225, 0.08)"
              >
                {/* Decorative background aura */}
                <Box
                  position="absolute"
                  top="-20%"
                  right="-20%"
                  w="180px"
                  h="180px"
                  borderRadius="full"
                  bg="rgba(32, 108, 225, 0.12)"
                  filter="blur(30px)"
                  pointerEvents="none"
                />

                <Image
                  src={courseSelectIllustration}
                  alt="Curriculum and subject selection illustration"
                  w="auto"
                  h="100%"
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                  objectPosition="bottom center"
                  filter="drop-shadow(0 8px 18px rgba(32, 108, 225, 0.18))"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "scale(1.02)" }}
                />
              </Box>

              {/* ── PROGRESS & ALLOWANCE METER ── */}
              <Box
                mt={5}
                p={4}
                bg="#F8FAFC"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="xs" fontWeight="700" color="#334155">
                    Subjects Selected
                  </Text>
                  <Text fontSize="xs" fontWeight="800" color="#206CE1">
                    {selectedCoursesList.length} / {maxAllowedSubjects}
                  </Text>
                </Flex>

                {/* Progress track */}
                <Box
                  w="full"
                  h="8px"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                  mb={3}
                >
                  <Box
                    h="full"
                    w={`${progressPercentage}%`}
                    bg={
                      selectedCoursesList.length === maxAllowedSubjects
                        ? "#10B981"
                        : "#206CE1"
                    }
                    borderRadius="full"
                    transition="width 0.3s ease"
                  />
                </Box>

                <HStack justify="space-between" align="center">
                  <Text fontSize="11px" color="#64748B">
                    {effectivePlan === "basic"
                      ? "Basic plan: up to 4 starter subjects"
                      : `${effectivePlan.toUpperCase()} plan: up to ${maxAllowedSubjects} subjects`}
                  </Text>
                  {effectivePlan === "basic" && (
                    <Button
                      size="2xs"
                      variant="subtle"
                      colorPalette="blue"
                      fontWeight="700"
                      onClick={() =>
                        promptUpgrade(
                          "Expanded Subject Selection",
                          "standard",
                          "Upgrade to Standard (₦15,000) to select up to 8 subjects + full 10-year past questions archive!"
                        )
                      }
                    >
                      <PiShootingStarDuotone style={{ marginRight: "3px" }} />
                      Upgrade
                    </Button>
                  )}
                </HStack>
              </Box>

              {/* Learning Benefits Highlights */}
              <VStack align="stretch" gap={2} mt={4} pt={2}>
                <HStack gap={2} align="flex-start">
                  <Icon as={PiCheckCircleFill} color="#206CE1" fontSize="14px" mt={0.5} />
                  <Text fontSize="11px" color="#475569" lineHeight="1.4">
                    <strong>Tailored Practice:</strong> Quizzes are customized directly to your selected subjects.
                  </Text>
                </HStack>
                <HStack gap={2} align="flex-start">
                  <Icon as={PiCheckCircleFill} color="#206CE1" fontSize="14px" mt={0.5} />
                  <Text fontSize="11px" color="#475569" lineHeight="1.4">
                    <strong>Flexible Schedule:</strong> You can add or modify your courses anytime in Settings.
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* ── RIGHT SUBJECT CATALOG WORKSPACE ── */}
          <Box w={{ base: "100%", lg: "62%", xl: "65%" }}>
            <Box
              bg="white"
              borderRadius={{ base: "2xl", sm: "3xl" }}
              p={{ base: 4, sm: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.100"
              boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.05)"
            >
              {/* Alert notifications */}
              {alert && (
                <Alert.Root
                  status={alert.status}
                  borderRadius="xl"
                  mb={5}
                  variant="subtle"
                >
                  <Alert.Indicator />
                  <Alert.Description fontSize="xs" fontWeight="500">
                    {alert.message}
                  </Alert.Description>
                </Alert.Root>
              )}

              {/* Catalog Header */}
              <Flex
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                flexDirection={{ base: "column", sm: "row" }}
                gap={3}
                mb={6}
              >
                <Box>
                  <Heading as="h2" fontSize="lg" fontWeight="800" color="#0F172A">
                    Select Your Curriculum
                  </Heading>
                  <Text fontSize="xs" color="#64748B">
                    Choose from {availableCourses.length} available subjects for {authdStudent.class}
                  </Text>
                </Box>

                {/* Search input */}
                <Box position="relative" w={{ base: "full", sm: "240px" }}>
                  <Input
                    placeholder="Search subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="sm"
                    borderRadius="xl"
                    pl={9}
                    fontSize="xs"
                    borderColor="gray.200"
                    _focus={{ borderColor: "#206CE1" }}
                  />
                  <Box
                    position="absolute"
                    left="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  >
                    <Icon as={FiSearch} fontSize="14px" />
                  </Box>
                  {searchQuery && (
                    <Box
                      position="absolute"
                      right="10px"
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
              </Flex>

              {/* Category Filter Tabs */}
              <HStack
                gap={1.5}
                wrap="wrap"
                mb={6}
                pb={3}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <Button
                      key={cat}
                      size="xs"
                      variant={isActive ? "solid" : "ghost"}
                      bg={isActive ? "#206CE1" : "transparent"}
                      color={isActive ? "white" : "gray.600"}
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="11px"
                      px={3}
                      h="30px"
                      _hover={
                        isActive
                          ? { bg: "#1852B2" }
                          : { bg: "gray.100", color: "gray.900" }
                      }
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  );
                })}
              </HStack>

              {/* Active Selected Subjects Chip Tray */}
              {selectedCoursesList.length > 0 && (
                <Box mb={6} p={3.5} bg="#F8FAFC" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                  <Text fontSize="11px" fontWeight="700" color="#475569" mb={2} textTransform="uppercase" letterSpacing="0.05em">
                    Selected Subjects ({selectedCoursesList.length})
                  </Text>
                  <HStack gap={2} wrap="wrap">
                    {selectedCoursesList.map((id) => {
                      const course = availableCourses.find((c) => c.id === id);
                      return (
                        <Badge
                          key={id}
                          bg="white"
                          color="#0F172A"
                          border="1px solid"
                          borderColor="#BFDBFE"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="600"
                          cursor="pointer"
                          _hover={{ bg: "red.50", borderColor: "red.200", color: "red.700" }}
                          onClick={() => toggleCourse(id)}
                          display="inline-flex"
                          alignItems="center"
                          gap={1.5}
                        >
                          <span>{course?.icon || "📚"}</span>
                          <span>{course?.name || id}</span>
                          <Icon as={FiX} fontSize="11px" color="gray.400" />
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              )}

              {/* ── SUBJECT CARDS GRID ── */}
              {filteredCourses.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FiBookOpen} fontSize="32px" color="gray.300" mb={2} />
                  <Text fontSize="sm" fontWeight="600" color="gray.600">
                    No subjects match "{searchQuery}"
                  </Text>
                  <Button
                    size="xs"
                    mt={3}
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={3.5} mb={8}>
                  {filteredCourses.map((course) => {
                    const isSelected = selectedCoursesList.includes(course.id);
                    const catColor = getCategoryColor(course.category);
                    const isMaxReached =
                      !isSelected && selectedCoursesList.length >= maxAllowedSubjects;

                    return (
                      <Box
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        p={4}
                        borderRadius="2xl"
                        border="2px solid"
                        borderColor={isSelected ? "#206CE1" : "gray.100"}
                        bg={isSelected ? "#F0F6FE" : "white"}
                        boxShadow={
                          isSelected
                            ? "0 4px 12px rgba(32, 108, 225, 0.12)"
                            : "0 1px 3px rgba(0, 0, 0, 0.02)"
                        }
                        cursor="pointer"
                        transition="all 0.2s ease"
                        _hover={{
                          borderColor: isSelected ? "#1852B2" : "gray.300",
                          transform: "translateY(-2px)",
                          shadow: "md",
                        }}
                        opacity={isMaxReached ? 0.75 : 1}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        minH="105px"
                      >
                        {/* Top row: Category tag & Check indicator */}
                        <Flex justify="space-between" align="center" mb={2}>
                          <Badge
                            bg={catColor.bg}
                            color={catColor.text}
                            border="1px solid"
                            borderColor={catColor.border}
                            borderRadius="md"
                            fontSize="10px"
                            fontWeight="700"
                            px={2}
                            py={0.5}
                          >
                            {course.category}
                          </Badge>

                          <Flex
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            align="center"
                            justify="center"
                            bg={isSelected ? "#206CE1" : "transparent"}
                            border="2px solid"
                            borderColor={isSelected ? "#206CE1" : "gray.300"}
                            color="white"
                            transition="all 0.2s"
                          >
                            {isSelected && <Icon as={FiCheck} fontSize="12px" strokeWidth={3} />}
                          </Flex>
                        </Flex>

                        {/* Course Graphic Banner */}
                        <Box
                          h="58px"
                          w="full"
                          borderRadius="xl"
                          overflow="hidden"
                          mb={2.5}
                          bg={`url("${getCourseThumbnail(course.id)}")`}
                          backgroundSize="cover"
                          backgroundPosition="center"
                          backgroundRepeat="no-repeat"
                          border="1px solid"
                          borderColor="rgba(0, 0, 0, 0.05)"
                          boxShadow="xs"
                        />

                        {/* Subject Title */}
                        <HStack gap={2} align="center">
                          <Text fontSize="md">{course.icon}</Text>
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="#0F172A"
                            lineHeight="1.3"
                          >
                            {course.name}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}

              {/* ── ACTION FOOTER & SUBMIT BUTTON ── */}
              <Box
                pt={5}
                borderTop="1px solid"
                borderColor="gray.100"
                display="flex"
                flexDirection={{ base: "column", sm: "row" }}
                alignItems={{ base: "stretch", sm: "center" }}
                justifyContent="space-between"
                gap={4}
              >
                <HStack gap={2}>
                  <Icon as={FiLayers} color="#206CE1" fontSize="16px" />
                  <Text fontSize="xs" fontWeight="600" color="#334155">
                    {selectedCoursesList.length === 0
                      ? "Select at least 1 course to continue"
                      : `${selectedCoursesList.length} of ${maxAllowedSubjects} subjects selected`}
                  </Text>
                </HStack>

                <Button
                  onClick={handleSubmit}
                  loading={isLoading}
                  loadingText="Saving Curriculum..."
                  bg="#206CE1"
                  color="white"
                  h="48px"
                  px={8}
                  borderRadius="xl"
                  fontWeight="700"
                  fontSize="sm"
                  disabled={selectedCoursesList.length === 0 || isLoading}
                  shadow="md"
                  _hover={{
                    bg: "#1852B2",
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Continue to Dashboard →
                </Button>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default CourseSelectionPage;
