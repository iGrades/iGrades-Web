import { Box, Heading, Field, Flex, Button, Alert, VStack } from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";
import { GiPadlock } from "react-icons/gi";
import { PasswordInput } from "../../../components/ui/password-input";
import { useState } from "react";

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const clearAlert = () => {
    setTimeout(() => setAlert(null), 5000);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setAlert({
        type: "error",
        message: "Please fill in all password fields",
      });
      clearAlert();
      return;
    }

    if (newPassword.length < 6) {
      setAlert({
        type: "error",
        message: "New password must be at least 6 characters long",
      });
      clearAlert();
      return;
    }

    if (newPassword === currentPassword) {
      setAlert({
        type: "error",
        message: "New password must be different from current password",
      });
      clearAlert();
      return;
    }

    setIsLoading(true);

    try {
      // First, reauthenticate the user with their current password
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setAlert({
          type: "error",
          message: "Old password is incorrect",
        });
        return;
      }

      // If reauthentication succeeds, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setAlert({
          type: "error",
          message: updateError.message || "Password update failed",
        });
      } else {
        setAlert({
          type: "success",
          message: "Password updated successfully!",
        });
        // Clear all fields
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setAlert({
        type: "error",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
      clearAlert();
    }
  };

  return (
    <Box 
      bg="white" 
      rounded="2xl" 
      shadow="sm" 
      p={{ base: 4, md: 8 }} 
      mb={{ base: "100px", lg: 10 }} 
      h="auto"
    >
      {/* Alert Positioned to not disrupt layout flow */}
      {alert && (
        <Alert.Root status={alert.type} variant="subtle" mb={6} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Content fontSize="xs">
            <Alert.Title>
              {alert.type === "error" ? "Error" : "Success"}
            </Alert.Title>
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={2}
        mb={{ base: 8, md: 16 }}
        fontSize={{ base: "lg", md: "xl" }}
      >
        Change Password
      </Heading>

      <VStack
        gap={6}
        w={{ base: "100%", md: "80%", lg: "60%" }}
        m="auto"
        align="stretch"
      >
        <Field.Root width="100%">
          <Field.Label fontSize="xs" fontWeight="bold" mb={2}>Current Password</Field.Label>
          <PasswordInput
            value={currentPassword}
            bg="textFieldColor"
            h="50px" 
            borderRadius="lg"
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            _placeholder={{ fontSize: "xs" }}
          />
        </Field.Root>

        <Field.Root width="100%">
          <Field.Label fontSize="xs" fontWeight="bold" mb={2}>New Password</Field.Label>
          <PasswordInput
            value={newPassword}
            bg="textFieldColor"
            h="50px" 
            borderRadius="lg"
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            _placeholder={{ fontSize: "xs" }}
          />
        </Field.Root>

        <Flex justify="center" align="center" mt={6}>
          <Button
            variant="solid" 
            bg="primaryColor"
            color="white"
            w={{ base: "full", md: "auto" }}
            h="50px"
            px={8}
            borderRadius="3xl"
            fontWeight="bold"
            onClick={handleUpdatePassword}
            loading={isLoading}
            loadingText="Updating..."
            _active={{ transform: "scale(0.98)" }}
            disabled={isLoading || !currentPassword || !newPassword}
          >
            Update Password <GiPadlock style={{ marginLeft: "8px" }} />
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default Security;
