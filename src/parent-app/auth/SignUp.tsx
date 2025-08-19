import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
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
import Verify from "./Verify";

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
  const [signUpState, setSignUpState] = useState<String | null>("signup");
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { firstName, lastName, phone, aboutUs, password },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      setAlert({
        type: "error",
        message: error.message || "Failed to send OTP. Please try again.",
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
      // navigate("/verify", { state: { email } });
      setSignUpState("verify");
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
  
      {signUpState === "signup" ? (
        <Box bg="white">
        
            <form onSubmit={handleSubmit}>
              <Grid
                templateColumns={{
                  base: "repeat(1, 1fr)",
                  md: "repeat(2, 1fr)",
                }}
                gap="6"
              >
                {formFields.map((field) => (
                  <Box key={field.name}>
                    <Field.Root>
                      <Field.Label
                        color="gray.600"
                        fontSize="sm"
                        fontWeight="medium"
                        my={2}
                      >
                        {field.placeholder}
                      </Field.Label>
                    </Field.Root>
                    <InputGroup
                      endElement={
                        (field.name === "password" ||
                          field.name === "confirmPassword") && (
                          <button type="button" onClick={passIcons}>
                            {showPassword || showConfirmPassword ? (
                              <IoEyeOutline />
                            ) : (
                              <IoEyeOffOutline />
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
                        _placeholder={{ fontSize: "xs" }}
                        onChange={handleChange}
                        required
                        bg="gray.50"
                        border="1px solid #ccc"
                      />
                    </InputGroup>
                  </Box>
                ))}
              </Grid>
              <Flex mt={5} flexWrap={{ base: "wrap", md: "nowrap" }} gap={2}>
                {[
                  "Lowercase Letter",
                  "Uppercase Letter",
                  "Number",
                  "Special character",
                  "8 characters in length",
                ].map((tag, idx) => (
                  <Tag.Root
                    key={idx}
                    w={{ base: "30", md: "40" }}
                    size="sm"
                    p={2}
                    rounded="2xl"
                  >
                    <Tag.Label
                      fontSize="0.7em"
                      color="greyOthers"
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
                  <Field.Label color="gray.600" fontSize="sm" my={2}>
                    How did you hear about us?
                  </Field.Label>
                </Field.Root>
                <Input
                  name="aboutUs"
                  type="text"
                  placeholder="Let us know how you found us"
                  onChange={handleChange}
                  required
                  bg="gray.50"
                  border="1px solid #ccc"
                />
              </Box>
              {alert && (
                <Alert.Root status={alert.type} variant="subtle" mt={6}>
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>
                      {alert.type === "error" ? "Error!" : "Success!"}
                    </Alert.Title>
                    <Alert.Description>{alert.message}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <Text mt={10} color="#464646" fontSize="sm" textAlign="center">
                By clicking continue, I agree to{" "}
                <span style={{ fontWeight: "bold", color: "#206CE1" }}>
                  Terms of Use
                </span>{" "}
                and acknowledge <br /> that I have read the{" "}
                <span style={{ fontWeight: "bold", color: "#206CE1" }}>
                  Privacy Policy
                </span>
              </Text>
              <Flex justify="center" my={10}>
                <Button
                  loading={isLoading}
                  loadingText="Creating your account..."
                  spinnerPlacement="start"
                  type="submit"
                  fontWeight="semibold"
                  w={{ base: "100%", lg: "100%" }}
                  p={6}
                  bg="blue.500"
                  color="white"
                  borderRadius="3xl"
                >
                  Create an Account
                </Button>
              </Flex>
            </form>
          </Box>
      ) : (
        <Verify />
      )}
    </>
  );
}
