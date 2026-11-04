import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Button,
  Alert,
  Box,
  Text,
  Flex,
  Link,
  Heading,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

import ParentLogin from "@/parent-app/auth/Login";
import StudentLogin from "@/student-app/auth/Login";
import { supabase } from "@/lib/supabaseClient";
import { initiateGoogleOAuth, initiateAppleOAuth } from "@/lib/oauthManager";
import {
  isSessionExpired,
  clearAllLocalSessionData,
  consumeSessionExpiredNotice,
  recordActivity,
  SESSION_EXPIRED_MESSAGE,
} from "@/lib/authSessionManager";

interface LoginProps {
  initialType?: "parent" | "children" | "student";
}

export default function Login({ initialType }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const queryType = (
    searchParams.get("type") ||
    searchParams.get("role") ||
    searchParams.get("tab") ||
    ""
  ).toLowerCase();

  const isStudentDefault =
    initialType === "student" ||
    initialType === "children" ||
    queryType === "student" ||
    queryType === "children" ||
    location.pathname.includes("student");

  const [loginState, setLoginState] = useState(isStudentDefault ? "children" : "parent");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  useEffect(() => {
    if (
      initialType === "student" ||
      initialType === "children" ||
      queryType === "student" ||
      queryType === "children" ||
      location.pathname.includes("student")
    ) {
      setLoginState("children");
    } else if (initialType === "parent" || queryType === "parent") {
      setLoginState("parent");
    }
  }, [initialType, queryType, location.pathname]);

  useEffect(() => {
    // 0. Check if user arrived after session expiration
    const notice = consumeSessionExpiredNotice();
    const hasExpiredParam = searchParams.get("session_expired") === "1" || searchParams.get("expired") === "true";
    if (notice || hasExpiredParam) {
      clearAllLocalSessionData();
      setAlert({
        type: "error",
        message: notice || SESSION_EXPIRED_MESSAGE,
      });
      return;
    }

    // Check if the currently stored session is expired due to 14 days of inactivity
    if (isSessionExpired()) {
      clearAllLocalSessionData();
      setAlert({
        type: "error",
        message: SESSION_EXPIRED_MESSAGE,
      });
      return;
    }

    // 1. Check student session
    try {
      const storedStudent = localStorage.getItem("authdStudent");
      if (storedStudent) {
        const student = JSON.parse(storedStudent);
        if (student?.id || student?.firstname) {
          recordActivity();
          const name = student.firstname
            ? `${student.firstname} ${student.lastname || ""}`.trim().toLowerCase().replace(/\s+/g, "-")
            : "";
          navigate(name ? `/student-dashboard/${name}` : "/student-dashboard", { replace: true });
          return;
        }
      }
    } catch {
      // ignore
    }

    // 2. Check parent session
    try {
      const storedParent = localStorage.getItem("authdParent");
      if (storedParent) {
        const parentData = JSON.parse(storedParent);
        const p = Array.isArray(parentData) ? parentData[0] : parentData;
        if (p?.id || p?.firstname || p?.email) {
          recordActivity();
          const name = p.firstname
            ? `${p.firstname} ${p.lastname || ""}`.trim().toLowerCase().replace(/\s+/g, "-")
            : "";
          navigate(name ? `/parent-dashboard/${name}` : "/parent-dashboard", { replace: true });
          return;
        }
      }
    } catch {
      // ignore
    }
  }, [navigate, searchParams]);

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Student", state: "children" },
  ];

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await initiateGoogleOAuth(loginState, "login");
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Failed to start Google login." });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoading(true);
    try {
      await initiateAppleOAuth(loginState, "login");
    } catch (error: any) {
      setAlert({ type: "error", message: error.message || "Failed to start Apple login." });
      setIsAppleLoading(false);
    }
  };

  return (
    <>
      <Flex minH="100vh" bg={{ base: "#F8FAFC", _dark: "#000000" }} align="center" justify="center" p={{ base: 0, md: 6 }}>
        {/* Alert */}
        {alert && (
          <Box
            position="absolute"
            top={{ base: "10px", md: "20px" }}
            right={{ base: "10px", md: "20px" }}
            width={{ base: "90%", sm: "80%", md: "400px" }}
            zIndex={100}
          >
            <Alert.Root status={alert.type} variant="subtle" borderRadius="xl" boxShadow="lg">
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

        {/* Mobile/Tablet Card Container */}
        <Flex
          w="full"
          maxW={{ base: "100%", sm: "440px", md: "480px" }}
          minH={{ base: "100dvh", sm: "auto" }}
          my={{ base: 0, sm: 6 }}
          bg={{ base: "white", _dark: "#121212" }}
          borderRadius={{ base: "none", sm: "3xl" }}
          boxShadow={{ base: "none", sm: "0 20px 45px rgba(0, 0, 0, 0.25), 0 4px 14px rgba(0, 0, 0, 0.15)" }}
          border={{ base: "none", sm: "1px solid" }}
          borderColor={{ base: "slate.100", _dark: "#262626" }}
          overflow="hidden"
          position="relative"
          flexDirection="column"
          justifyContent="center"
          px={{ base: 5, sm: 8 }}
          pt={{ base: "max(calc(env(safe-area-inset-top, 16px) + 12px), 20px)", sm: 10 }}
          pb={{ base: "max(calc(env(safe-area-inset-bottom, 16px) + 12px), 24px)", sm: 10 }}
        >
          {/* Form Wrap */}
          <Box w="full" maxW="420px" mx="auto" my={{ base: "auto", sm: 0 }}>
            {/* Header Info */}
            <Box textAlign="center" mb={{ base: 5, sm: 6 }}>
              <Heading as="h1" fontSize={{ base: "22px", sm: "26px" }} fontWeight="800" color={{ base: "#1E293B", _dark: "#F5F5F5" }} mb={1.5} letterSpacing="-0.02em">
                Welcome Back
              </Heading>
              <Text fontSize={{ base: "xs", sm: "sm" }} fontWeight="500" color={{ base: "#64748B", _dark: "#A1A1AA" }}>
                Sign in to continue to your account
              </Text>
            </Box>

              {/* Segmented Tab Switcher (Parent vs Student) */}
              <Flex
                bg={{ base: "#F1F5F9", _dark: "#1A1A1A" }}
                p="1"
                borderRadius="full"
                mb={5}
                gap={1}
                border="1px solid"
                borderColor={{ base: "gray.200", _dark: "#262626" }}
              >
                {userType.map((user) => {
                  const active = loginState === user.state;
                  return (
                    <Button
                      key={user.type}
                      onClick={() => setLoginState(user.state)}
                      flex={1}
                      variant="ghost"
                      borderRadius="full"
                      h="38px"
                      fontSize={{ base: "xs", sm: "sm" }}
                      fontWeight="700"
                      color={active ? { base: "#1E293B", _dark: "#F5F5F5" } : { base: "#64748B", _dark: "#A1A1AA" }}
                      bg={active ? { base: "white", _dark: "#262626" } : "transparent"}
                      boxShadow={active ? "0px 2px 4px rgba(0, 0, 0, 0.2)" : "none"}
                      _hover={{ bg: active ? { base: "white", _dark: "#262626" } : "rgba(255,255,255,0.05)" }}
                      transition="all 0.2s"
                    >
                      {user.type}
                    </Button>
                  );
                })}
              </Flex>

              {/* Active Form */}
              <Box mb={5}>
                {loginState === "parent" ? (
                  <ParentLogin setAlert={setAlert} />
                ) : (
                  <StudentLogin setAlert={setAlert} />
                )}
              </Box>

              {/* Forgot Password Helper */}
              {loginState === "parent" && (
                <Flex justify="flex-end" mt={-2} mb={5}>
                  <Link
                    asChild
                    fontSize="xs"
                    fontWeight="600"
                    color="primaryColor"
                    _hover={{ textDecoration: "underline" }}
                  >
                    <RouterLink to="/forgot-password">
                      Forgot password?
                    </RouterLink>
                  </Link>
                </Flex>
              )}

              {/* Divider */}
              <HStack my={5} gap={3} width="full" align="center">
                <Box flex={1} h="1px" bg={{ base: "gray.100", _dark: "#262626" }} />
                <Text fontSize="2xs" textTransform="uppercase" letterSpacing="0.05em" fontWeight="600" color={{ base: "gray.400", _dark: "#71717A" }} whiteSpace="nowrap">
                  or continue with
                </Text>
                <Box flex={1} h="1px" bg={{ base: "gray.100", _dark: "#262626" }} />
              </HStack>

              {/* Social Logins */}
              <SimpleGrid columns={2} gap={3} mb={5} width="full">
                <Button
                  onClick={handleGoogleLogin}
                  loading={isGoogleLoading}
                  loadingText="Connecting..."
                  variant="outline"
                  borderRadius="xl"
                  borderColor={{ base: "gray.200", _dark: "#262626" }}
                  bg={{ base: "white", _dark: "#1A1A1A" }}
                  color={{ base: "#1E293B", _dark: "#F5F5F5" }}
                  h="11"
                  fontSize="xs"
                  fontWeight="600"
                  _hover={{ bg: { base: "gray.50", _dark: "#222222" }, borderColor: { base: "gray.300", _dark: "#333333" } }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  <FcGoogle size={18} />
                  Google
                </Button>
                <Button
                  onClick={handleAppleLogin}
                  loading={isAppleLoading}
                  loadingText="Connecting..."
                  variant="outline"
                  borderRadius="xl"
                  borderColor={{ base: "gray.200", _dark: "#262626" }}
                  bg={{ base: "white", _dark: "#1A1A1A" }}
                  color={{ base: "#1E293B", _dark: "#F5F5F5" }}
                  h="11"
                  fontSize="xs"
                  fontWeight="600"
                  _hover={{ bg: { base: "gray.50", _dark: "#222222" }, borderColor: { base: "gray.300", _dark: "#333333" } }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  <FaApple size={18} />
                  Apple
                </Button>
              </SimpleGrid>

              {/* Toggle to Signup */}
              <Text fontSize="xs" fontWeight="500" color={{ base: "#64748B", _dark: "#A1A1AA" }} textAlign="center" mt={3}>
                Don't have an account?{" "}
                <Link
                  onClick={() => navigate("/signup")}
                  color="primaryColor"
                  fontWeight="700"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign up
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
}