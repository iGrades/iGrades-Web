import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Alert,
  Box,
  Text,
  Flex,
  Icon,
  Link,
  Heading,
  Grid,
  Field,
  InputGroup,
} from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import icon from "../assets/human_ico.png";
import OtpInput from "../components/otpInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState("parent"); // "parent" or "children"

  const navigate = useNavigate();
  const { t } = useTranslation();

  const parentFormFields = [
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" },
  ];

  const childFormFields = [
    { name: "name", type: "text", placeholder: "Username" },
  ];

  const passIcons = () => {
    setShowPassword((prev) => !prev);
  };

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Children", state: "children" },
  ];

  const handleUserTypeChange = (type: string) => {
    setLoginState(type);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const {name, value} = e.target;

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "name") {
      // Handle child username input
      // This is just a placeholder, you can handle it as needed
    }
  };
  

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
    }
    navigate("/");
  };

  

  return (
    <Flex
      as="section"
      align="center"
      justify={{ base: "center", md: "flex-end" }}
      bg="gray.100"
    >
      <Box
        bg={"white"}
        boxShadow={"lg"}
        h={"full"}
        w={{ base: "full", md: "60%", lg: "50%" }}
      >
        <Flex justify={"flex-end"}>
          <Flex
            align={"center"}
            bg={"gray.100"}
            w={{ base: "78%", md: "60%", lg: "42%" }}
            p={1}
            m={5}
            borderRadius={"3xl"}
          >
            <Icon size={"2xl"} mx={2}>
              <img src={icon} alt="human_icon" />
            </Icon>
            <Text fontSize={"xs"} color={"greyOthers"}>
              Do not have an account yet?{" "}
            </Text>
            <Link
              onClick={() => navigate("/signup")}
              variant={"plain"}
              color={"primaryColor"}
              fontWeight={"semibold"}
              fontSize={"sm"}
              mx={2}
            >
              Register
            </Link>
          </Flex>
        </Flex>
        <Box w={{ base: "90%", md: "90%", lg: "90%" }} m={"auto"}>
          <Box w={{ base: "90%", lg: "65%" }} m={"auto"} textAlign={"center"}>
            <Heading
              as={"h1"}
              fontSize={"4xl"}
              mt={10}
              mb={3}
              color={"on_backgroudColor"}
              fontWeight={"bold"}
            >
              {t("login_title")}
            </Heading>
            <Text
              fontSize={"md"}
              fontWeight={"medium"}
              color={"mediumGrey"}
              my={5}
            >
              {t("login_desc")}
            </Text>
          </Box>

          <Flex
            bg="textFieldColor"
            w="90%"
            m="auto"
            justify="space-between"
            my={10}
          >
            {userType.map((user) => (
              <Button
                key={user.type}
                onClick={() => handleUserTypeChange(user.state)}
                variant={loginState === user.state ? "solid" : "outline"}
                colorScheme={
                  loginState === user.state ? "primaryColor" : "textFieldColor"
                }
                mx={2}
                w="1/2"
                outline="none"
                border="none"
                bg={
                  loginState === user.state ? "primaryColor" : "textFieldColor"
                }
              >
                {user.type}
              </Button>
            ))}
          </Flex>

          <form onSubmit={handlePasswordLogin}>
            <Grid templateColumns={'base: "repeat(1, 1fr)"'} gap={"6"} my={5}>
              {loginState === "parent"
                ? parentFormFields.map((field) => (
                    <Box key={field.name} className="">
                      <Field.Root>
                        <Field.Label
                          color={"greyOthers"}
                          fontSize={"sm"}
                          fontWeight={"medium"}
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
                              {showPassword ? (
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
                          type={showPassword ? "text" : field.type}
                          placeholder={field.placeholder}
                          onChange={handleChange}
                          required
                          bg={"textFieldColor"}
                          outline={"primaryColor"}
                          border={"none"}
                          css={{ "--focus-color": "primaryColor" }}
                          _placeholder={{ color: "fieldTextColor" }}
                        />
                      </InputGroup>
                    </Box>
                  ))
                : childFormFields.map((field) => (
                    <Box key={field.name} className="">
                      <Field.Root>
                        <Field.Label
                          color={"greyOthers"}
                          fontSize={"sm"}
                          fontWeight={"medium"}
                          my={2}
                        >
                          {field.placeholder}
                        </Field.Label>
                      </Field.Root>
                      <InputGroup>
                        <Input
                          name={field.name}
                          type={showPassword ? "text" : field.type}
                          placeholder={field.placeholder}
                          onChange={handleChange}
                          required
                          bg={"textFieldColor"}
                          outline={"primaryColor"}
                          border={"none"}
                          css={{ "--focus-color": "primaryColor" }}
                          _placeholder={{ color: "fieldTextColor" }}
                        />
                      </InputGroup>
                    </Box>
                  ))}
              {loginState === "children" && (
                <Box w="full">
                  <Text
                    my={2}
                    color="greyOthers"
                    fontSize={"sm"}
                    fontWeight={"medium"}
                  >
                    Passkey
                  </Text>
                  <OtpInput onChangeOtp={(value) => setOtp(value)} />
                </Box>
              )}
            </Grid>

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
                type="submit"
                fontWeight="semibold"
                w="60%"
                p={6}
                bg="blue.500"
                color="white"
                borderRadius="xl"
              >
                {t("login")}
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
