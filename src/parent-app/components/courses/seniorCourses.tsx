import { useState, useEffect } from "react";
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

interface SeniorCoursesProps {
  onSelectionChange: (selectedCourses: string[]) => void;
}

const SeniorCourses = ({
  onSelectionChange,
}: SeniorCoursesProps) => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const maxSelection = 6;

  // Senior courses - available to all senior students
  const seniorCourses = [
    { id: "math_sss", name: "Mathematics", category: "Core" },
    { id: "english_sss", name: "English", category: "Core" },
    { id: "physics", name: "Physics", category: "Science" },
    { id: "chemistry", name: "Chemistry", category: "Science" },
    { id: "biology", name: "Biology", category: "Science" },
    { id: "further_math", name: "Further Maths", category: "Science" },
    { id: "economics", name: "Economics", category: "Social Science" },
    { id: "accounting", name: "Accounting", category: "Social Science" },
    { id: "commerce", name: "Commerce", category: "Social Science" },
    { id: "government", name: "Government", category: "Social Science" },
    { id: "literature", name: "Literature", category: "Arts" },
    { id: "history", name: "History", category: "Arts" },
    { id: "geography", name: "Geography", category: "Arts" },
    { id: "fine_arts", name: "Fine Arts", category: "Arts" },
    { id: "computer_sci", name: "Computer Science", category: "Elective" },
    { id: "french", name: "French", category: "Elective" },
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
        w={{ base: "full", md: "1/2" }}
      >
        <Alert.Description fontSize="xs">
          You are only allowed to select a maximum of {maxSelection} courses.
        </Alert.Description>
      </Alert.Root>

      <Text fontSize="xs" color="gray.600" mb={2}>
        Selected: {selectedCourses.length}/{maxSelection}
      </Text>

      <Wrap gap={2} mb={4}>
        {selectedCourses.map((courseId) => {
          const course = seniorCourses.find((c) => c.id === courseId);
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
          {seniorCourses.map((course) => (
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

export default SeniorCourses;
