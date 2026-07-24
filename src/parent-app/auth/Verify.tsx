import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";
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
} from "@chakra-ui/react";
import sideImage from "@/assets/verify_svg-removebg-preview.png";

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
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email ||
    JSON.parse(localStorage.getItem("formData") || "{}").email;

  // Handle OTP change
  const handleOtpChange = (details: { value: string[] }) => {
    const value = details.value;
    setOtp(value);

    // Auto-submit when OTP is complete
    if (value.every((v) => v !== "") && value.length === 6) {
      handleVerify();
    }
  };

  // Verify OTP and insert data
  const handleVerify = async () => {
    const otpString = otp.join("");

    if (!email) {
      setErrorMessage("Email not found. Please try signing up again.");
      setStatus("error");
      return;
    }

    if (otpString.length !== 6) {
      setErrorMessage("Please enter a 6-digit OTP.");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setErrorMessage(null);
    setAlert(null);

    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpString,
      type: "signup",
    });

    if (error) {
      setErrorMessage(error.message || "Invalid or expired OTP.");
      setStatus("error");
      return;
    }

    if (!data.user) {
      setErrorMessage("User not found after OTP verification.");
      setStatus("error");
      return;
    }

    // Retrieve user metadata
    const { firstName, lastName, phone, aboutUs, password } =
      data.user.user_metadata || {};

    // Fallback to localStorage if metadata is incomplete
    const stored = localStorage.getItem("formData");
    const storedData = stored ? JSON.parse(stored) : {};
    const userData = {
      firstName: firstName || storedData.firstName,
      lastName: lastName || storedData.lastName,
      phone: phone || storedData.phone,
      aboutUs: aboutUs || storedData.aboutUs,
      email: email || storedData.email,
    };

    if (!userData.firstName || !userData.lastName || !userData.email) {
      setErrorMessage("Incomplete user data. Please try signing up again.");
      setStatus("error");
      return;
    }

    // Set password if provided
    if (password) {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setErrorMessage("Error setting password: " + updateError.message);
        setStatus("error");
        return;
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
      setErrorMessage("Error saving profile: " + insertError.message);
      setStatus("error");
      return;
    }

    // Clean up
    localStorage.removeItem("formData");
    setStatus("success");
    setAlert({
      type: "success",
      message: "Verification successful! Redirecting...",
    });
    navigate("/parent-dashboard");
  };

  return (
    <Flex
      as="section"
      align="center"
      justify={{ base: "center", md: "space-between" }}
      backgroundImage={{ base: "url('/undraw_sign-in_uva0.png')", lg: "none" }}
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
        w={{ base: "full", lg: "30%" }}
        mx='auto'
      />
      <Box
        bg="white"
        // boxShadow={{ base: "none", lg: "lg" }}
        w={{ base: "full", lg: "60%" }}
 
        position="relative"
      >
        {(errorMessage || alert) && (
          <Box
            position="absolute"
            top={{ base: "10px", md: "20px" }}
            right={{ base: "10px", md: "20px" }}
            width={{ base: "80%", sm: "60%", md: "40%", lg: "30%" }}
            zIndex="10"
          >
            {errorMessage && (
              <Alert.Root status="error" borderRadius="md" variant="surface">
                <Alert.Indicator />
                <Alert.Description>{errorMessage}</Alert.Description>
              </Alert.Root>
            )}
            {alert && (
              <Alert.Root
                status={alert.type}
                borderRadius="md"
                variant="surface"
              >
                <Alert.Indicator />
                <Alert.Description>{alert.message}</Alert.Description>
              </Alert.Root>
            )}
          </Box>
        )}
        <Box
          textAlign="center"
          p={6}
          maxW="400px"
          mx="auto"
          my={32}
          bg="white"
          rounded="2xl"
        >
          <Heading
            as="h1"
            color="on_backgroundColor"
            fontSize="3xl"
            fontWeight="bold"
            mb={5}
          >
            Please verify your email address
          </Heading>
          <Text mb={10} color="#464646" fontWeight={400}>
            Enter the six digit code we sent to {email || "your email"} to
            verify your iGrade account.
          </Text>

          <HStack justify="center" mb={10}>
            <PinInput.Root
              value={otp}
              onValueChange={handleOtpChange}
              type="numeric"
              size="sm"
              autoFocus
            >
              <PinInput.Control>
                {Array.from({ length: 6 }, (_, index) => (
                  <PinInput.Input
                    key={index}
                    index={index}
                    fontSize="md"
                    fontWeight="normal"
                    width="50px"
                    height="50px"
                    borderRadius="md"
                    bg="gray.50"
                    color="gray.800"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "blue.500",
                      color: "gray.800",
                      bg: "white",
                      boxShadow: "outline",
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

          <Button
            loading={status === "verifying"}
            loadingText="Verifying..."
            onClick={handleVerify}
            bg="blue.500"
            color="white"
            w="full"
            p={6}
            shadow="xl"
            borderRadius="3xl"
            disabled={otp.join("").length !== 6}
          >
            Continue
          </Button>

          <Heading as="h4" mt={4} fontSize="xs" color="#464646">
            Didn't receive any code?{" "}
            <Link
              to="#!"
              color="blue.500"
              onClick={async () => {
                if (email) {
                  const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                      shouldCreateUser: false,
                      emailRedirectTo: `${window.location.origin}/verify`,
                    },
                  });
                  if (error) {
                    setErrorMessage("Failed to resend OTP: " + error.message);
                    setStatus("error");
                  } else {
                    setErrorMessage(null);
                    setAlert({
                      type: "success",
                      message: "OTP resent successfully.",
                    });
                  }
                }
              }}
            >
              <span style={{ color: "#206CE1" }}>Resend Code</span>
            </Link>
          </Heading>
        </Box>
      </Box>
    </Flex>
  );
}
