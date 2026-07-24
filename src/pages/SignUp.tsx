import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Text,
  Flex,
  Link,
  Heading,
  Image,
  HStack,
  SimpleGrid,
  Alert,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

import logo from "../assets/landing-page/logo.png";
import sideImage from "../assets/sign_up illustration.png";
import ParentSignUp from "@/parent-app/auth/SignUp";
import StudentSignUp from "@/student-app/auth/SignUp";
import { supabase } from "@/lib/supabaseClient";

const SignUp = () => {
  const navigate = useNavigate();
  const [registerState, setRegisterState] = useState("parent");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Student", state: "children" },
  ];

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    localStorage.setItem("oauth_role", registerState);
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Flex minH="100vh" bg="#F8FAFC" align="center" justify="center" p={{ base: 0, md: 6 }}>
        {/* Main Card Container */}
        <Flex
          w="full"
          maxW="1200px"
          minH={{ base: "100vh", md: "820px" }}
          bg="white"
          borderRadius={{ base: "none", md: "3xl" }}
          boxShadow={{ base: "none", md: "2xl" }}
          overflow="hidden"
          position="relative"
          flexDirection={{ base: "column", lg: "row" }}
        >
          {/* ── LEFT PANEL (Desktop with elegant wave background) ── */}
          <Box
            display={{ base: "none", lg: "flex" }}
            w="48%"
            position="relative"
            bg="white"
            overflow="hidden"
            flexDirection="column"
          >
            {/* Organic Bezier Curved Wave SVG Separator */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            >
              <path
                d="M0,0 L100,0 C92,18 96,38 78,54 C60,68 44,82 44,100 L0,100 Z"
                fill="#EBF3FF"
              />
            </svg>

            {/* Back to Home Logo */}
            <RouterLink to="/" style={{ textDecoration: 'none', display: 'inline-block', zIndex: 10 }}>
              <Box px={10} pt={10} cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                <Image src={logo} alt="iGrades logo" h="45px" objectFit="contain" />
              </Box>
            </RouterLink>

            {/* Welcome Quote */}
            <Box px={10} mt={6} zIndex={10}>
              <Text fontSize="xs" fontWeight="800" letterSpacing="0.15em" textTransform="uppercase" color="primaryColor" mb={2}>
                iGrade Learning
              </Text>
              <Heading as="h2" fontSize="2xl" fontWeight="800" color="#1E293B" lineHeight="1.3" maxW="280px">
                Empowering every student's learning journey.
              </Heading>
            </Box>

            {/* Illustration */}
            <Flex flex={1} align="flex-end" justify="center" pb={10} px={6} zIndex={10}>
              <Image
                src={sideImage}
                alt="Sign up illustration"
                w="90%"
                maxH="420px"
                objectFit="contain"
              />
            </Flex>
          </Box>

          {/* ── RIGHT PANEL ── */}
          <Flex
            flex={1}
            bg="white"
            align="center"
            justify="center"
            py={{ base: 10, md: 12 }}
            px={{ base: 6, md: 12, lg: 16 }}
            flexDirection="column"
            position="relative"
            overflow="hidden"
          >
            {/* Mobile/Tablet Watermark Background Illustration */}
            <Image
              src={sideImage}
              alt=""
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              maxW={{ base: "320px", md: "450px" }}
              opacity={0.05}
              pointerEvents="none"
              zIndex={0}
              display={{ base: "block", lg: "none" }}
            />

            {/* Form Wrap */}
            <Box w="full" maxW="580px" m="auto">
              
              {/* Header Info */}
              <Box textAlign="center" mb={6}>
                <Heading as="h1" fontSize="2xl" fontWeight="800" color="#1E293B" mb={1}>
                  Create an Account
                </Heading>
                <Text fontSize="sm" fontWeight="500" color="#64748B">
                  Sign up below to access your iGrade dashboard
                </Text>
              </Box>

              {/* Segmented Tab Switcher (Parent vs Student) */}
              <Flex
                bg="#F1F5F9"
                p="1"
                borderRadius="full"
                mb={6}
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
                      py={2}
                      fontSize="xs"
                      fontWeight="700"
                      color={active ? "#1E293B" : "#64748B"}
                      bg={active ? "white" : "transparent"}
                      boxShadow={active ? "0px 2px 4px rgba(0, 0, 0, 0.05)" : "none"}
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
              <Box mb={6}>
                {registerState === "parent" ? (
                  <ParentSignUp />
                ) : (
                  <StudentSignUp />
                )}
              </Box>

              {/* Divider */}
              <HStack my={6} gap={4} width="full" align="center">
                <Box flex={1} h="1px" bg="gray.100" />
                <Text fontSize="xs" fontWeight="600" color="gray.400" whiteSpace="nowrap">
                  or sign up with
                </Text>
                <Box flex={1} h="1px" bg="gray.100" />
              </HStack>

              {/* Social Signups */}
              <SimpleGrid columns={2} gap={4} mb={6} width="full">
                <Button
                  onClick={handleGoogleSignUp}
                  loading={isGoogleLoading}
                  loadingText="Connecting..."
                  variant="outline"
                  borderRadius="xl"
                  borderColor="gray.200"
                  bg="white"
                  color="#1E293B"
                  h="12"
                  fontSize="sm"
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
                  variant="outline"
                  borderRadius="xl"
                  borderColor="gray.200"
                  bg="white"
                  color="#1E293B"
                  h="12"
                  fontSize="sm"
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

              {/* Toggle to Login */}
              <Text fontSize="xs" fontWeight="500" color="#64748B" textAlign="center" mt={4}>
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

            </Box>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default SignUp;
