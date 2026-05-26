import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
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
import sideImage from "../assets/undraw_sign-up_qamz.svg";
import ParentSignUp from "@/parent-app/auth/SignUp";
import StudentSignUp from "@/student-app/auth/SignUp";

const SignUp = () => {
  const navigate = useNavigate();
  const [registerState, setRegisterState] = useState("parent");

  const userType = [
    { type: "iGrade Parent", state: "parent" },
    { type: "iGrade Student", state: "children" },
  ];

  return (
    <Flex minH="100vh" bg="white">

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
            Empowering every student's journey.
          </Heading>
        </Box>

        <Flex flex={1} align="flex-end" justify="center" px={0} pb={0} zIndex={1}>
          <Image
            src={sideImage}
            alt="Sign up illustration"
            w="100%"
            maxW="650px"
            objectFit="contain"
            transform="scaleX(-1)"
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

          {/* Already have account bar */}
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
                Already have an account?
              </Text>
              <Link
                onClick={() => navigate("/login")}
                variant="plain"
                color="primaryColor"
                fontWeight="semibold"
                fontSize="sm"
                mx={2}
              >
                Login
              </Link>
            </Flex>
          </Flex>

          {/* Form area */}
          <Box w={{ base: "90%", md: "70%", lg: "70%" }} m="auto">
            <Box w={{ base: "90%", lg: "70%" }} m="auto" textAlign="center">
              <Heading
                as="h1"
                fontSize="4xl"
                mt={10}
                mb={3}
                color="on_backgroudColor"
                fontWeight="bold"
              >
                Let's get you started
              </Heading>
              <Text fontSize="md" fontWeight="medium" color="mediumGrey" my={5}>
                Please provide your details
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
                  onClick={() => setRegisterState(user.state)}
                  variant={registerState === user.state ? "solid" : "outline"}
                  colorScheme={
                    registerState === user.state ? "primaryColor" : "textFieldColor"
                  }
                  mx={2}
                  w="1/2"
                  outline="none"
                  border="none"
                  bg={
                    registerState === user.state ? "primaryColor" : "textFieldColor"
                  }
                >
                  {user.type}
                </Button>
              ))}
            </Flex>

            {registerState === "parent" ? <ParentSignUp /> : <StudentSignUp />}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default SignUp;