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

const JuniorCourses = ({
  onSelectionChange,
}: JuniorCoursesProps) => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const maxSelection = 8; // Maximum courses for junior students

  // Junior courses - same for all JSS students
  const juniorCourses = [
    { id: "math_jss", name: "Mathematics", category: "Core" },
    { id: "english_jss", name: "English", category: "Core" },
    { id: "basic_sci_jss", name: "Basic Science", category: "Core" },
    { id: "basic_tech_jss", name: "Basic Technology", category: "Core" },
    { id: "social_studies_jss", name: "Social Studies", category: "Core" },
    { id: "civic_edu_jss", name: "Civic Education", category: "Core" },
    { id: "business_studies_jss", name: "Business Studies", category: "Core" },
    { id: "home_economics_jss", name: "Home Economics", category: "Core" },
    { id: "agric_sci_jss", name: "Agricultural Science", category: "Core" },
    { id: "physical_edu_jss", name: "Physical Education", category: "Core" },
    {
      id: "computer_studies_jss",
      name: "Computer Studies",
      category: "Elective",
    },
    { id: "creative_arts_jss", name: "Creative Arts", category: "Elective" },
    { id: "french_jss", name: "French", category: "Elective" },
    { id: "music_jss", name: "Music", category: "Elective" },
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
        w={{base: 'full', md: '1/2'}}
      >
        <Alert.Description fontSize="xs">
          You are only allowed to select a maximum of {maxSelection} courses.
        </Alert.Description>
      </Alert.Root>

      <Text fontSize="sm" color="gray.600" mb={5}>
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
          gap="6"
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
              fontSize="xs"
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
              <Checkbox.Label as="span" fontSize="xs" color="gray.500" ml={2}>
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
