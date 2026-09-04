import { Box, Flex, Heading, Text, Badge, Icon, Grid } from "@chakra-ui/react";
import {
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiSmile,
} from "react-icons/fi";
import type { WeeklyRecommendation } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  recommendations: WeeklyRecommendation[];
  studentFirstName: string;
};

export const WeeklyRecommendations = ({ recommendations, studentFirstName }: Props) => {
  const getRecMeta = (type: WeeklyRecommendation["type"]) => {
    switch (type) {
      case "celebrate":
        return {
          icon: FiSmile,
          color: "green.600",
          bg: "green.50",
          border: "green.200",
          badgePalette: "green",
        };
      case "practice":
        return {
          icon: FiTarget,
          color: "orange.600",
          bg: "orange.50",
          border: "orange.200",
          badgePalette: "orange",
        };
      case "support":
        return {
          icon: FiTrendingUp,
          color: "blue.600",
          bg: "blue.50",
          border: "blue.200",
          badgePalette: "blue",
        };
      case "routine":
      default:
        return {
          icon: FiCalendar,
          color: "purple.600",
          bg: "purple.50",
          border: "purple.200",
          badgePalette: "purple",
        };
    }
  };

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5} wrap="wrap" gap={2}>
        <Box>
          <Heading size="sm" color="gray.900" fontWeight="800">
            Recommended Action for Parents
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Constructive, practical suggestions derived from {studentFirstName}'s recent practice results.
          </Text>
        </Box>
        <Badge colorPalette="green" variant="subtle" size="sm" borderRadius="full">
          Supportive Guidance
        </Badge>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={3.5}>
        {recommendations.map((rec) => {
          const meta = getRecMeta(rec.type);
          return (
            <Box
              key={rec.id}
              bg="white"
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor={meta.border}
              boxShadow="0 1px 4px rgba(0,0,0,0.02)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Badge colorPalette={meta.badgePalette} variant="solid" size="xs" borderRadius="full">
                    {rec.badgeText}
                  </Badge>
                  <Box bg={meta.bg} p={1.5} borderRadius="lg">
                    <Icon as={meta.icon} color={meta.color} boxSize="15px" />
                  </Box>
                </Flex>

                <Text fontSize="sm" fontWeight="800" color="gray.900" mb={1.5}>
                  {rec.title}
                </Text>

                <Text fontSize="xs" color="gray.600" lineHeight="tall">
                  {rec.action}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
