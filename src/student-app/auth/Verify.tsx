import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { recordActivity } from "@/lib/authSessionManager";
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  Alert,
  Heading,
  PinInput,
  HStack,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { HiOutlineMail, HiShieldCheck } from "react-icons/hi";
import { PiCheckCircleFill, PiArrowLeftBold } from "react-icons/pi";
import logo from "@/assets/landing-page/logo.png";
import verifyIllustration from "@/assets/verify-image.png";

export default function StudentVerify() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<
    "idle" | "verifying" | "error" | "success"
  >("idle");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const isVerifyingRef = useRef(false);

  // Handle OTP change
  const handleOtpChange = (details: { value: string[] }) => {
    const value = details.value;
    setOtp(value);

    // Auto-submit when all 6 digits are entered
    if (value.every((v) => v !== "") && value.length === 6 && !isVerifyingRef.current) {
      handleVerify(value.join(""));
    }
  };

  // Verify OTP and insert student record
  const handleVerify = async (manualToken?: string) => {
    if (isVerifyingRef.current) return;

    const rawToken = manualToken || otp.join("");
    const cleanToken = rawToken.trim().replace(/[^0-9a-zA-Z]/g, "");
    const cleanEmail = (email || "").trim().toLowerCase();

    if (cleanToken.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      setStatus("error");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Email address not found. Please try registering again.");
      setStatus("error");
      return;
    }

    isVerifyingRef.current = true;
    setStatus("verifying");
    setErrorMessage(null);
    setAlert(null);

    try {
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      if (error || !data?.user) {
        const emailRetry = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "email",
        });

        if (!emailRetry.error && emailRetry.data?.user) {
          data = emailRetry.data;
          error = null;
        }
      }

      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("User not returned after verification.");

      const meta = user.user_metadata || {};

      // Insert or upsert into students table
      const studentPayload = {
        id: user.id,
        email: user.email || cleanEmail,
        firstname: meta.firstname || "",
        lastname: meta.lastname || "",
        date_of_birth: meta.date_of_birth,
        gender: meta.gender,
        class: meta.class || "SSS 1",
        basic_language: meta.basic_language || "en",
        school: meta.school || "",
        profile_image: meta.profile_image || "",
        subscription: meta.subscription || "Basic",
        subscription_status: "active",
        registered_courses: [],
        is_child: meta.is_child ?? false,
      };

      try {
        await supabase.from("students").upsert(studentPayload);
      } catch (insertErr) {
        console.warn("Notice saving student row:", insertErr);
      }

      // Save student session to localStorage so /course-selection knows user is logged in
      try {
        localStorage.setItem("authdStudent", JSON.stringify(studentPayload));
        recordActivity();
      } catch (storageErr) {
        console.warn("Storage warning:", storageErr);
      }

      setStatus("success");
      setAlert({
        type: "success",
        message: "Email verified successfully! Setting up your courses...",
      });

      // Redirect to course selection onboarding page
      setTimeout(() => navigate("/course-selection"), 1200);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Invalid or expired verification code.");
      isVerifyingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (!email || !canResend) return;

    setCanResend(false);
    setResendCooldown(30);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/verify-student`,
      },
    });

    if (error) {
      setErrorMessage("Failed to resend code: " + error.message);
      setCanResend(true);
    } else {
      setAlert({
        type: "success",
        message: `A new 6-digit code has been sent to ${email}.`,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      bg="#F8FAFC"
      align="center"
      justify="center"
      p={{ base: 0, sm: 4, md: 8 }}
    >
      {/* Main Verification Card */}
      <Flex
        w="full"
        maxW="1100px"
        minH={{ base: "100vh", md: "720px" }}
        bg="white"
        borderRadius={{ base: "none", md: "3xl" }}
        boxShadow={{
          base: "none",
          md: "0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(226, 232, 240, 0.8)",
        }}
        overflow="hidden"
        position="relative"
        flexDirection={{ base: "column", lg: "row" }}
      >
        {/* ── LEFT PANEL: High-Fidelity Illustration Showcase ── */}
        <Box
          w={{ base: "100%", lg: "48%" }}
          bg="linear-gradient(150deg, #F0F6FF 0%, #E2EEFF 50%, #F5F9FF 100%)"
          p={{ base: 4, sm: 6, md: 10 }}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle curved background overlay */}
          <Box
            position="absolute"
            top="-10%"
            right="-15%"
            w="280px"
            h="280px"
            borderRadius="full"
            bg="rgba(32, 108, 225, 0.08)"
            filter="blur(40px)"
            pointerEvents="none"
          />

          {/* Top Header & Brand */}
          <Box zIndex={2}>
            <RouterLink to="/" style={{ textDecoration: "none", display: "inline-block" }}>
              <Image
                src={logo}
                alt="iGrade logo"
                h="40px"
                objectFit="contain"
                cursor="pointer"
                _hover={{ opacity: 0.85 }}
                transition="opacity 0.2s"
              />
            </RouterLink>

            <Box mt={6}>
              <Badge
                bg="#206CE1"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                mb={2.5}
              >
                Student Verification
              </Badge>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="800"
                color="#0F172A"
                lineHeight="1.3"
              >
                Ready to excel in your studies?
              </Heading>
              <Text fontSize="xs" color="#475569" mt={1.5} maxW="340px" lineHeight="1.5">
                Confirm your student email to activate Spark AI tutoring, personalized past questions, and practice tests.
              </Text>
            </Box>
          </Box>

          {/* Center Illustration */}
          <Flex
            flex={1}
            align="center"
            justify="center"
            my={{ base: 4, lg: 6 }}
            zIndex={2}
          >
            <Image
              src={verifyIllustration}
              alt="Email verification illustration"
              maxH={{ base: "190px", sm: "260px", md: "340px", lg: "390px" }}
              w="auto"
              maxW="100%"
              objectFit="contain"
              filter="drop-shadow(0 16px 24px rgba(32, 108, 225, 0.15))"
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.02)" }}
            />
          </Flex>

          {/* Bottom Security Highlights */}
          <HStack
            gap={4}
            wrap="wrap"
            pt={3}
            borderTop="1px solid"
            borderColor="rgba(32, 108, 225, 0.15)"
            zIndex={2}
          >
            <HStack gap={1.5}>
              <Icon as={PiCheckCircleFill} color="#206CE1" fontSize="14px" />
              <Text fontSize="11px" fontWeight="600" color="#334155">
                Encrypted OTP
              </Text>
            </HStack>
            <HStack gap={1.5}>
              <Icon as={PiCheckCircleFill} color="#206CE1" fontSize="14px" />
              <Text fontSize="11px" fontWeight="600" color="#334155">
                10-Minute Expiry
              </Text>
            </HStack>
            <HStack gap={1.5}>
              <Icon as={PiCheckCircleFill} color="#206CE1" fontSize="14px" />
              <Text fontSize="11px" fontWeight="600" color="#334155">
                Instant Activation
              </Text>
            </HStack>
          </HStack>
        </Box>

        {/* ── RIGHT PANEL: Clean Interactive OTP Entry ── */}
        <Box
          w={{ base: "100%", lg: "52%" }}
          p={{ base: 4, sm: 8, md: 12 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          bg="white"
        >
          <Box maxW="420px" mx="auto" w="full">
            {/* Top Mail Badge */}
            <Flex
              w="54px"
              h="54px"
              borderRadius="2xl"
              bg="#EBF3FF"
              color="#206CE1"
              align="center"
              justify="center"
              mb={5}
            >
              <Icon as={HiOutlineMail} fontSize="26px" />
            </Flex>

            {/* Header Titles */}
            <Heading
              as="h1"
              fontSize={{ base: "2xl", sm: "3xl" }}
              fontWeight="800"
              color="#0F172A"
              mb={2}
            >
              Check your inbox
            </Heading>
            <Text fontSize="sm" color="#64748B" mb={1} lineHeight="1.5">
              Enter the 6-digit confirmation code sent to
            </Text>
            <HStack
              bg="#F1F5F9"
              py={1.5}
              px={3}
              borderRadius="lg"
              display="inline-flex"
              mb={6}
            >
              <Icon as={HiShieldCheck} color="#206CE1" fontSize="16px" />
              <Text fontSize="xs" fontWeight="700" color="#0F172A">
                {email || "your registered email"}
              </Text>
            </HStack>

            {/* Notification Alerts */}
            {errorMessage && (
              <Alert.Root status="error" borderRadius="xl" mb={5} variant="subtle">
                <Alert.Indicator />
                <Alert.Description fontSize="xs" fontWeight="500">
                  {errorMessage}
                </Alert.Description>
              </Alert.Root>
            )}

            {alert && (
              <Alert.Root
                status={alert.type}
                borderRadius="xl"
                mb={5}
                variant="subtle"
              >
                <Alert.Indicator />
                <Alert.Description fontSize="xs" fontWeight="500">
                  {alert.message}
                </Alert.Description>
              </Alert.Root>
            )}

            {/* 6-Digit PIN Input */}
            <Box mb={6}>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="#475569"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb={3}
              >
                Verification Code
              </Text>
              <HStack justify="center" gap={{ base: 1.5, sm: 3 }}>
                <PinInput.Root
                  value={otp}
                  onValueChange={handleOtpChange}
                  type="numeric"
                  size="lg"
                  autoFocus
                >
                  <PinInput.Control gap={{ base: 1.5, sm: 3 }} justify="center">
                    {Array.from({ length: 6 }, (_, index) => (
                      <PinInput.Input
                        key={index}
                        index={index}
                        w={{ base: "38px", sm: "50px" }}
                        h={{ base: "46px", sm: "56px" }}
                        fontSize={{ base: "lg", sm: "2xl" }}
                        fontWeight="700"
                        textAlign="center"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                        color="#0F172A"
                        _focus={{
                          borderColor: "#206CE1",
                          bg: "white",
                          boxShadow: "0 0 0 4px rgba(32, 108, 225, 0.15)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                      />
                    ))}
                  </PinInput.Control>
                  <PinInput.HiddenInput />
                </PinInput.Root>
              </HStack>
            </Box>

            {/* Verify CTA Button */}
            <Button
              loading={status === "verifying"}
              loadingText="Verifying Code..."
              onClick={() => handleVerify()}
              bg="#206CE1"
              color="white"
              w="full"
              h="50px"
              fontWeight="700"
              fontSize="sm"
              borderRadius="xl"
              shadow="md"
              disabled={otp.join("").length !== 6 || status === "verifying"}
              _hover={{
                bg: "#1852B2",
                transform: "translateY(-1px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
              mb={5}
            >
              Verify & Select Courses
            </Button>

            {/* Resend Code Options */}
            <Flex
              align="center"
              justify="space-between"
              pt={2}
              borderTop="1px solid"
              borderColor="gray.100"
            >
              <Text fontSize="xs" color="#64748B">
                Didn't get the email?
              </Text>
              {canResend ? (
                <Button
                  variant="plain"
                  size="xs"
                  p={0}
                  color="#206CE1"
                  fontWeight="700"
                  _hover={{ textDecoration: "underline" }}
                  onClick={handleResendOtp}
                >
                  Resend Code
                </Button>
              ) : (
                <Text fontSize="xs" color="#94A3B8" fontWeight="500">
                  Resend in {resendCooldown}s
                </Text>
              )}
            </Flex>

            {/* Back to sign up */}
            <Box mt={6} textAlign="center">
              <RouterLink
                to="/signup?type=student"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#64748B",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <Icon as={PiArrowLeftBold} fontSize="12px" />
                Wrong email address? Return to Sign Up
              </RouterLink>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
