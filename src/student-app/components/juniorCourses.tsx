import { useState } from "react";
import {
  Box,
  Text,
  Checkbox,
  CheckboxGroup,
  Grid,
  Wrap,
  WrapItem,
  Badge,
  Alert,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { PiShootingStarDuotone } from "react-icons/pi";

interface JuniorCoursesProps {
  onSelectionChange: (selectedCourses: string[]) => void;
}

const JuniorCourses = ({ onSelectionChange }: JuniorCoursesProps) => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const {
    effectivePlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  // Basic allows 4 starter subjects, Standard allows 8, Premium allows 16
  const maxSelection = effectivePlan === "basic" ? 4 : 8;

  // IDs to match generic database naming
  const juniorCourses = [
    { id: "mathematics", name: "Mathematics", category: "Core" },
    { id: "english", name: "English", category: "Core" },
    { id: "basic science", name: "Basic Science", category: "Core" },
    { id: "basic technology", name: "Basic Technology", category: "Core" },
    { id: "social studies", name: "Social Studies", category: "Core" },
    { id: "civic education", name: "Civic Education", category: "Core" },
    { id: "business studies", name: "Business Studies", category: "Core" },
    { id: "home economics", name: "Home Economics", category: "Core" },
    { id: "agricultural science", name: "Agricultural Science", category: "Core" },
    { id: "physical education", name: "Physical Education", category: "Core" },
    { id: "computer studies", name: "Computer Studies", category: "Elective" },
    { id: "creative arts", name: "Creative Arts", category: "Elective" },
    { id: "music", name: "Music", category: "Elective" },
  ];

  const handleCourseChange = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      const updated = selectedCourses.filter((id) => id !== courseId);
      setSelectedCourses(updated);
      onSelectionChange(updated);
    } else {
      if (selectedCourses.length >= maxSelection) {
        if (effectivePlan === "basic") {
          promptUpgrade(
            "Expanded Junior Subject Selection",
            "standard",
            "You have selected the 4 starter subjects allowed on the Basic plan. Upgrade to Standard (₦15,000) to select up to 8 junior secondary subjects!"
          );
        }
        return;
      }
      const updated = [...selectedCourses, courseId];
      setSelectedCourses(updated);
      onSelectionChange(updated);
    }
  };

  return (
    <Box>
      <Alert.Root
        status={effectivePlan === "basic" ? "info" : "warning"}
        mt={5}
        mb={6}
        mx="auto"
        borderRadius="md"
        w={{ base: "full", md: "85%" }}
      >
        <Alert.Description fontSize="xs">
          {effectivePlan === "basic" ? (
            <HStack justify="space-between" w="full" wrap="wrap" gap={2}>
              <Text>
                <strong>Basic Plan:</strong> You can select up to <strong>4 starter subjects</strong>. Upgrade to Standard for 8 subjects.
              </Text>
              <Button
                size="xs"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                variant="solid"
                onClick={() =>
                  promptUpgrade(
                    "8 Junior Subjects",
                    "standard",
                    "Unlock all 8 Junior Secondary subjects on the Standard plan."
                  )
                }
              >
                <PiShootingStarDuotone style={{ marginRight: "4px" }} /> Unlock Standard Plan
              </Button>
            </HStack>
          ) : (
            `You can select a maximum of ${maxSelection} courses on your ${effectivePlan.toUpperCase()} plan.`
          )}
        </Alert.Description>
      </Alert.Root>

      <Text fontSize="xs" color="gray.600" mb={5}>
        Selected: {selectedCourses.length}/{maxSelection}
      </Text>

      <Wrap gap={2} mb={4}>
        {selectedCourses.map((courseId) => {
          const course = juniorCourses.find((c) => c.id === courseId);
          return (
            <WrapItem key={courseId}>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                colorScheme="blue"
                cursor="pointer"
                onClick={() => handleCourseChange(courseId)}
                fontSize="xs"
              >
                {course?.name} ×
              </Badge>
            </WrapItem>
          );
        })}
      </Wrap>

      <CheckboxGroup colorScheme="blue" value={selectedCourses}>
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap="5"
          my={6}
        >
          {juniorCourses.map((course) => {
            const isChecked = selectedCourses.includes(course.id);
            const isMaxReached = !isChecked && selectedCourses.length >= maxSelection;

            return (
              <Checkbox.Root
                key={course.id}
                value={course.id}
                checked={isChecked}
                onCheckedChange={() => handleCourseChange(course.id)}
                fontSize="0.75em"
                size={"sm"}
                variant={isChecked ? "subtle" : "outline"}
                colorPalette={isChecked ? "blue" : "textFieldColor"}
                opacity={isMaxReached ? 0.6 : 1}
                cursor={isMaxReached ? "pointer" : "default"}
                onClick={() => {
                  if (isMaxReached && effectivePlan === "basic") {
                    promptUpgrade(
                      "Expanded Junior Subject Selection",
                      "standard",
                      "You have selected the 4 starter subjects allowed on the Basic plan. Upgrade to Standard to select up to 8 subjects!"
                    );
                  }
                }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control cursor="pointer" />
                {course.name}
                <Checkbox.Label as="span" fontSize="0.75em" color="gray.500" ml={2}>
                  ({course.category})
                </Checkbox.Label>
              </Checkbox.Root>
            );
          })}
        </Grid>
      </CheckboxGroup>

      {selectedCourses.length >= maxSelection && (
        <Alert.Root status="info" mt={5} mb={10} borderRadius="md">
          <Alert.Indicator fontSize="lg" />
          <Alert.Description fontSize="xs">
            Maximum {maxSelection} courses selected on {effectivePlan.toUpperCase()} plan.
          </Alert.Description>
        </Alert.Root>
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

export default JuniorCourses;