import { Box, Flex, Heading, Text, Badge, Icon, Grid, HStack } from "@chakra-ui/react";
import {
  PiSmileyFill,
  PiNotebookFill,
  PiHandHeartFill,
  PiCalendarCheckFill,
  PiLightbulbFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { WeeklyRecommendation } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  recommendations: WeeklyRecommendation[];
  studentFirstName: string;
};

export const WeeklyRecommendations = ({ recommendations, studentFirstName }: Props) => {
  const { t } = useTranslation();

  const getRecMeta = (type: WeeklyRecommendation["type"]) => {
    switch (type) {
      case "celebrate":
        return {
          icon: PiSmileyFill,
          color: "green.600",
          bg: "green.50",
          border: "green.200",
          badgePalette: "green",
        };
      case "practice":
        return {
          icon: PiNotebookFill,
          color: "orange.600",
          bg: "orange.50",
          border: "orange.200",
          badgePalette: "orange",
        };
      case "support":
        return {
          icon: PiHandHeartFill,
          color: "blue.600",
          bg: "blue.50",
          border: "blue.200",
          badgePalette: "blue",
        };
      case "routine":
      default:
        return {
          icon: PiCalendarCheckFill,
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
        <HStack gap={2.5}>
          <Box bg="amber.50" p={2} borderRadius="xl" border="1px solid" borderColor="amber.200" boxShadow="0 2px 6px rgba(245, 158, 11, 0.12)">
            <Icon as={PiLightbulbFill} color="amber.600" boxSize="18px" />
          </Box>
          <Box>
            <Heading size="sm" color="gray.900" fontWeight="800">
              {t("Recommended Action for Parents")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Constructive, practical suggestions derived from")} {studentFirstName}'s {t("recent practice results.")}
            </Text>
          </Box>
        </HStack>
        <Badge colorPalette="green" variant="subtle" size="sm" borderRadius="full">
          {t("Supportive Guidance")}
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
                    <Icon as={meta.icon} color={meta.color} boxSize="16px" />
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
