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

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
        {recommendations.map((rec) => {
          const meta = getRecMeta(rec.type);
          return (
            <Box
              key={rec.id}
              bg="white"
              p={5}
              borderRadius="2xl"
              border="none"
              boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05)",
              }}
              transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <Box>
                <Flex justify="space-between" align="center" mb={2.5}>
                  <Badge colorPalette={meta.badgePalette} variant="solid" size="xs" borderRadius="full">
                    {rec.badgeText}
                  </Badge>
                  <Box bg={meta.bg} p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.05)">
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
