import { Box, Heading, Grid, Text, Image, Flex, HStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GoArrowRight } from "react-icons/go";
import { LuBookOpen, LuGraduationCap } from "react-icons/lu";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useSubjects } from "@/student-app/context/dataContext";
import waec_img from "@/assets/waec_logo.png";
import jamb_img from "@/assets/jamb_logo.png";
import neco_img from "@/assets/neco_logo.png";
import gce_img from "@/assets/waec_gce_logo.jpg";
import nabtec_img from "@/assets/nabtec_logo.jpg";
import bece_img from "@/assets/national_bece_logo.png";
import YearsList from "./yearsList";

interface ExamOption {
  type: string;
  name: string;
  sub: string;
  tag: string;
  img: string;
}

const JUNIOR_EXAMS: ExamOption[] = [
  {
    type: "National BECE",
    name: "National Basic Education Certificate Examination",
    sub: "National BECE / Junior WAEC",
    tag: "National Board",
    img: bece_img,
  },
  {
    type: "State BECE",
    name: "State Basic Education Certificate Examination",
    sub: "State National BECE / Junior WAEC",
    tag: "State Board",
    img: bece_img,
  },
];

const SENIOR_EXAMS: ExamOption[] = [
  {
    type: "WAEC",
    name: "West African Examinations Council",
    sub: "WASSCE (May/June)",
    tag: "West Africa",
    img: waec_img,
  },
  {
    type: "NECO",
    name: "National Examinations Council",
    sub: "SSCE (June/July)",
    tag: "National Exam",
    img: neco_img,
  },
  {
    type: "JAMB",
    name: "Joint Admissions and Matriculation Board",
    sub: "UTME Tertiary Entrance",
    tag: "University Entry",
    img: jamb_img,
  },
  {
    type: "NABTEC",
    name: "National Business and Technical Examinations Board",
    sub: "NBC / NTC Technical Examinations",
    tag: "Technical & Vocational",
    img: nabtec_img,
  },
  {
    type: "GCE",
    name: "General Certificate of Education",
    sub: "WAEC GCE (Private Candidates)",
    tag: "Private Candidate",
    img: gce_img,
  },
];

interface PQsProps {
  selectedSubject?: string;
  onOpenSubjectModal?: (onSelectSubject?: (subject: string) => void) => void;
  selectedExam?: string | null;
  onSelectExam?: (exam: string | null) => void;
}

