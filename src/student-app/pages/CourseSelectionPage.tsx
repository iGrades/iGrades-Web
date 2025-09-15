import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "../context/studentDataContext";
import {
  Text,
  Flex,
  Image,
  Button,
  VStack,
  Alert,
  Container,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import SeniorCourses from "../components/seniorCourses";
import JuniorCourses from "../components/juniorCourses";
import sideImage from '../../assets/select_ico-removebg-preview.png'

const CourseSelectionPage = () => {
  const { authdStudent, setAuthdStudent } = useAuthdStudentData();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  // Check if student is senior (SSS) or junior (JSS)
  const isSeniorStudent = authdStudent?.class?.startsWith("SSS");
  const isJuniorStudent = authdStudent?.class?.startsWith("JSS");

  useEffect(() => {
    if (!authdStudent) {
      navigate("/student-signup");
    }
  }, [authdStudent, navigate]);

  const handleCourseSelection = (courses: string[]) => {
    setSelectedCourses(courses);
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setAlert({
        status: "error",
        message: "Please select at least one course",
      });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // Update the student's record with the selected courses
      const { error } = await supabase
        .from("students")
        .update({
          registered_courses: selectedCourses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authdStudent?.id);

      if (error) {
        throw error;
      }

      // Update the local auth state with the new courses
      setAuthdStudent({
        ...authdStudent!,
        registered_courses: selectedCourses,
      });

      setAlert({
        status: "success",
        message: "Courses selected successfully!",
      });

      // Redirect to dashboard after successful submission
      setTimeout(() => navigate("/student-dashboard"), 2000);
    } catch (error: any) {
      setAlert({
        status: "error",
        message: error.message || "Failed to save course selection",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authdStudent) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading student information...</Text>
      </Container>
    );
  }

  return (
    <>
      <Flex
        as="section"
        align="center"
        justify={{ base: "center", md: "space-between" }}
        backgroundImage={{
          base: "url('/undraw_sign-in_uva0.png')",
          lg: "none",
        }}
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        bg={{ lg: "textFieldColor" }}
        h="auto"
      >
        <Image
          src={sideImage}
          alt="login_image"
          display={{ base: "none", lg: "block" }}
          w={{ base: "full", lg: "45%" }}
        />
        <Container bg="white" shadow='xl' p={10} h={"full"} w={{ base: "full", lg: "55%" }}>
          <VStack gap={6} align="stretch">
            <Heading textAlign="center" size="lg">
              Welcome, {authdStudent.firstname}!
            </Heading>

            <Text textAlign="center" color="gray.600">
              Please select your courses for {authdStudent.class}
            </Text>

            {alert && (
              <Alert.Root status={alert.status} borderRadius="md">
                <Alert.Indicator />
                {alert.message}
              </Alert.Root>
            )}

            {/* Render appropriate course selection component */}
            {isSeniorStudent && (
              <SeniorCourses
                onSelectionChange={handleCourseSelection}
              />
            )}

            {isJuniorStudent && (
              <JuniorCourses
                onSelectionChange={handleCourseSelection}
              />
            )}

            <Button
              onClick={handleSubmit}
              loading={isLoading}
              loadingText="Saving Courses..."
              bg="primaryColor"
              size="lg"
              rounded="md"
              my={4}
              w={{base: 'full', md: '70%'}}
              mx="auto"
              disabled={selectedCourses.length === 0}
            >
              Continue to Dashboard
            </Button>
          </VStack>
        </Container>
      </Flex>
    </>
  );
};

export default CourseSelectionPage;
