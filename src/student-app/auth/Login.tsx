import { useState, useRef, useCallback } from "react";
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
  HStack,
} from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  setAlert: Dispatch<
    SetStateAction<{ type: "error" | "success"; message: string } | null>
  >;
};

const ChildrenLogin = ({ setAlert }: Props) => {
  const { encrypt } = usePassKey();
  const { setAuthdStudent } = useAuthdStudentData();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const passcodeRef = useRef<string[]>([]);

  const encKey = import.meta.env.VITE_ENC_KEY;

  const handlePasscodeChange = useCallback((e: any) => {
    const val = Array.isArray(e) ? e : (e?.value || []);
    passcodeRef.current = val;
    setPasscode(val);
  }, []);

  const handleLogin = async () => {
    const rawPasscode = passcodeRef.current || passcode || [];
    const passcodeArr = Array.isArray(rawPasscode) ? rawPasscode : ((rawPasscode as any)?.value || []);
    const currentPasscode = passcodeArr.join("");

    if (!email || !currentPasscode || currentPasscode.length < 6) {
      setAlert({ type: "error", message: "Please enter your email and full passcode" });
      return;
    }

    setIsLoading(true);

    const encrypted = encrypt(currentPasscode, encKey);

    let student: any = null;

    try {
      const { data, error } = await supabase.rpc("get_student_by_credentials", {
        p_email: email,
        p_enc_passcode: encrypted,
      });

      if (!error && data) {
        if (Array.isArray(data) && data.length > 0) {
          student = data[0];
        } else if (!Array.isArray(data) && typeof data === "object" && (data as any)?.id) {
          student = data;
        }
      }
    } catch (err) {
      console.warn("RPC get_student_by_credentials warning:", err);
    }

    // Direct fallback query if RPC failed or returned no match
    if (!student) {
      const { data: directData, error: directError } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .eq("passcode", encrypted);

      if (!directError && directData && Array.isArray(directData) && directData.length > 0) {
        student = directData[0];
      }
    }

    if (!student) {
      setAlert({ type: "error", message: "Invalid email or passcode" });
      setIsLoading(false);
      return;
    }

    setAuthdStudent(student);
    setIsLoading(false);

    setAlert({
      type: "success",
      message: `Welcome back, ${student.firstname || "Student"}!`,
    });

    setTimeout(() => navigate("/student-dashboard"), 1000);
  };

  return (
    <Box px={{ md: 2 }}>
      <Grid templateColumns={'base: "repeat(1, 1fr)"'} gap={"5"} my={4}>
        <Box>
          <Field.Root>
            <Field.Label
              color="#334155"
              fontSize="sm"
              fontWeight="600"
              mb={2}
            >
              Email Address
            </Field.Label>
          </Field.Root>
          <InputGroup
            w="full"
            startElement={<FiMail size={18} color="#94A3B8" />}
          >
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              h="12"
              fontSize="sm"
              px={10}
              _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>
        </Box>

        <Box w="full">
          <Text color="#334155" fontSize="sm" fontWeight="600" mb={3}>
            Passkey
          </Text>
          <HStack justify="center" gap={{ base: 2, md: 4 }} mb={6}>
            <PinInput.Root
              size="md"
              value={passcode}
              onValueChange={handlePasscodeChange}
            >
              <PinInput.HiddenInput />
              <PinInput.Control>
                {Array.from({ length: 6 }, (_, index) => (
                  <PinInput.Input
                    key={index}
                    index={index}
                    fontSize="lg"
                    fontWeight="600"
                    width={{ base: "42px", md: "55px" }}
                    height={{ base: "45px", md: "50px" }}
                    borderRadius="xl"
                    bg="gray.50"
                    color="gray.800"
                    border="1px solid"
                    borderColor="gray.200"
                    _focus={{
                      border: "1px solid",
                      borderColor: "primaryColor",
                      color: "gray.800",
                      bg: "white",
                      boxShadow: "0 0 0 1px #206CE1",
                    }}
                  />
                ))}
              </PinInput.Control>
            </PinInput.Root>
          </HStack>
        </Box>
      </Grid>
      <Flex justify="center" my={5}>
        <Button
          loading={isLoading}
          loadingText="Signing in..."
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
          onClick={handleLogin}
        >
          Sign In
        </Button>
      </Flex>
    </Box>
  );
};

export default ChildrenLogin;