import React from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Badge,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { LuLock, LuCheck, LuArrowRight } from "react-icons/lu";
import { PiShootingStarDuotone } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "@/store/usenavigationStore";
import { PLAN_CONFIGS, type PlanTier } from "@/services/subscriptionEntitlements";

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan?: PlanTier;
  reason?: string;
  currentPlan?: PlanTier;
  portalType?: "student" | "parent";
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  featureName,
  requiredPlan = "standard",
  reason,
  currentPlan = "basic",
  portalType = "student",
}) => {
  const navigate = useNavigate();
  const setCurrentStudentPage = useNavigationStore((s) => s.setCurrentStudentPage);
  const setStudentSettingsTab = useNavigationStore((s) => s.setStudentSettingsTab);
  const setCurrentParentPage = useNavigationStore((s) => s.setCurrentParentPage);
  const setParentSettingsTab = useNavigationStore((s) => s.setParentSettingsTab);

  const targetPlanDetails = PLAN_CONFIGS[requiredPlan] || PLAN_CONFIGS.standard;
  const currentPlanDetails = PLAN_CONFIGS[currentPlan] || PLAN_CONFIGS.basic;

  const handleGoToUpgrade = () => {
    onClose();
    if (portalType === "parent") {
      setCurrentParentPage("settings");
      setParentSettingsTab("subscription");
      navigate("/parent-dashboard");
    } else {
      setCurrentStudentPage("settings");
      setStudentSettingsTab("subscription");
      navigate("/student-dashboard");
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
      <DialogContent
        maxW={{ base: "92vw", sm: "480px" }}
        maxH="90vh"
        borderRadius="2xl"
        p={{ base: 4, sm: 5 }}
        bg="white"
        shadow="2xl"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <DialogHeader pb={2} pt={1} px={1}>
          <Flex align="center" gap={3}>
            <Box
              p={2.5}
              borderRadius="xl"
              bg="blue.50"
              color="#206CE1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={LuLock} boxSize={5} />
            </Box>
            <Box minW={0} flex={1}>
              <HStack gap={2} mb={1} flexWrap="wrap">
                <Badge bg="#206CE1" color="white" size="xs" variant="solid" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                  {targetPlanDetails.name} Tier
                </Badge>
                <Badge colorPalette="gray" size="xs" variant="subtle" px={2} py={0.5} borderRadius="md">
                  Current: {currentPlanDetails.name}
                </Badge>
              </HStack>
              <DialogTitle fontSize={{ base: "md", sm: "lg" }} fontWeight="800" color="gray.900" truncate>
                Unlock {featureName}
              </DialogTitle>
            </Box>
          </Flex>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody py={2} px={1} overflowY="auto" maxH="calc(90vh - 140px)">
          <VStack align="stretch" gap={3}>
            {reason && (
              <Box p={3} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200">
                <Text fontSize="xs" color="gray.700" lineHeight="1.5">
                  {reason}
                </Text>
              </Box>
            )}

            <Box
              p={3.5}
              borderRadius="xl"
              border="1.5px solid"
              borderColor="#93C5FD"
              bg="blue.50/40"
            >
              <Flex justify="space-between" align="center" mb={1.5}>
                <HStack gap={1.5}>
                  <Icon as={PiShootingStarDuotone} color="#206CE1" fontSize="1.15rem" />
                  <Heading as="h4" size="xs" color="gray.900" fontWeight="bold">
                    {targetPlanDetails.name} Plan
                  </Heading>
                </HStack>
                <Text fontSize="md" fontWeight="extrabold" color="#206CE1">
                  {targetPlanDetails.priceFormatted}
                </Text>
              </Flex>
              <Text fontSize="11px" color="gray.600" mb={2.5}>
                {targetPlanDetails.description}
              </Text>

              <VStack align="stretch" gap={1.5}>
                {targetPlanDetails.features.slice(0, 4).map((feat, idx) => (
                  <HStack key={idx} align="flex-start" gap={2}>
                    <Icon as={LuCheck} color="#206CE1" boxSize={3.5} mt={0.5} flexShrink={0} />
                    <Text fontSize="xs" color="gray.800" lineHeight="1.4">
                      {feat}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter pt={3} pb={1} px={1} gap={2} flexDirection={{ base: "column-reverse", sm: "row" }} borderTop="1px solid" borderColor="gray.100" mt={1}>
          <Button
            variant="outline"
            w={{ base: "full", sm: "auto" }}
            onClick={onClose}
            borderRadius="xl"
            fontSize="xs"
            size="sm"
            fontWeight="medium"
          >
            Keep {currentPlanDetails.name}
          </Button>
          <Button
            bg="#206CE1"
            color="white"
            _hover={{ bg: "#1852B2" }}
            w={{ base: "full", sm: "auto" }}
            flex={{ sm: 1 }}
            onClick={handleGoToUpgrade}
            borderRadius="xl"
            fontSize="xs"
            fontWeight="bold"
            size="sm"
            px={4}
          >
            <Icon as={PiShootingStarDuotone} mr={1.5} fontSize="1rem" />
            Upgrade to {targetPlanDetails.name} ({targetPlanDetails.priceFormatted})
            <Icon as={LuArrowRight} ml={1} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
