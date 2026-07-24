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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import logo from "../assets/landing-page/logo.png";
import sideImage from "../assets/sign_up illustration.png";
import ParentSignUp from "@/parent-app/auth/SignUp";
import StudentSignUp from "@/student-app/auth/SignUp";

const SignUp = () => {
  const navigate = useNavigate();
  const [registerState, setRegisterState] = useState("parent");

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Student", state: "children" },
  ];

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

              {/* Active Form */}
              <Box mb={6}>
                {registerState === "parent" ? (
                  <ParentSignUp />
                ) : (
                  <StudentSignUp />
                )}
              </Box>

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
