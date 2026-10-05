import React from "react";
import { Box, Heading, Text, Button, Icon, HStack } from "@chakra-ui/react";
import { LuLock } from "react-icons/lu";
import { PiShootingStarDuotone } from "react-icons/pi";
import type { PlanTier } from "@/services/subscriptionEntitlements";
import { PLAN_CONFIGS } from "@/services/subscriptionEntitlements";

interface ParentPaywallCardProps {
  title: string;
  description: string;
  requiredPlan?: PlanTier;
  onUpgradeClick: () => void;
  minH?: string;
  childName?: string;
}

export const ParentPaywallCard: React.FC<ParentPaywallCardProps> = ({
  title,
  description,
  requiredPlan = "premium",
  onUpgradeClick,
  minH = "220px",
  childName,
}) => {
  const planDetails = PLAN_CONFIGS[requiredPlan] || PLAN_CONFIGS.premium;

  return (
    <Box
      bg="white"
      p={{ base: 5, md: 8 }}
      borderRadius="2xl"
      border="1.5px dashed"
      borderColor="#93C5FD"
      boxShadow="0 4px 18px -2px rgba(15, 23, 42, 0.05)"
      mb={6}
      minH={minH}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative top accent line with grades blue */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bgGradient="linear(to-r, #1E56B3, #206CE1, #60A5FA)"
      />

      <Box
        w="52px"
        h="52px"
        borderRadius="2xl"
        bg="blue.50"
        color="#206CE1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={3.5}
        boxShadow="0 2px 8px rgba(0,0,0,0.06)"
      >
        <Icon as={LuLock} boxSize={6} />
      </Box>

      <HStack gap={2} mb={1}>
        <Heading size="md" color="gray.900" fontWeight="800">
          {title}
        </Heading>
      </HStack>

      <Text fontSize="xs" color="gray.600" maxW="lg" mb={5} lineHeight="tall">
        {description}
      </Text>

      <Button
        size="sm"
        borderRadius="xl"
        px={5}
        py={2}
        fontWeight="bold"
        fontSize="xs"
        bg="#206CE1"
        color="white"
        _hover={{
          bg: "#1852B2",
          transform: "translateY(-1px)",
        }}
        transition="all 0.2s"
        onClick={onUpgradeClick}
      >
        <Icon as={PiShootingStarDuotone} mr={1.5} fontSize="1.1rem" />
        {childName
          ? `Upgrade ${childName} to ${planDetails.name} (${planDetails.priceFormatted})`
          : `Upgrade Child to ${planDetails.name} (${planDetails.priceFormatted})`}
      </Button>
    </Box>
  );
};
