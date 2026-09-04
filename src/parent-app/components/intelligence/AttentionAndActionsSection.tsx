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
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack gap={2.5}>
              <Box bg="amber.50" p={2} borderRadius="xl" border="1px solid" borderColor="amber.200">
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
            <Badge colorPalette="amber" variant="subtle" size="sm" borderRadius="md" px={2}>
              {needsAttentionAlerts.length} Points
            </Badge>
          </Flex>

          <VStack align="stretch" gap={3} flex="1">
            {needsAttentionAlerts.map((alert) => {
              const isWarning = alert.severity === "warning";
              const isPositive = alert.severity === "positive";

              const borderCol = isWarning ? "amber.200" : isPositive ? "green.200" : "blue.200";
              const bgCol = isWarning ? "amber.50/50" : isPositive ? "green.50/50" : "blue.50/50";
              const iconCol = isWarning ? "amber.600" : isPositive ? "green.600" : "#206CE1";
              const iconComponent = isWarning ? FiAlertCircle : isPositive ? FiCheck : FiInfo;

              return (
                <Box
                  key={alert.id}
                  p={3.5}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderCol}
                  bg={bgCol}
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
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack gap={2.5}>
              <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200">
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
            <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="md" px={2}>
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
                  p={3.5}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="gray.50/70"
                  _hover={{ borderColor: "blue.200", bg: "blue.50/20" }}
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
