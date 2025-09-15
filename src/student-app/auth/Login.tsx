import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { usePassKey } from "@/parent-app/context/passkeyContext";
import { useAuthdStudentData } from "../context/studentDataContext";
import {
  Box,
  Field,
  InputGroup,
  Input,
  Button,
  Flex,
  Text,
  PinInput,
  Grid,
} from "@chakra-ui/react";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setAlert: Dispatch<
    SetStateAction<{ type: "error" | "success"; message: string } | null>
  >;
};

const ChildrenLogin = ({ setAlert }: Props) => {
  const { encrypt } = usePassKey();
  const {  setAuthdStudent } = useAuthdStudentData();
  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const encKey = import.meta.env.VITE_ENC_KEY;

   const handleLogin = async () => {
     setIsLoading(true);
     const encrypted = encrypt(passcode.join(""), encKey);
     

     const { data, error } = await supabase.rpc("get_student_by_credentials", {
       p_email: email,
       p_enc_passcode: encrypted,
     });

     if (error || !data || data.length === 0) {
      console.error("Login error:", error);
      
       setAlert({ type: "error", message: "Invalid email or passcode" });
       setIsLoading(false);
       return;
     }

     const student = data[0];
     setAuthdStudent(student);
     setIsLoading(false);

     setAlert({
       type: "success",
       message: `Welcome back, ${student.firstname}!`,
     });

     setTimeout(() => navigate("/student-dashboard"), 2000);
   };

  return (
    <Box className="">
      <Grid templateColumns={'base: "repeat(1, 1fr)"'} gap={"6"} my={5}>
        <Field.Root>
          <Field.Label
            color={"greyOthers"}
            fontSize={"sm"}
            fontWeight={"medium"}
            my={2}
          >
            Email
          </Field.Label>
        </Field.Root>
        <InputGroup>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
            bg={"textFieldColor"}
            outline={"primaryColor"}
            border={"none"}
            css={{ "--focus-color": "primaryColor" }}
            _placeholder={{ color: "fieldTextColor" }}
          />
        </InputGroup>

        <Box w="full">
          <Text my={2} color="greyOthers" fontSize={"sm"} fontWeight={"medium"}>
            Passkey
          </Text>
          <PinInput.Root
            size="xl"
            value={passcode}
            onValueChange={(e) => setPasscode(e.value)}
            gap={10}
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
        </Box>
      </Grid>
      <Flex justify={"center"} my={10}>
        <Button
          loading={isLoading}
          loadingText="Logging in..."
          spinnerPlacement="start"
          type="submit"
          fontWeight="semibold"
          w={{ base: "100%", lg: "100%" }}
          p={6}
          bg="blue.500"
          color="white"
          borderRadius="xl"
          onClick={handleLogin}
        >
          Login
        </Button>
      </Flex>
    </Box>
  );
};

export default ChildrenLogin;
