import { Box, Grid, GridItem, Flex, Heading, Text, VStack, HStack, Icon, Badge } from "@chakra-ui/react";
import { FiAlertCircle, FiHeart, FiCheck, FiInfo } from "react-icons/fi";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const AttentionAndActionsSection = ({ intelligence }: Props) => {
  const { needsAttentionAlerts, parentRecommendations } = intelligence;

  return (
    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={5} mb={6}>
      {/* 1. What Needs Attention? */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="2xl"
          border="none"
          boxShadow="0 10px 30px -5px rgba(245, 158, 11, 0.16), 0 4px 14px -2px rgba(15, 23, 42, 0.05)"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "0 16px 36px -4px rgba(245, 158, 11, 0.24), 0 6px 16px -2px rgba(15, 23, 42, 0.06)",
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack gap={2.5}>
              <Box bg="amber.50" p={2.5} borderRadius="xl" border="none" boxShadow="0 2px 8px rgba(245, 158, 11, 0.2)">
                <Icon as={FiAlertCircle} color="amber.600" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  What Needs Attention?
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Topics and areas where your child could use extra practice or support.
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="amber" variant="subtle" size="sm" borderRadius="full" px={2.5} py={0.5}>
              {needsAttentionAlerts.length} Points
            </Badge>
          </Flex>

          <VStack align="stretch" gap={3} flex="1">
            {needsAttentionAlerts.map((alert) => {
              const isWarning = alert.severity === "warning";
              const isPositive = alert.severity === "positive";

              const bgCol = isWarning ? "amber.50/60" : isPositive ? "green.50/60" : "blue.50/60";
              const iconCol = isWarning ? "amber.600" : isPositive ? "green.600" : "#206CE1";
              const iconComponent = isWarning ? FiAlertCircle : isPositive ? FiCheck : FiInfo;
              const shadowCol = isWarning
                ? "0 2px 10px rgba(245, 158, 11, 0.14)"
                : isPositive
                ? "0 2px 10px rgba(16, 185, 129, 0.14)"
                : "0 2px 10px rgba(32, 108, 225, 0.14)";

              return (
                <Box
                  key={alert.id}
                  p={4}
                  borderRadius="xl"
                  border="none"
                  boxShadow={shadowCol}
                  bg={bgCol}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(245, 158, 11, 0.2)" }}
                  transition="all 0.2s"
                >
                  <HStack align="start" gap={2.5}>
                    <Icon as={iconComponent} color={iconCol} mt={0.5} boxSize="16px" flexShrink={0} />
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {alert.title}
                      </Text>
                      <Text fontSize="xs" color="gray.700" mt={0.5} lineHeight="tall">
                        {alert.message}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </GridItem>

      {/* 2. What Can I Do? */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="2xl"
          border="none"
          boxShadow="0 10px 30px -5px rgba(32, 108, 225, 0.12), 0 4px 14px -2px rgba(15, 23, 42, 0.04)"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "0 16px 36px -4px rgba(32, 108, 225, 0.20), 0 6px 16px -2px rgba(15, 23, 42, 0.05)",
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack gap={2.5}>
              <Box bg="blue.50" p={2.5} borderRadius="xl" border="none" boxShadow="0 2px 8px rgba(32, 108, 225, 0.18)">
                <Icon as={FiHeart} color="#206CE1" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  What Can I Do?
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Simple, practical tips you can use to help your child improve right now.
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full" px={2.5} py={0.5}>
              Helpful Tips
            </Badge>
          </Flex>

          <VStack align="stretch" gap={3} flex="1">
            {parentRecommendations.map((rec) => {
              const categoryBadgeColor =
                rec.category === "celebrate"
                  ? "green"
                  : rec.category === "practice"
                  ? "orange"
                  : rec.category === "support"
                  ? "purple"
                  : "blue";

              return (
                <Box
                  key={rec.id}
                  p={4}
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(15, 23, 42, 0.05)"
                  bg="gray.50/80"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(32, 108, 225, 0.12)", bg: "blue.50/30" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Text fontSize="xs" fontWeight="700" color="gray.900">
                      {rec.title}
                    </Text>
                    <Badge colorPalette={categoryBadgeColor} size="xs" variant="surface" textTransform="capitalize" borderRadius="full">
                      {rec.category}
                    </Badge>
                  </Flex>
                  <Text fontSize="xs" color="gray.600" lineHeight="tall">
                    {rec.action}
                  </Text>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};
