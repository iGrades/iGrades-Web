import { Box, Heading, Field, Flex, Button, Alert } from "@chakra-ui/react";
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
    if (!currentPassword || !newPassword ) {
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
    } catch (error) {
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
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} minH="75vh">
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

      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={16}
        mx={2}
      >
        Password
      </Heading>

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="center"
        align="center"
        gap={6}
        w={{ base: "100%", md: "80%", lg: "65%" }}
        m="auto"
      >
        <Field.Root width="100%">
          <Field.Label>Old Password</Field.Label>
          <PasswordInput
            value={currentPassword}
            bg="textFieldColor"
            outline="none"
            border="none"
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            _placeholder={{ fontSize: "xs" }}
          />
        </Field.Root>

        <Field.Root width="100%">
          <Field.Label>New Password</Field.Label>
          <PasswordInput
            value={newPassword}
            bg="textFieldColor"
            outline="none"
            border="none"
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            _placeholder={{ fontSize: "xs" }}
          />
        </Field.Root>
      </Flex>

      <Flex justify="center" align="center" my={10}>
        <Button
          variant="ghost"
          color="primaryColor"
          fontWeight={700}
          p={3}
          onClick={handleUpdatePassword}
          loading={isLoading}
          loadingText="Updating..."
          disabled={
            isLoading || !currentPassword || !newPassword
          }
        >
          Change Password <GiPadlock />
        </Button>
      </Flex>
    </Box>
  );
};

export default Security;
