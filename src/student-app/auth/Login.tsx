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

  const encKey = (import.meta.env.ENC_KEY as string) || "";

  const handlePasscodeChange = useCallback((e: any) => {
    const val = Array.isArray(e) ? e : (e?.value || []);
    passcodeRef.current = val;
    setPasscode(val);
  }, []);

  const handleLogin = async () => {
    try {
      const rawPasscode = passcodeRef.current || passcode || [];
      const passcodeArr = Array.isArray(rawPasscode) ? rawPasscode : ((rawPasscode as any)?.value || []);
      const currentPasscode = passcodeArr.join("").trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !currentPasscode || currentPasscode.length < 6) {
        setAlert({ type: "error", message: "Please enter your email and full 6-digit passcode" });
        return;
      }

      setIsLoading(true);

      const encrypted = encrypt(currentPasscode, encKey);

      let student: any = null;

      try {
        const { data, error } = await supabase.rpc("get_student_by_credentials", {
          p_email: cleanEmail,
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

      // Fallback 1: Direct query by email + encrypted passcode
      if (!student) {
        const { data: directData, error: directError } = await supabase
          .from("students")
          .select("*")
          .ilike("email", cleanEmail)
          .eq("passcode", encrypted);

        if (!directError && directData && Array.isArray(directData) && directData.length > 0) {
          student = directData[0];
        }
      }

      // Fallback 2: Direct query by email + plain passcode
      if (!student && currentPasscode !== encrypted) {
        const { data: plainData, error: plainError } = await supabase
          .from("students")
          .select("*")
          .ilike("email", cleanEmail)
          .eq("passcode", currentPasscode);

        if (!plainError && plainData && Array.isArray(plainData) && plainData.length > 0) {
          student = plainData[0];
        }
      }

      if (!student) {
        setAlert({ type: "error", message: "Invalid email or passcode" });
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("authdParent");
      setAuthdStudent(student);
      setIsLoading(false);

      setAlert({
        type: "success",
        message: `Welcome back, ${student.firstname || "Student"}!`,
      });

      const name = student.firstname
        ? `${student.firstname} ${student.lastname || ""}`.trim().toLowerCase().replace(/\s+/g, "-")
        : "";
      const targetDashboard = name ? `/student-dashboard/${name}` : "/student-dashboard";

      setTimeout(() => navigate(targetDashboard), 800);
    } catch (err: any) {
      console.error("Student login error:", err);
      setAlert({
        type: "error",
        message: err?.message || "An unexpected error occurred during login. Please try again.",
      });
      setIsLoading(false);
    }
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
          <Flex justify="space-between" align="baseline" mb={2}>
            <Text color="#334155" fontSize="sm" fontWeight="600">
              Passkey
            </Text>
            <Text color="gray.400" fontSize="xs">
              6 digits
            </Text>
          </Flex>
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