const PQs: React.FC<PQsProps> = ({
  selectedSubject = "General Mathematics",
  onOpenSubjectModal,
  selectedExam: controlledSelectedExam,
  onSelectExam,
}) => {
  const { authdStudent } = useAuthdStudentData();
  const { getSubjectByName } = useSubjects();
  const [internalSelectedExam, setInternalSelectedExam] = useState<string | null>(null);

  const selectedExam = controlledSelectedExam !== undefined ? controlledSelectedExam : internalSelectedExam;
  const setSelectedExam = (exam: string | null) => {
    if (onSelectExam) {
      onSelectExam(exam);
    } else {
      setInternalSelectedExam(exam);
    }
  };

  // Normalize student class to detect Junior (JSS 1 - JSS 3) vs Senior (SSS 1 - SSS 3)
  const studentClass = (authdStudent?.class || authdStudent?.grade_level || "").trim().toUpperCase();

  const isJuniorStudent =
    studentClass.startsWith("JSS") ||
    studentClass.includes("JUNIOR") ||
    studentClass.includes("J.S.S") ||
    studentClass.includes("BASIC 7") ||
    studentClass.includes("BASIC 8") ||
    studentClass.includes("BASIC 9");

  const isSeniorStudent =
    studentClass.startsWith("SSS") ||
    studentClass.startsWith("SS") ||
    studentClass.includes("SENIOR") ||
    studentClass.includes("S.S.S");

  // Default active tab based on student's detected school level
  const [activeTier, setActiveTier] = useState<"junior" | "senior">(() => {
    if (isJuniorStudent) return "junior";
    if (isSeniorStudent) return "senior";
    return "junior";
  });

  // Keep active tier updated if student data loads asynchronously
  useEffect(() => {
    if (isJuniorStudent) {
      setActiveTier("junior");
    } else if (isSeniorStudent) {
      setActiveTier("senior");
    }
  }, [studentClass, isJuniorStudent, isSeniorStudent]);

  // Handle clicking an exam card: sets the selected exam and opens the subject select popup!
  const handleExamClick = (examType: string) => {
    setSelectedExam(examType);
    if (onOpenSubjectModal) {
      onOpenSubjectModal();
    }
  };

  const currentExams = activeTier === "junior" ? JUNIOR_EXAMS : SENIOR_EXAMS;

  // Resolve subject ID for the selected subject
  const subjectData = getSubjectByName(selectedSubject);
  const resolvedSubjectId = subjectData?.id || selectedSubject.toLowerCase();

  return (
    <>
      {selectedExam ? (
        <YearsList
          onBack={() => setSelectedExam(null)}
          selectedExam={selectedExam}
          selectedCourse={selectedSubject}
          subjectId={resolvedSubjectId}
        />
      ) : (
        <Box bg="transparent" p={0} mb={20} w="100%">
          {/* Header Row: Clean, without 'Past Questions' or 'Senior School Examinations...' texts */}
          <Flex
            justify="flex-end"
            align="center"
            mb={4}
            w="100%"
          >
            {/* Reduced size select buttons between junior and senior school, without box shadows */}
            <HStack
              bg="#F1F5F9"
              p="3px"
              borderRadius="full"
              border="1px solid #E2E8F0"
              gap="2px"
            >
              <Box
                as="button"
                onClick={() => setActiveTier("junior")}
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="600"
                cursor="pointer"
                transition="all 0.15s ease"
                bg={activeTier === "junior" ? "#206CE1" : "transparent"}
                color={activeTier === "junior" ? "white" : "#64748B"}
                boxShadow="none"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <LuBookOpen size={12} />
                Junior (JSS 1–3)
              </Box>

              <Box
                as="button"
                onClick={() => setActiveTier("senior")}
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="600"
                cursor="pointer"
                transition="all 0.15s ease"
                bg={activeTier === "senior" ? "#206CE1" : "transparent"}
                color={activeTier === "senior" ? "white" : "#64748B"}
                boxShadow="none"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <LuGraduationCap size={12} />
                Senior (SSS 1–3)
              </Box>
            </HStack>
          </Flex>

          <Grid
            templateColumns={{
              base: "repeat(auto-fill, minmax(240px, 1fr))",
              md: "repeat(auto-fill, minmax(260px, 1fr))",
              lg: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
            gap={{ base: 4, md: 6 }}
            py={{ base: 2, md: 4 }}
          >
            {currentExams.map((exam) => (
              <Box
                key={exam.type}
                p={5}
                bg="#F8FAFC"
                borderWidth="1px"
                borderColor="#E2E8F0"
                borderRadius="xl"
                transition="all 0.15s ease"
                _hover={{
                  borderColor: "#206CE1",
                  bg: "#F1F5F9",
                }}
                _active={{ transform: "scale(0.99)" }}
                cursor="pointer"
                onClick={() => handleExamClick(exam.type)}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Heading fontSize="lg" fontWeight="800" color="#333951">
                      {exam.type}
                    </Heading>
                    <Box
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      bg="#EBF3FF"
                      color="#206CE1"
                      fontSize="10px"
                      fontWeight="700"
                      letterSpacing="0.03em"
                    >
                      {exam.tag}
                    </Box>
                  </Flex>

                  <Text color="#206CE1" fontWeight="600" fontSize="xs" mb={1}>
                    {exam.sub}
                  </Text>

                  <Text color="gray.600" fontSize="xs" lineHeight="1.4" minH="34px">
                    {exam.name}
                  </Text>
                </Box>

                <Flex
                  justify="center"
                  align="center"
                  my={4}
                  p={3}
                  bg="white"
                  borderRadius="lg"
                  border="1px solid #EEF2F6"
                  h="160px"
                >
                  <Image
                    src={exam.img}
                    alt={exam.type}
                    maxH="130px"
                    maxW="90%"
                    objectFit="contain"
                  />
                </Flex>

                <Flex
                  justify="space-between"
                  align="center"
                  pt={3}
                  borderTop="1px solid #E2E8F0"
                  color="#206CE1"
                  fontWeight="600"
                  fontSize="xs"
                >
                  <Text>View Questions</Text>
                  <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="#EBF3FF"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <GoArrowRight size={16} />
                  </Box>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default PQs;
