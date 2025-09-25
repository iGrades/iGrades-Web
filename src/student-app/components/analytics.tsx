import { Box, Heading, Text } from "@chakra-ui/react";
import ProgressBar from "./progress";

const Analytics = () => {
  const courses = [
    {
      title: "Maths",
      progress: 80,
    },
    {
      title: "Chem",
      progress: 67,
    },
    {
      title: "Fren",
      progress: 56,
    },
    {
      title: "Acc",
      progress: 45,
    },
  ];
  return (
    <Box
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      w="full"
      ml={{ md: 5 }}
      my={{ md: 5 }}
      p={4}
    >
      <Heading as="h2" mb={4} fontSize="xl">
        Learning Analytics
      </Heading>
      {courses.map((course, idx) => (
        <>
          <Text>{course.title}</Text>
          <ProgressBar
            key={idx}
            value={course.progress}
            size="sm"
            hasStripe
            isAnimated
            mb={4}
            text={""}
          />
        </>
      ))}
    </Box>
  );
};

export default Analytics;
