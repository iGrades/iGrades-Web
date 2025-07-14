import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Input,
  Button,
  Alert,
  Flex,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";

export default function Verify() {
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

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    // Allow backspace (empty string) or single digit
    if (value === "" || /^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if a digit is entered
      // or previous input if backspace is pressed

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      } else if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    const newOtp = [...otp];

    // Fill OTP fields with pasted digits
    for (let i = 0; i < 6; i++) {
      if (i < pastedData.length) {
        newOtp[i] = pastedData[i];
      } else {
        newOtp[i] = "";
      }
    }

    setOtp(newOtp);

    // Focus the last filled input
    const focusIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  // Verify OTP and insert data
  const handleVerify = async () => {
    if (!email) {
      setErrorMessage("Email not found. Please try signing up again.");
      setStatus("error");
      return;
    }

    const token = otp.join("");
    if (token.length !== 6) {
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
      token,
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
    navigate('/')
  };

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.getElementById("otp-0");
    firstInput?.focus();
  }, []);

  return (
    <Box
      bg="white"
      boxShadow={{ base: "none", lg: "lg" }}
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
            <Alert.Root status={alert.type} borderRadius="md" variant="surface">
              <Alert.Indicator />
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          )}
        </Box>
      )}
      <Box textAlign="center" p={6} maxW="400px" mx="auto" my={40}>
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
          Enter the six digit code we sent to {email || "your email"} to verify
          your iGrade account.
        </Text>
        <SimpleGrid columns={6} gap={4} mb={10}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                // Only take the last character (helps with some mobile keyboards)
                const value = e.target.value.slice(-1);
                handleOtpChange(index, value);
              }}
              onPaste={index === 0 ? handlePaste : undefined}
              onKeyDown={(e) => {
                // Handle backspace properly
                if (e.key === "Backspace" && !digit && index > 0) {
                  const prevInput = document.getElementById(`otp-${index - 1}`);
                  prevInput?.focus();
                }
              }}
              textAlign="center"
              fontSize="2xl"
              fontWeight="bold"
              p={6}
              borderRadius="md"
              bg="gray.50"
              color="gray.800" // More visible text color
              border="2px solid"
              borderColor="gray.200"
              _focus={{
                borderColor: "blue.500",
                color: "gray.800",
                bg: "white",
                boxShadow: "outline",
              }}
              css={{
                "& input": {
                  textAlign: "center",
                  caretColor: "transparent", // Hide blinking cursor
                },
              }}
            />
          ))}
        </SimpleGrid>
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
        >
          Continue
        </Button>
        <Heading as="h4" mt={4} fontSize="xs" color="#464646">
          Didn’t receive any code?{" "}
          <Link
            to="#!"
            color="blue.500"
            onClick={async () => {
              if (email) {
                const { error } = await supabase.auth.signInWithOtp({
                  email,
                  options: {
                    shouldCreateUser: false, // User already created
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
  );
}
