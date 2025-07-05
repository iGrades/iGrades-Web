import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Text,
  Heading,
  Link,
  Grid,
  Field,
  InputGroup,
  Input,
  Alert,
  Box,
  Flex,
  Icon,
  Image
} from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import icon from "../assets/human_ico.png";
import sideImage from "../assets/undraw_sign-up_qamz-removebg-preview.png";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  aboutUs: string;
}

export default function SignUp() {
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
      return;
    }

    // Sign up user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`, // Redirect after confirmation
      },
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
    }

    // Save additional data to localStorage (to insert later)
    localStorage.setItem(
      "formData",
      JSON.stringify({ firstName, lastName, phone, aboutUs })
    );
    setAlert({
      type: "success",
      message: `Confirmation email sent to ${email}. Please verify your email.`,
    });
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
    <Flex
      as="section"
      align="center"
      justify={{ base: "center", md: "space-between" }}
      backgroundImage={{ base: "url('/undraw_sign-in_uva0.png')", lg: "none" }}
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
      bg={{ lg: "textFieldColor" }}
      h="100vh"
    >
      <Image
        src={sideImage}
        alt="login_image"
        display={{ base: "none", lg: "block" }}
        w={{ base: "full", lg: "50%" }}
      />
      <Box bg="white" boxShadow="lg" w={{ base: "full", lg: "60%" }}>
        <Flex justify="flex-end">
          <Flex
            align="center"
            bg="gray.100"
            w={{ base: "78%", md: "40%", lg: "37%" }}
            p={1}
            m={5}
            borderRadius="3xl"
          >
            <Icon size="2xl" mx={2}>
              <img src={icon} alt="human_icon" />
            </Icon>
            <Text fontSize="xs" color="gray.600">
              Already have an account?
            </Text>
            <Link
              onClick={() => navigate("/login")}
              variant="plain"
              color="blue.600"
              fontWeight="semibold"
              fontSize="sm"
              mx={2}
            >
              Sign In
            </Link>
          </Flex>
        </Flex>
        <Box w="85%" m="auto">
          <Box textAlign="center" mb={6}>
            <Heading fontSize="3xl">Let's get you started</Heading>
            <Text fontSize="md" mt={2} color="gray.600">
              Please provide your details
            </Text>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid
              templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
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
                      onChange={handleChange}
                      required
                      bg="gray.50"
                      border="1px solid #ccc"
                    />
                  </InputGroup>
                </Box>
              ))}
            </Grid>
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
            <Flex justify={"center"} my={10}>
              <Button
                loading={isLoading}
                loadingText="Signing you up..."
                spinnerPlacement="start"
                type="submit"
                fontWeight="semibold"
                w={{ base: "100%", lg: "100%" }}
                p={6}
                bg="blue.500"
                color="white"
                borderRadius="xl"
              >
                Create an Account
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
