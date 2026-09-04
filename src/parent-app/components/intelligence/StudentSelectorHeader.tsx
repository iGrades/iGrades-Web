import { Box, Flex, HStack, Text, Heading, Badge, Button, Icon } from "@chakra-ui/react";
import AvatarComp from "@/components/avatar";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiTarget, FiPlus, FiCheckCircle } from "react-icons/fi";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  students: any[];
  selectedStudent: any;
  onSelectStudent: (student: any) => void;
  intelligence: StudentIntelligence | null;
  onAddChildClick: () => void;
};

export const StudentSelectorHeader = ({
  students,
  selectedStudent,
  onSelectStudent,
  intelligence,
  onAddChildClick,
}: Props) => {
  const statusColorMap: Record<string, { color: string; bg: string; icon: string }> = {
    "Active Learner": { color: "green.700", bg: "green.50", icon: "🚀" },
    "Consistent Pacing": { color: "blue.700", bg: "blue.50", icon: "🌟" },
    "Needs Practice Boost": { color: "orange.700", bg: "orange.50", icon: "🎯" },
    "Getting Started": { color: "purple.700", bg: "purple.50", icon: "🌱" },
  };

  const currentStatus = intelligence?.learningStatus || "Getting Started";
  const statusMeta = statusColorMap[currentStatus] || { color: "blue.700", bg: "blue.50", icon: "✨" };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="0 2px 14px rgba(32, 108, 225, 0.06)"
      border="1px solid"
      borderColor="gray.100"
      mb={6}
      overflow="hidden"
      position="relative"
    >
      {/* Top Accent Strip */}
      <Box h="4px" w="full" bgGradient="linear(to-r, #1E56B3, #206CE1, #38BDF8)" />

      <Box p={{ base: 4, md: 6 }}>
        {/* Child Selector Tabs (Active when multiple children exist, or single child switcher) */}
        <Box mb={5} pb={4} borderBottom="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
            <HStack gap={2}>
              <Text fontSize="xs" fontWeight="800" color="#1E56B3" textTransform="uppercase" letterSpacing="0.06em">
                Student Profile:
              </Text>
              <Text fontSize="xs" color="gray.500">
                {students.length > 1 ? "Click to switch between your children" : "Your registered child"}
              </Text>
            </HStack>

            <Button
              size="xs"
              variant="subtle"
              colorPalette="blue"
              onClick={onAddChildClick}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={3}
              _hover={{ bg: "blue.100" }}
            >
              <Icon as={FiPlus} mr={1} /> Add Another Child
            </Button>
          </Flex>

          {/* Child Selection Pills */}
          <Flex gap={2.5} wrap="wrap" align="center">
            {students.map((st) => {
              const isSelected = selectedStudent?.id === st.id;
              const initials = `${(st.firstname || "S")[0]}${(st.lastname || "T")[0]}`.toUpperCase();

              return (
                <Button
                  key={st.id}
                  size="sm"
                  h="42px"
                  bg={isSelected ? "#206CE1" : "gray.50"}
                  color={isSelected ? "white" : "gray.800"}
                  border="1px solid"
                  borderColor={isSelected ? "#1E56B3" : "gray.200"}
                  borderRadius="xl"
                  px={3.5}
                  onClick={() => onSelectStudent(st)}
                  fontSize="xs"
                  fontWeight={isSelected ? "800" : "600"}
                  shadow={isSelected ? "md" : "none"}
                  _hover={isSelected ? {} : { bg: "blue.50", borderColor: "blue.200", color: "#1E56B3" }}
                  transition="all 0.2s"
                >
                  <HStack gap={2}>
                    <Box
                      w="24px"
                      h="24px"
                      borderRadius="full"
                      bg={isSelected ? "white/20" : "blue.100"}
                      color={isSelected ? "white" : "#1E56B3"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="10px"
                      fontWeight="bold"
                    >
                      {initials}
                    </Box>
                    <Text>{st.firstname} {st.lastname}</Text>
                    <Badge
                      size="xs"
                      bg={isSelected ? "white/25" : "gray.200"}
                      color={isSelected ? "white" : "gray.700"}
                      borderRadius="full"
                      px={2}
                      fontSize="10px"
                    >
                      {st.class || "Student"}
                    </Badge>
                  </HStack>
                </Button>
              );
            })}
          </Flex>
        </Box>

        {/* Selected Child Hero Details */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "start", lg: "center" }}
          gap={5}
        >
          {/* Avatar and Info */}
          <Flex align="center" gap={4} minW="0" flex="1">
            <Box
              p="3px"
              borderRadius="full"
              bgGradient="linear(to-tr, #1E56B3, #38BDF8)"
              shadow="sm"
              flexShrink={0}
            >
              <AvatarComp
                username={`${selectedStudent?.firstname || ""} ${selectedStudent?.lastname || ""}`}
                profileImage={selectedStudent?.profile_image}
              />
            </Box>

            <Box minW="0">
              <HStack gap={2} wrap="wrap" align="center" mb={1}>
                <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800" truncate>
                  {selectedStudent?.firstname} {selectedStudent?.lastname}
                </Heading>

                {intelligence && (
                  <Badge
                    bg={statusMeta.bg}
                    color={statusMeta.color}
                    border="1px solid"
                    borderColor={`${statusMeta.color.split(".")[0]}.200`}
                    size="sm"
                    px={3}
                    py={0.5}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    <Text as="span" mr={1}>{statusMeta.icon}</Text>
                    {currentStatus}
                  </Badge>
                )}
              </HStack>

              <HStack gap={2} color="gray.600" fontSize="xs" wrap="wrap">
                <Badge colorPalette="gray" variant="surface" size="sm" px={2} borderRadius="md">
                  {selectedStudent?.class || "Class Student"}
                </Badge>
                <Text color="gray.300">•</Text>
                <Text fontWeight="600" color="gray.700">{selectedStudent?.school || "Academic School"}</Text>
                {intelligence && (
                  <>
                    <Text color="gray.300">•</Text>
                    <HStack gap={1} color="#1E56B3" fontWeight="700">
                      <Icon as={FiTarget} />
                      <Text>{intelligence.examTarget}</Text>
                    </HStack>
                  </>
                )}
              </HStack>
            </Box>
          </Flex>

          {/* Quick Highlight Stats on Right */}
          {intelligence && intelligence.hasData && (
            <Flex
              gap={3}
              wrap="wrap"
              bg="gray.50/80"
              p={3}
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200/70"
              align="center"
              justify={{ base: "start", sm: "flex-end" }}
            >
              {/* Average Score */}
              <Box px={2}>
                <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                  Average Score
                </Text>
                <HStack gap={1.5} align="baseline" mt={0.5}>
                  <Text fontSize="xl" fontWeight="800" color="#1E56B3">
                    {intelligence.overallAccuracy}%
                  </Text>
                  <Badge
                    colorPalette={
                      intelligence.overallAccuracy >= 75 ? "green" : intelligence.overallAccuracy >= 55 ? "blue" : "orange"
                    }
                    size="xs"
                    variant="solid"
                  >
                    Grade {intelligence.overallGrade}
                  </Badge>
                </HStack>
              </Box>

              {/* Trajectory */}
              <Box borderLeft="1px solid" borderColor="gray.200" pl={3} pr={2}>
                <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                  Score Trend
                </Text>
                <HStack
                  gap={1}
                  color={
                    intelligence.overallTrend === "up"
                      ? "green.600"
                      : intelligence.overallTrend === "down"
                      ? "red.600"
                      : "gray.600"
                  }
                  fontWeight="700"
                  fontSize="xs"
                  mt={0.5}
                >
                  <Icon
                    as={
                      intelligence.overallTrend === "up"
                        ? FiTrendingUp
                        : intelligence.overallTrend === "down"
                        ? FiTrendingDown
                        : FiMinus
                    }
                  />
                  <Text>
                    {intelligence.overallTrend === "up"
                      ? `+${intelligence.overallTrendDiff}% Improving`
                      : intelligence.overallTrend === "down"
                      ? `${intelligence.overallTrendDiff}% Needs Review`
                      : "Steady"}
                  </Text>
                </HStack>
              </Box>

              {/* Quizzes Taken */}
              <Box borderLeft="1px solid" borderColor="gray.200" pl={3} pr={1}>
                <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                  Quizzes
                </Text>
                <HStack gap={1} color="gray.800" fontSize="xs" fontWeight="700" mt={0.5}>
                  <Icon as={FiCheckCircle} color="teal.500" />
                  <Text>{intelligence.totalPracticeSessions} tests</Text>
                </HStack>
              </Box>
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
