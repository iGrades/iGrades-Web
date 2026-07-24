import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Button,
  Text,
  Grid,
  Field,
  InputGroup,
  Input,
  Alert,
  Box,
  Flex,
  Tag,
} from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  aboutUs: string;
}

export default function ParentSignUp() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    aboutUs: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    const {
      email,
      password,
      confirmPassword,
      phone,
      firstName,
      lastName,
      aboutUs,
    } = formData;

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    // Send OTP for signup
    const { error: signupError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { firstName, lastName, phone, aboutUs },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (signupError) {
      setAlert({
        type: "error",
        message: signupError.message || "Failed to send OTP. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    // Save form data to localStorage
    localStorage.setItem(
      "formData",
      JSON.stringify({ firstName, lastName, phone, aboutUs, email })
    );

    setIsLoading(false);
    setAlert({
      type: "success",
      message: `A 6-digit OTP has been sent to ${email}. Please check your email (including spam/junk).`,
    });

    // Redirect to verify page with email in state
    setTimeout(() => {
      navigate("/verify", { state: { email } });
    }, 1000);
  };

  const passIcons = () => {
    setShowPassword((prev) => !prev);
    setShowConfirmPassword((prev) => !prev);
  };

  const formFields = [
    { name: "firstName", type: "text", placeholder: "First Name" },
    { name: "lastName", type: "text", placeholder: "Last Name" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "phone", type: "phone", placeholder: "Phone Number" },
    { name: "password", type: "password", placeholder: "Password" },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
    },
  ];

  return (
    <>
      <Box bg="white">
        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
            }}
            gap="4"
          >
            {formFields.map((field) => (
              <Box key={field.name}>
                <Field.Root>
                  <Field.Label
                    color="#334155"
                    fontSize="sm"
                    fontWeight="600"
                    mb={1.5}
                  >
                    {field.placeholder}
                  </Field.Label>
                </Field.Root>
                <InputGroup
                  w="full"
                  endElement={
                    (field.name === "password" ||
                      field.name === "confirmPassword") && (
                      <button type="button" onClick={passIcons} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {showPassword || showConfirmPassword ? (
                          <IoEyeOutline size={18} color="#94A3B8" />
                        ) : (
                          <IoEyeOffOutline size={18} color="#94A3B8" />
                        )}
                      </button>
                    )
                  }
                >
                  <Input
                    name={field.name}
                    type={
                      (field.name === "password" && showPassword) ||
                      (field.name === "confirmPassword" &&
                        showConfirmPassword)
                        ? "text"
                        : field.type
                    }
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    required
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    h="11"
                    fontSize="sm"
                    px={4}
                    _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                    _placeholder={{ color: "gray.400" }}
                  />
                </InputGroup>
              </Box>
            ))}
          </Grid>
          <Flex mt={4} flexWrap="wrap" gap={2}>
            {[
              "Lowercase Letter",
              "Uppercase Letter",
              "Number",
              "Special character",
              "8 characters in length",
            ].map((tag, idx) => (
              <Tag.Root
                key={idx}
                size="sm"
                p={1.5}
                px={3}
                rounded="full"
                bg="blue.50"
                border="none"
              >
                <Tag.Label
                  fontSize="2xs"
                  fontWeight="600"
                  color="primaryColor"
                  textAlign="center"
                  m="auto"
                >
                  {tag}
                </Tag.Label>
              </Tag.Root>
            ))}
          </Flex>
          <Box mt={4}>
            <Field.Root>
              <Field.Label color="#334155" fontSize="sm" fontWeight="600" mb={1.5}>
                How did you hear about us?
              </Field.Label>
            </Field.Root>
            <Input
              name="aboutUs"
              type="text"
              placeholder="Let us know how you found us"
              onChange={handleChange}
              required
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              h="11"
              fontSize="sm"
              px={4}
              _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
              _placeholder={{ color: "gray.400" }}
            />
          </Box>
          {alert && (
            <Alert.Root status={alert.type} variant="subtle" mt={6} borderRadius="xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title fontSize="sm" fontWeight="700">
                  {alert.type === "error" ? "Error!" : "Success!"}
                </Alert.Title>
                <Alert.Description fontSize="xs">{alert.message}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Text mt={6} color="#64748B" fontSize="xs" textAlign="center" lineHeight="1.5">
            By clicking continue, I agree to{" "}
            <span style={{ fontWeight: "700", color: "#206CE1", cursor: "pointer" }}>
              Terms of Use
            </span>{" "}
            and acknowledge <br /> that I have read the{" "}
            <span style={{ fontWeight: "700", color: "#206CE1", cursor: "pointer" }}>
              Privacy Policy
            </span>
          </Text>
          <Flex justify="center" my={6}>
            <Button
              loading={isLoading}
              loadingText="Creating your account..."
              spinnerPlacement="start"
              type="submit"
              fontWeight="700"
              w="full"
              h="12"
              bg="primaryColor"
              color="white"
              borderRadius="xl"
              _hover={{ bg: "#1a5bbf" }}
              transition="all 0.2s"
              boxShadow="0 4px 12px rgba(32, 108, 225, 0.2)"
            >
              Create an Account
            </Button>
          </Flex>
        </form>
      </Box>
    </>
  );
}
