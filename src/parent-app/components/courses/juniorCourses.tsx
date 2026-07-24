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
} from "@chakra-ui/react";

interface JuniorCoursesProps {
  onSelectionChange: (selectedCourses: string[]) => void;
}

const JuniorCourses = ({ onSelectionChange }: JuniorCoursesProps) => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const maxSelection = 8;

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
        status="warning"
        mt={5}
        mb={10}
        mx="auto"
        borderRadius="md"
        w={{ base: "full", md: "70%" }}
      >
        <Alert.Description fontSize="xs">
          You are only allowed to select a maximum of {maxSelection} courses.
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
          {juniorCourses.map((course) => (
            <Checkbox.Root
              key={course.id}
              value={course.id}
              checked={selectedCourses.includes(course.id)}
              onChange={() => handleCourseChange(course.id)}
              disabled={
                !selectedCourses.includes(course.id) &&
                selectedCourses.length >= maxSelection
              }
              fontSize="0.75em"
              size={"sm"}
              variant={
                selectedCourses.includes(course.id) ? "subtle" : "outline"
              }
              colorPalette={
                selectedCourses.includes(course.id) ? "blue" : "textFieldColor"
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control cursor="pointer" />
              {course.name}
              <Checkbox.Label as="span" fontSize="0.75em" color="gray.500" ml={2}>
                ({course.category})
              </Checkbox.Label>
            </Checkbox.Root>
          ))}
        </Grid>
      </CheckboxGroup>

      {selectedCourses.length >= maxSelection && (
        <Alert.Root status="info" mt={5} mb={10} borderRadius="md">
          <Alert.Indicator fontSize="lg" />
          <Alert.Description fontSize="xs">
            Maximum {maxSelection} courses selected
          </Alert.Description>
        </Alert.Root>
      )}
    </Box>
  );
};

export default JuniorCourses;