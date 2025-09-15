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
import type { Dispatch, SetStateAction } from "react";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      setIsLoading(false); // Stop loading on error
      return;
    }

    setIsLoading(false); // Stop loading on success
    navigate("/");
  };

  const passIcons = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handlePasswordLogin}>
      <Grid templateColumns={'base: "repeat(1, 1fr)"'} gap={"6"} my={5}>
        {parentFormFields.map((field) => (
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
                    {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
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
        ))}
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
        >
          Login
        </Button>
      </Flex>
    </form>
  );
};

export default ParentLogin;
