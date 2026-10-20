import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Button,
  Box,
  Text,
  Flex,
  Link,
  Heading,
  HStack,
  SimpleGrid,
  Alert,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

import ParentSignUp from "@/parent-app/auth/SignUp";
import StudentSignUp from "@/student-app/auth/SignUp";
import { supabase } from "@/lib/supabaseClient";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRole = (
    searchParams.get("type") ||
    searchParams.get("role") ||
    searchParams.get("tab") ||
    ""
  ).toLowerCase();

  const isStudentDefault = queryRole === "student" || queryRole === "children";
  const [registerState, setRegisterState] = useState(isStudentDefault ? "children" : "parent");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (queryRole === "student" || queryRole === "children") {
      setRegisterState("children");
    } else if (queryRole === "parent") {
      setRegisterState("parent");
    }
  }, [queryRole]);

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Student", state: "children" },
  ];

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    localStorage.setItem("oauth_role", registerState);
    localStorage.setItem("oauth_intent", "signup");
    const redirectTo = `${window.location.origin}/auth/callback?role=${encodeURIComponent(registerState)}&intent=signup`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
        data: {
          role: registerState,
        },
      },
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setIsAppleLoading(true);
    localStorage.setItem("oauth_role", registerState);
    localStorage.setItem("oauth_intent", "signup");
    const redirectTo = `${window.location.origin}/auth/callback?role=${encodeURIComponent(registerState)}&intent=signup`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
        data: {
          role: registerState,
        },
      },
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      setIsAppleLoading(false);
    }
  };

  return (
    <>
      <Flex minH="100vh" bg="#F8FAFC" align="center" justify="center" p={{ base: 0, md: 6 }}>
        {/* Mobile/Tablet Card Container */}
        <Flex
          w="full"
          maxW={{ base: "100%", sm: "480px", md: "520px" }}
          minH={{ base: "100vh", sm: "auto" }}
          my={{ base: 0, sm: 6 }}
          bg="white"
          borderRadius={{ base: "none", sm: "3xl" }}
          boxShadow={{ base: "none", sm: "0 20px 45px rgba(32, 108, 225, 0.08), 0 4px 14px rgba(15, 23, 42, 0.04)" }}
          border={{ base: "none", sm: "1px solid" }}
          borderColor="slate.100"
          overflow="hidden"
          position="relative"
          flexDirection="column"
          px={{ base: 5, sm: 8 }}
          pt={{ base: 8, sm: 10 }}
          pb={{ base: 8, sm: 10 }}
        >
          {/* Form Wrap */}
          <Box w="full" maxW="460px" mx="auto">
            {/* Header Info */}
            <Box textAlign="center" mb={{ base: 5, sm: 6 }}>
              <Heading as="h1" fontSize={{ base: "22px", sm: "26px" }} fontWeight="800" color="#1E293B" mb={1.5} letterSpacing="-0.02em">
                Create an Account
              </Heading>
              <Text fontSize={{ base: "xs", sm: "sm" }} fontWeight="500" color="#64748B">
                Sign up below to access your iGrade dashboard
              </Text>
            </Box>

            {/* Segmented Tab Switcher (Parent vs Student) */}
            <Flex
              bg="#F1F5F9"
              p="1"
              borderRadius="full"
              mb={5}
              gap={1}
              border="1px solid"
              borderColor="gray.200"
            >
                {userType.map((user) => {
                  const active = registerState === user.state;
                  return (
                    <Button
                      key={user.type}
                      onClick={() => setRegisterState(user.state)}
                      flex={1}
                      variant="ghost"
                      borderRadius="full"
                      h="38px"
                      fontSize={{ base: "xs", sm: "sm" }}
                      fontWeight="700"
                      color={active ? "#1E293B" : "#64748B"}
                      bg={active ? "white" : "transparent"}
                      boxShadow={active ? "0px 2px 4px rgba(0, 0, 0, 0.06)" : "none"}
                      _hover={{ bg: active ? "white" : "rgba(0,0,0,0.03)" }}
                      transition="all 0.2s"
                    >
                      {user.type}
                    </Button>
                  );
                })}
              </Flex>

              {/* Alert */}
              {alert && (
                <Box mb={4}>
                  <Alert.Root status={alert.type} variant="subtle" borderRadius="xl">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title fontSize="sm" fontWeight="700">
                        {alert.type === "error" ? "Error!" : "Success!"}
                      </Alert.Title>
                      <Alert.Description fontSize="xs">{alert.message}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                </Box>
              )}

              {/* Active Form */}
              <Box mb={5}>
                {registerState === "parent" ? (
                  <ParentSignUp />
                ) : (
                  <StudentSignUp />
                )}
              </Box>

              {/* Divider & Social Signups (only for parent signup) */}
              {registerState === "parent" && (
                <>
                  <HStack my={5} gap={3} width="full" align="center">
                    <Box flex={1} h="1px" bg="gray.100" />
                    <Text fontSize="2xs" textTransform="uppercase" letterSpacing="0.05em" fontWeight="600" color="gray.400" whiteSpace="nowrap">
                      or sign up with
                    </Text>
                    <Box flex={1} h="1px" bg="gray.100" />
                  </HStack>

                  <SimpleGrid columns={2} gap={3} mb={5} width="full">
                    <Button
                      onClick={handleGoogleSignUp}
                      loading={isGoogleLoading}
                      loadingText="Connecting..."
                      variant="outline"
                      borderRadius="xl"
                      borderColor="gray.200"
                      bg="white"
                      color="#1E293B"
                      h="11"
                      fontSize="xs"
                      fontWeight="600"
                      _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                    >
                      <FcGoogle size={18} />
                      Google
                    </Button>
                    <Button
                      onClick={handleAppleSignUp}
                      loading={isAppleLoading}
                      loadingText="Connecting..."
                      variant="outline"
                      borderRadius="xl"
                      borderColor="gray.200"
                      bg="white"
                      color="#1E293B"
                      h="11"
                      fontSize="xs"
                      fontWeight="600"
                      _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                    >
                      <FaApple size={18} />
                      Apple
                    </Button>
                  </SimpleGrid>
                </>
              )}

              {/* Toggle to Login */}
              <Text fontSize="xs" fontWeight="500" color="#64748B" textAlign="center" mt={3}>
                Already have an account?{" "}
                <Link
                  onClick={() => navigate("/login")}
                  color="primaryColor"
                  fontWeight="700"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  Login
                </Link>
              </Text>

              {/* Public Legal Links */}
              <HStack justify="center" gap={3} mt={4} fontSize="xs" color="#94A3B8">
                <Link
                  asChild
                  color="#64748B"
                  _hover={{ color: "primaryColor", textDecoration: "underline" }}
                >
                  <RouterLink to="/terms-of-service">Terms of Service</RouterLink>
                </Link>
                <Text>•</Text>
                <Link
                  asChild
                  color="#64748B"
                  _hover={{ color: "primaryColor", textDecoration: "underline" }}
                >
                  <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
                </Link>
              </HStack>

            </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default SignUp;
