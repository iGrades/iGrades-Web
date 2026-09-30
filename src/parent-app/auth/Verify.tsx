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

export default function ParentVerify() {
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

  const email =
    location.state?.email ||
    JSON.parse(localStorage.getItem("formData") || "{}").email ||
    "";

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

    // Auto-submit when all 6 digits are entered and not already verifying
    if (value.every((v) => v !== "") && value.length === 6 && !isVerifyingRef.current) {
      handleVerify(value.join(""));
    }
  };

  // Verify OTP and insert parent record
  const handleVerify = async (manualToken?: string) => {
    if (isVerifyingRef.current) return;

    const rawToken = manualToken || otp.join("");
    const cleanToken = rawToken.trim().replace(/[^0-9a-zA-Z]/g, "");
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("Email address not found. Please try signing up again.");
      setStatus("error");
      return;
    }

    if (cleanToken.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      setStatus("error");
      return;
    }

    isVerifyingRef.current = true;
    setStatus("verifying");
    setErrorMessage(null);
    setAlert(null);

    try {
      // 1. Verify OTP with primary type "signup"
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      // 2. If 'signup' fails (e.g. user already registered/created previously), retry with 'email'
      if (error || !data?.user) {
        console.warn("Primary signup OTP verify notice, trying email OTP fallback:", error?.message);
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

      if (error) {
        setErrorMessage(error.message || "Invalid or expired verification code. Please check and try again.");
        setStatus("error");
        isVerifyingRef.current = false;
        return;
      }

      if (!data.user) {
        setErrorMessage("User record not found after verification.");
        setStatus("error");
        isVerifyingRef.current = false;
        return;
      }

      // Retrieve user metadata
      const { firstName, lastName, phone, aboutUs, password } =
        data.user.user_metadata || {};

      // Fallback to localStorage if metadata is incomplete
      const stored = localStorage.getItem("formData");
      const storedData = stored ? JSON.parse(stored) : {};
      const userData = {
        firstName: firstName || storedData.firstName || "",
        lastName: lastName || storedData.lastName || "",
        phone: phone || storedData.phone || "",
        aboutUs: aboutUs || storedData.aboutUs || "",
        email: cleanEmail || storedData.email,
      };

      // Set password if provided
      const effectivePassword = password || storedData.password;
      if (effectivePassword) {
        try {
          await supabase.auth.updateUser({
            password: effectivePassword,
          });
        } catch (pwErr) {
          console.warn("Password update notice:", pwErr);
        }
      }

      // Insert data into parents table
      const { error: insertError } = await supabase.from("parents").upsert({
        user_id: data.user.id,
        email: userData.email,
        firstname: userData.firstName,
        lastname: userData.lastName,
        phone: userData.phone,
        about_us: userData.aboutUs,
      });

      if (insertError) {
        console.warn("Notice saving parent row:", insertError.message);
      }

      // Fetch the created/existing parent profile row
      let parentRecord: any = null;
      try {
        const { data: fetchedParent } = await supabase
          .from("parents")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (fetchedParent) {
          parentRecord = fetchedParent;
        }
      } catch (fErr) {
        console.warn("Parent fetch notice:", fErr);
      }

      if (!parentRecord) {
        parentRecord = {
          id: data.user.id,
          user_id: data.user.id,
          email: userData.email,
          firstname: userData.firstName,
          lastname: userData.lastName,
          phone: userData.phone,
          about_us: userData.aboutUs,
        };
      }

      // CRITICAL: Cache in localStorage immediately so parent dashboard never redirects to /login!
      try {
        localStorage.setItem("authdParent", JSON.stringify([parentRecord]));
        localStorage.removeItem("formData");
        recordActivity();
      } catch (storageErr) {
        console.warn("Session storage warning:", storageErr);
      }

      setStatus("success");
      setAlert({
        type: "success",
        message: "Account verified successfully! Launching your dashboard...",
      });

      setTimeout(() => {
        navigate("/parent-dashboard");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during verification.");
      setStatus("error");
      isVerifyingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !canResend) return;

    setCanResend(false);
    setResendCooldown(30);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      setErrorMessage("Failed to resend code: " + error.message);
      setCanResend(true);
    } else {
      setAlert({
        type: "success",
        message: `A fresh 6-digit code has been dispatched to ${email}.`,
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
                Account Verification
              </Badge>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="800"
                color="#0F172A"
                lineHeight="1.3"
              >
                Protecting your child's academic journey.
              </Heading>
              <Text fontSize="xs" color="#475569" mt={1.5} maxW="340px" lineHeight="1.5">
                Verify your identity to unlock performance reports, student progress tracking, and curriculum insights.
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
              Check your email
            </Heading>
            <Text fontSize="sm" color="#64748B" mb={1} lineHeight="1.5">
              We've sent a 6-digit confirmation code to
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
              Verify & Continue
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
                to="/signup"
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
