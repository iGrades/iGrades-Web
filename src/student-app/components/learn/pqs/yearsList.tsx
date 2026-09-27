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
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";

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

  const {
    effectivePlan,
    verifyPQYear,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

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
    // Entitlement check
    const access = verifyPQYear(year);
    if (!access.allowed) {
      promptUpgrade(
        `${selectedExam || "Examination"} Past Questions (${year})`,
        access.requiredPlan,
        access.reason || `Past questions for ${year} require a Standard or Premium plan. Upgrade to Standard (₦15,000) for full 10-year archives!`
      );
      return;
    }

    setLoading(true);
    setSelectedYear(year);

    try {
      const { data: pqData, error: pqError } = await supabase
        .from("past_questions")
        .select("*")
        .eq("exam_type", selectedExam)
        .eq("year", year)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (pqError) {
        console.error("Error fetching past questions:", pqError);
      }

      if (pqData && pqData.length > 0) {
        setFetchedPQs(pqData);
      } else {
        const aliases: string[] = [];
        if (selectedExam?.includes("BECE")) {
          aliases.push("BECE", "National BECE", "Junior WAEC", "State BECE");
        } else if (selectedExam === "NABTEC" || selectedExam === "NABTEB") {
          aliases.push("NABTEB", "NABTEC");
        } else if (selectedExam === "GCE" || selectedExam === "WAEC GCE") {
          aliases.push("WAEC GCE", "GCE");
        }

        let foundAliased = false;
        for (const alias of aliases) {
          if (alias === selectedExam) continue;
          const { data: aliasData } = await supabase
            .from("past_questions")
            .select("*")
            .eq("exam_type", alias)
            .eq("year", year)
            .eq("subject_id", subjectId)
            .order("created_at", { ascending: false });
          if (aliasData && aliasData.length > 0) {
            setFetchedPQs(aliasData);
            foundAliased = true;
            break;
          }
        }

        if (!foundAliased) {
          setFetchedPQs(pqData || []);
        }
      }
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
    if (!bytes) return "Standard Size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Box>
      {/* Header */}
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={5}
        mx={2}
        fontSize={{ base: "lg", md: "xl" }}
      >
        <LuArrowLeft
          onClick={selectedYear ? handleBackToYears : onBack}
          style={{ cursor: "pointer" }}
        />
        {selectedYear
          ? `${selectedExam} ${selectedCourse} (${selectedYear})`
          : `${selectedExam} ${selectedCourse} Past Questions`}
      </Heading>

      {/* Content Area */}
      {selectedYear ? (
        /* Questions List for Selected Year */
        <Box>
          <VStack gap={4} align="stretch">
            {fetchedPQs.length === 0 && !loading && (
              <Box textAlign="center" py={10}>
                <Text color="gray.500">
                  No past questions found for {selectedExam} {selectedCourse} in {selectedYear}.
                </Text>
              </Box>
            )}

            {fetchedPQs.map((pq) => (
              <Flex
                key={pq.id}
                p={{ base: 4, md: 6 }}
                bg="textFieldColor"
                borderRadius="lg"
                justify="space-between"
                align="center"
                _hover={{ boxShadow: "sm" }}
                transition="all 0.2s"
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 3, sm: 0 }}
              >
                <Box>
                  <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                    {pq.exam_type} {pq.year} Past Questions
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    File size: {formatFileSize(pq.file_size)} • Uploaded:{" "}
                    {new Date(pq.created_at).toLocaleDateString()}
                  </Text>
                </Box>

                <Flex gap={2} mt={{ base: 2, sm: 0 }}>
                  <Link
                    href={getFileUrl(pq.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="secondaryColor"
                    color="white"
                    display="flex"
                    justifyContent={"center"}
                    alignItems="center"
                    gap={1.5}
                    textDecoration="none"
                    fontSize={{ base: "xs", md: "xs" }}
                    w={{ base: "28", md: "32" }}
                    p={{ base: 2, md: 3 }}
                    rounded={{ base: "lg", md: "3xl" }}
                    onClick={(e) => {
                      const access = verifyPQYear(pq.year);
                      if (!access.allowed) {
                        e.preventDefault();
                        promptUpgrade("Past Questions Viewer", access.requiredPlan, access.reason);
                      }
                    }}
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
                    alignItems="center"
                    gap={1.5}
                    textDecoration="none"
                    fontSize={{ base: "xs", md: "xs" }}
                    w={{ base: "28", md: "32" }}
                    p={{ base: 2, md: 3 }}
                    rounded={{ base: "lg", md: "3xl" }}
                    onClick={(e) => {
                      const access = verifyPQYear(pq.year);
                      if (!access.allowed) {
                        e.preventDefault();
                        e.stopPropagation();
                        promptUpgrade("Past Questions Download", access.requiredPlan, access.reason);
                      }
                    }}
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
            {pqYears.map((year) => {
              const access = verifyPQYear(year);
              const isLocked = !access.allowed;

              return (
                <Box
                  key={year}
                  bg={isLocked ? "gray.50" : "textFieldColor"}
                  p={6}
                  borderRadius="lg"
                  cursor="pointer"
                  border={isLocked ? "1px dashed" : "1px solid transparent"}
                  borderColor={isLocked ? "orange.200" : "transparent"}
                  _hover={{
                    boxShadow: "sm",
                    bg: isLocked ? "orange.50/50" : "blue.50",
                    transform: "translateY(-2px)",
                  }}
                  textAlign="center"
                  onClick={() => handleYearClick(year)}
                  transition="all 0.2s"
                  opacity={loading ? 0.6 : 1}
                  pointerEvents={loading ? "none" : "auto"}
                  position="relative"
                >
                  <Text fontWeight="semibold" fontSize="lg" color={isLocked ? "gray.700" : "gray.900"}>
                    {year}
                  </Text>
                  {isLocked && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <LockedBadge requiredPlan="standard" label="Standard" size="xs" variant="solid" />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Grid>
        </Box>
      )}

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

export default YearsList;
