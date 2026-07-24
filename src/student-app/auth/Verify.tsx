import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Alert,
  Heading,
  PinInput,
  Flex,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";


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
  const navigate = useNavigate();
  
const location = useLocation();
const email = location.state?.email;

  // Handle OTP Verification
const handleVerify = async () => {
  const token = otp.join("");
  if (token.length !== 6) {
    setErrorMessage("Please enter a 6-digit OTP.");
    setStatus("error");
    return;
  }

  setStatus("verifying");
  setErrorMessage(null);
  setAlert(null);

  try {
    // Verify OTP (returns a new session + user)
    const { data, error } = await supabase.auth.verifyOtp({
      email: location.state?.email, // pull from navigation state
      token,
      type: "signup",
    });

    if (error) throw error;

    const user = data?.user;
    if (!user) throw new Error("User not returned after OTP verification.");

    // Insert into students table only if not already inserted
    if (!user.user_metadata.metadata_inserted) {
      const { error: insertError } = await supabase.from("students").insert({
        id: user.id,
        email: user.email,
        firstname: user.user_metadata.firstname,
        lastname: user.user_metadata.lastname,
        date_of_birth: user.user_metadata.date_of_birth,
        gender: user.user_metadata.gender,
        class: user.user_metadata.class,
        basic_language: user.user_metadata.basic_language,
        school: user.user_metadata.school,
        profile_image: user.user_metadata.profile_image,
        passcode: user.user_metadata.passcode,
        subscription: user.user_metadata.subscription,
      });

      if (insertError) throw insertError;

      // Mark metadata as inserted
      const { error: updateError } = await supabase.auth.updateUser({
        data: { metadata_inserted: true },
      });

      if (updateError) throw updateError;
    }

    setStatus("success");
    setAlert({
      type: "success",
      message: "Verification successful! Redirecting...",
    });

    setTimeout(() => navigate("/student-dashboard"), 2000);
  } catch (error: any) {
    setStatus("error");
    setErrorMessage(error.message || "An error occurred during verification.");
  }
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
          your account.
        </Text>

        {/* Using PinInput component for OTP */}
        <Flex justify="center" mb={10}>
          <PinInput.Root
            size="lg"
            value={otp}
            onValueChange={(e) => setOtp(e.value)}
          >
            <PinInput.HiddenInput />
            <PinInput.Control>
              <PinInput.Input index={0} />
              <PinInput.Input index={1} />
              <PinInput.Input index={2} />
              <PinInput.Input index={3} />
              <PinInput.Input index={4} />
              <PinInput.Input index={5} />
            </PinInput.Control>
          </PinInput.Root>
        </Flex>

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
