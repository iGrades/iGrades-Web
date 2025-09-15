import {useMemo} from "react";
import { Box, Flex, Text, Image, Heading } from "@chakra-ui/react";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";
import { useAuthdStudentData } from "../context/studentDataContext";
const MyClasses = () => {
const { authdStudent } = useAuthdStudentData();

// convert registered_courses to an array if it's a string
const coursesCount = useMemo(() => {
  const courses = authdStudent?.registered_courses;
  if (!courses) return 0;

  if (Array.isArray(courses)) return courses.length;

  if (typeof courses === "string") {
    try {
      const parsed = JSON.parse(courses);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  return 0;
}, [authdStudent?.registered_courses]);
  return (
    <Flex w="full">
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
          <Heading as="h1" my={2}>
            My Classes
          </Heading>
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            alignItems="center"
          >
            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="textFieldColor"
              borderRadius="lg"
              boxShadow='xs'
              p={{ base: "5", md: "8", lg: "10" }}
              my={2}
            >
              <Image src={childrenBox_ico} boxSize="60px" />
              <Box mx={5}>
                <Text
                  fontSize={{ base: "md", lg: "lg" }}
                  mb={1}
                  color="#333951"
                >
                  Registered Courses
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  color="#333951"
                >
                  {coursesCount || 0}
                </Heading>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="textFieldColor"
              borderRadius="lg"
              shadow='xs'
              p={{ base: "5", md: "8", lg: "10" }}
              my={2}
            >
              <Image src={activeChildrenBox_ico} boxSize="60px" />
              <Box mx={5}>
                <Text
                  fontSize={{ base: "md", lg: "lg" }}
                  mb={1}
                  color="#333951"
                >
                  Active Classes
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  color="#333951"
                >
                  {authdStudent?.active_classes || 0}
                </Heading>
              </Box>
            </Box>
          </Flex>
        </Box>
    </Flex>
  );
};

export default MyClasses;
