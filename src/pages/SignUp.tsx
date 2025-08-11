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
import sideImage from "../assets/undraw_sign-up_qamz-removebg-preview.png";
import ParentSignUp from "@/parent-app/auth/SignUp";
import StudentSignUp from "@/student-app/auth/SignUp";

type Props = {}

const SignUp = (props: Props) => {
      const navigate = useNavigate();
      const [alert, setAlert] = useState<{
        type: "success" | "error";
        message: string;
      } | null>(null);
    
      const [registerState, setRegisterState] = useState("parent"); // "parent" or "children"

        const userType = [
          { type: "iGrade Parent", state: "parent" },
          { type: "iGrade Student", state: "children" },
        ];

        const handleUserTypeChange = (type: string) => {
          setRegisterState(type);
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
        w={{ base: "full", lg: "45%" }}
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
              Already have an account?
            </Text>
            <Link
              onClick={() => navigate("/login")}
              variant={"plain"}
              color={"primaryColor"}
              fontWeight={"semibold"}
              fontSize={"sm"}
              mx={2}
            >
              Login
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
              Let's get you started
            </Heading>
            <Text
              fontSize={"md"}
              fontWeight={"medium"}
              color={"mediumGrey"}
              my={5}
            >
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
                onClick={() => handleUserTypeChange(user.state)}
                variant={registerState === user.state ? "solid" : "outline"}
                colorScheme={
                  registerState === user.state
                    ? "primaryColor"
                    : "textFieldColor"
                }
                mx={2}
                w="1/2"
                outline="none"
                border="none"
                bg={
                  registerState === user.state
                    ? "primaryColor"
                    : "textFieldColor"
                }
              >
                {user.type}
              </Button>
            ))}
          </Flex>

          {registerState === "parent" ? <ParentSignUp /> : <StudentSignUp />}

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

export default SignUp