import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Alert,
  Box,
  Text,
  Flex,
  Icon,
  Link,
  Heading,
  Image,
} from "@chakra-ui/react";

import icon from "../assets/human_ico.png";
import ParentLogin from "@/parent-app/auth/Login";
import StudentLogin from "@/student-app/auth/Login";
import sideImage from "../assets/undraw_sign-in_uva0-removebg-preview.png";

export default function Login() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [loginState, setLoginState] = useState("parent"); // "parent" or "children"

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Children", state: "children" },
  ];

  const handleUserTypeChange = (type: string) => {
    setLoginState(type);
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
      h="100vh"
    >
      <Image
        src={sideImage}
        alt="login_image"
        display={{ base: "none", lg: "block" }}
        w={{ base: "full", lg: "50%" }}
      />
      <Box bg="white" h={"full"} w={{ base: "full", lg: "50%" }}>
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
        <Box w={{ base: "90%", md: "70%", lg: "90%" }} m={"auto"}>
          <Box w={{ base: "90%", lg: "65%" }} m={"auto"} textAlign={"center"}>
            <Heading
              as={"h1"}
              fontSize={"4xl"}
              mt={10}
              mb={3}
              color={"on_backgroudColor"}
              fontWeight={"bold"}
            >
              Login in to your iGrade
            </Heading>
            <Text
              fontSize={"md"}
              fontWeight={"medium"}
              color={"mediumGrey"}
              my={5}
            >
              Enter your email address and password to securely login to your
              iGrade account
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

          {loginState === "parent" ? (
            <ParentLogin setAlert={setAlert} />
          ) : (
            <StudentLogin setAlert={setAlert} />
          )}

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
        </Box>
      </Box>
    </Flex>
  );
}
