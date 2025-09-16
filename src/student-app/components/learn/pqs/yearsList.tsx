import {
  Box,
  Heading,
  Grid,
  Text,
  Flex,
  VStack,
  Link,
} from "@chakra-ui/react";
import { LuArrowLeft, LuDownload, LuEye } from "react-icons/lu";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

type Props = {
  onBack: () => void;
  selectedExam: string | null;
  selectedCourse?: string | null;
  subjectId?: string | null;
};

interface PastQuestion {
  id: string;
  subject_id: string;
  exam_type: string;
  year: string;
  file_url: string;
  file_size?: number;
  created_at: string;
  // We'll join with subjects table to get the subject name
  subjects?: {
    name: string;
  };
}

const YearsList = ({
  onBack,
  selectedExam,
  selectedCourse,
  subjectId,
}: Props) => {
  const [fetchedPQs, setFetchedPQs] = useState<PastQuestion[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pqYears = [
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
  ];

  const handleYearClick = async (year: string) => {
    setLoading(true);
    setSelectedYear(year);

    try {
      // Now fetch past questions with the subject_id
      const { data: pqData, error: pqError } = await supabase
        .from("past_questions")
        .select("*")
        .eq("exam_type", selectedExam)
        .eq("year", year)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (pqError) {
        console.error("Error fetching past questions:", pqError);
        return;
      }

      console.log("Fetched past questions:", pqData);

      setFetchedPQs(pqData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToYears = () => {
    setFetchedPQs([]);
    setSelectedYear(null);
  };

  const getFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    if (fileUrl.startsWith("supabase://")) {
      const path = fileUrl.replace("supabase://", "");
      const { data } = supabase.storage
        .from("past-questions")
        .getPublicUrl(path);
      return data.publicUrl;
    }
    return fileUrl;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} minH="75vh">
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
        <LuArrowLeft
          onClick={fetchedPQs.length > 0 ? handleBackToYears : onBack}
          style={{ cursor: "pointer" }}
        />
        {fetchedPQs.length > 0
          ? `${selectedYear} Past Questions`
          : "Select Year"}
      </Heading>

      {/* Display fetched Past Questions */}
      {fetchedPQs.length > 0 ? (
        <Box>
          <VStack gap={4} align="stretch">
            {fetchedPQs.map((pq) => (
              <Flex
                key={pq.id}
                direction={{ base: "column", md: "row" }}
                p={4}
                borderRadius="lg"
                bg="textFieldColor"
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                _hover={{ bg: "gray.100" }}
                gap={4}
              >
                <Box flex={1}>
                  <Text fontWeight="500" fontSize="md" mb={1} color="on_backgroundColor">
                    {pq.subjects?.name || selectedCourse} - {pq.year}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {pq.exam_type} • {pq.year}
                    {pq.file_size && ` • ${formatFileSize(pq.file_size)}`}
                  </Text>
                </Box>

                <Flex gap={3}>
                  <Link
                    href={getFileUrl(pq.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="white"
                    border="1px solid"
                    borderColor="primaryColor"
                    color="primaryColor"
                    display="flex"
                    justifyContent={"center"}
                    textDecoration="none"
                    fontSize={{ base: "xs", md: "xs" }}
                    w={{ base: "28", md: "32" }}
                    p={{ base: 2, md: 3 }}
                    rounded={{ base: "lg", md: "3xl" }}
                    onClick={() =>
                      window.open(getFileUrl(pq.file_url), "_blank")
                    }
                  >
                    View <LuEye size={16} />
                  </Link>

                  <Link
                    href={getFileUrl(pq.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="primaryColor"
                    color="white"
                    display="flex"
                    justifyContent={"center"}
                    textDecoration="none"
                    fontSize={{ base: "xs", md: "xs" }}
                    w={{ base: "28", md: "32" }}
                    p={{ base: 2, md: 3 }}
                    rounded={{ base: "lg", md: "3xl" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download <LuDownload size={16} />
                  </Link>
                </Flex>
              </Flex>
            ))}
          </VStack>
        </Box>
      ) : (
        /* Year Selection Grid */
        <Box>
          {loading && (
            <Text textAlign="center" color="blue.500" mb={4}>
              Loading...
            </Text>
          )}

          <Grid
            templateColumns={{
              base: "repeat(auto-fill, minmax(100px, 1fr))",
              md: "repeat(auto-fill, minmax(120px, 1fr))",
              lg: "repeat(auto-fill, minmax(175px, 1fr))",
            }}
            gap={{ base: 4, md: 6 }}
            py={{ base: 4, md: 6 }}
          >
            {pqYears.map((year) => (
              <Box
                key={year}
                bg="textFieldColor"
                p={6}
                borderRadius="lg"
                cursor="pointer"
                _hover={{
                  boxShadow: "sm",
                  bg: "blue.50",
                  transform: "translateY(-2px)",
                }}
                textAlign="center"
                onClick={() => handleYearClick(year)}
                transition="all 0.2s"
                opacity={loading ? 0.6 : 1}
                pointerEvents={loading ? "none" : "auto"}
              >
                <Text fontWeight="medium" fontSize="lg">
                  {year}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default YearsList;
