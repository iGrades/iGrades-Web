import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button, Flex, Alert, Box } from "@chakra-ui/react";
type Props = {};

const LogoutBtn = (props: Props) => {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    let { error } = await supabase.auth.signOut();

    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
    }
    navigate("/login");
    setAlert({ type: "success", message: "Logged out successfully!" });
  };

  return (
    <Box>
      <Flex justify={"center"}>
        <Button onClick={handleLogout}>Log out</Button>
      </Flex>
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
  );
};

export default LogoutBtn;
