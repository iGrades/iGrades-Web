import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Field,
  InputGroup,
  Input,
  Button,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiMail, FiLock } from "react-icons/fi";
import type { Dispatch, SetStateAction } from "react";
// import HCaptcha from "@hcaptcha/react-hcaptcha";

type Props = {
  setAlert: Dispatch<
    SetStateAction<{ type: "error" | "success"; message: string } | null>
  >;
};

const parentFormFields = [
  { name: "email", type: "email", placeholder: "Email" },
  { name: "password", type: "password", placeholder: "Password" },
];

const ParentLogin = ({ setAlert }: Props) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

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
    setIsLoading(true); // Start loading
    
    // if (!captchaToken) {
    //   setAlert({
    //     type: "error",
    //     message: "Please complete the captcha verification",
    //   });
    //   return;
    // }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      // options: {
      //    captchaToken,
      //  },
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      setIsLoading(false); // Stop loading on error
        // setCaptchaToken(null);
      return;
    }


    setIsLoading(false); // Stop loading on success
     navigate("/parent-dashboard");
  };

  const passIcons = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handlePasswordLogin}>
      <Grid
        templateColumns={'base: "repeat(1, 1fr)"'}
        gap={"5"}
        my={4}
        px={{ md: 2 }}
      >
        {parentFormFields.map((field) => (
          <Box key={field.name} className="">
            <Field.Root>
              <Field.Label
                color="#334155"
                fontSize="sm"
                fontWeight="600"
                mb={2}
              >
                {field.name === "email" ? "Email Address" : "Password"}
              </Field.Label>
            </Field.Root>
            <InputGroup
              w="full"
              startElement={
                field.name === "email" ? (
                  <FiMail size={18} color="#94A3B8" />
                ) : (
                  <FiLock size={18} color="#94A3B8" />
                )
              }
              endElement={
                field.name === "password" && (
                  <button type="button" onClick={passIcons} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {showPassword ? <IoEyeOutline size={18} color="#94A3B8" /> : <IoEyeOffOutline size={18} color="#94A3B8" />}
                  </button>
                )
              }
            >
              <Input
                name={field.name}
                type={field.name === "password" ? (showPassword ? "text" : "password") : field.type}
                placeholder={field.name === "email" ? "you@example.com" : "••••••••••••"}
                onChange={handleChange}
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
        ))}
      </Grid>
      
       {/*<Flex justify={"center"} my={10}>
      <HCaptcha
        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
        onVerify={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
      />
       </Flex>*/}

      <Flex justify="center" my={5} px={{ md: 2 }}>
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
        >
          Sign In
        </Button>
      </Flex>
    </form>
  );
};

export default ParentLogin;
