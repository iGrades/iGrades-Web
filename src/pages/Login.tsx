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

import logo from "@/assets/landing-page/logo.png";
import icon from "../assets/human_ico.png";
import sideImage from "../assets/undraw_sign-in_uva0.svg";
import ParentLogin from "@/parent-app/auth/Login";
import StudentLogin from "@/student-app/auth/Login";

export default function Login() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [loginState, setLoginState] = useState("parent");

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Children", state: "children" },
  ];

  return (
    <Flex minH="100vh" bg="white" position="relative">

      {/* Alert */}
      {alert && (
        <Box
          position="absolute"
          top={{ base: "10px", md: "20px" }}
          right={{ base: "10px", md: "20px" }}
          width={{ base: "90%", sm: "80%", md: "400px" }}
          zIndex={20}
        >
          <Alert.Root status={alert.type} variant="subtle">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                {alert.type === "error" ? "Error!" : "Success!"}
              </Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}

      {/* ── LEFT PANEL (desktop only) ── */}
      <Box
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        w="45%"
        position="relative"
        bg="gray.50"
        overflow="hidden"
        borderRight="1px solid"
        borderColor="gray.100"
      >
        <Box
          position="absolute"
          top="-60px"
          left="-60px"
          w="220px"
          h="220px"
          borderRadius="full"
          bg="primaryColor"
          opacity={0.06}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-40px"
          right="-40px"
          w="180px"
          h="180px"
          borderRadius="full"
          bg="primaryColor"
          opacity={0.06}
          pointerEvents="none"
        />

        <Box px={10} pt={10} zIndex={1}>
          <Image src={logo} alt="iGrades logo" w="130px" />
        </Box>

        <Box px={10} mt={10} zIndex={1}>
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="primaryColor"
            mb={3}
          >
            iGrade Platform
          </Text>
          <Heading
            as="h2"
            fontSize="2xl"
            fontWeight="700"
            color="on_backgroudColor"
            lineHeight="1.3"
            maxW="260px"
          >
            Welcome back. Let's pick up where you left off.
          </Heading>
        </Box>

        <Flex flex={1} align="flex-end" justify="center" px={0} pb={6} zIndex={1}>
          <Image
            src={sideImage}
            alt="Login illustration"
            w="100%"
            maxW="650px"
            objectFit="contain"
          />
        </Flex>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <Box
        flex={1}
        h="100vh"
        overflowY="auto"
        bg="white"
      >
        <Box>
          {/* Mobile logo */}
          <Box display={{ base: "block", lg: "none" }} p={5}>
            <Image src={logo} alt="iGrades logo" w="120px" />
          </Box>

          {/* Don't have account bar */}
          <Flex justify="flex-end">
            <Flex
              align="center"
              bg="gray.100"
              w={{ base: "78%", md: "60%", lg: "42%" }}
              p={1}
              m={5}
              borderRadius="3xl"
            >
              <Icon size="2xl" mx={2}>
                <img src={icon} alt="human_icon" />
              </Icon>
              <Text fontSize="xs" color="greyOthers">
                Do not have an account yet?
              </Text>
              <Link
                onClick={() => navigate("/signup")}
                variant="plain"
                color="primaryColor"
                fontWeight="semibold"
                fontSize="sm"
                mx={2}
              >
                Register
              </Link>
            </Flex>
          </Flex>

          {/* Form area */}
          <Box w={{ base: "90%", md: "70%", lg: "70%" }} m="auto">
            <Box w={{ base: "90%", lg: "70%" }} m="auto" textAlign="center">
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "4xl" }}
                mt={10}
                mb={3}
                color="on_backgroudColor"
                fontWeight="bold"
              >
                Login to your iGrade
              </Heading>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
                color="mediumGrey"
                my={5}
              >
                Enter your email address and password to securely login to your
                iGrade account
              </Text>
            </Box>

            <Flex
              bg="textFieldColor"
              w={{ base: "100%", lg: "90%" }}
              m="auto"
              justify="space-around"
              my={10}
              p={2}
              rounded="md"
            >
              {userType.map((user) => (
                <Button
                  key={user.type}
                  onClick={() => setLoginState(user.state)}
                  variant={loginState === user.state ? "solid" : "outline"}
                  colorScheme={
                    loginState === user.state ? "primaryColor" : "textFieldColor"
                  }
                  w={{ base: "45%", md: "45%" }}
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
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}