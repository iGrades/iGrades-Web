import {
  PinInput,
  Box,
  Flex,
  Heading,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GiPadlock } from "react-icons/gi";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { usePassKey } from "@/parent-app/context/passkeyContext";
import { toaster } from "@/components/ui/toaster";

const Security = () => {
  const { authdStudent } = useAuthdStudentData();
  const { decrypt, encrypt } = usePassKey();
  const [passKey, setPasskey] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [currentPasskey, setCurrentPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);

  const encKey = import.meta.env.VITE_ENC_KEY;

  // fetch passkey from the student's table in the database
  const getPassKey = async () => {
    if (!authdStudent?.id) return;

    const { data: passKeyData, error } = await supabase
      .from("students")
      .select("passcode")
      .eq("id", authdStudent.id)
      .single();

    if (error || !passKeyData) {
      console.log("Student passcode not found:", error);
      toaster.create({
        title: "Error",
        description: "Failed to load passkey",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    // Decrypt the stored passcode for display
    try {
      const decryptedPassKey = decrypt(passKeyData.passcode, encKey);
      setCurrentPasskey(decryptedPassKey);
      setPasskey(decryptedPassKey.split("").slice(0, 6)); // Ensure only 6 digits
    } catch (error) {
      console.error("Error decrypting passkey:", error);
      toaster.create({
        title: "Error",
        description: "Failed to decrypt passkey",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  useEffect(() => {
    getPassKey();
  }, [authdStudent]);

  // make a POST request of new passkey to database
  const handlePassKeyChange = async () => {
    if (passKey.some((digit) => digit === "")) {
      toaster.create({
        title: "Incomplete passkey",
        description: "Please enter all 6 digits",
        type: "warning",
        duration: 3000,
        closable: true,
      });
      return;
    }

    const newPassKey = passKey.join("");

    // Check if the passkey is the same as current
    if (newPassKey === currentPasskey) {
      toaster.create({
        title: "No changes",
        description: "New passkey is the same as current",
        type: "info",
        duration: 3000,
        closable: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Encrypt the new passkey before storing
      const encryptedPassKey = encrypt(newPassKey, encKey);

      const { data: updatedPassKeyData, error } = await supabase
        .from("students")
        .update({ passcode: encryptedPassKey })
        .eq("id", authdStudent?.id)
        .select();

      if (error) {
        console.error("Error updating passkey:", error);
        toaster.create({
          title: "Error",
          description: "Failed to update passkey",
          type: "error",
          duration: 3000,
          closable: true,
        });
        return;
      }

     

      // Update the current passkey state to reflect the change
      setCurrentPasskey(newPassKey);

      toaster.create({
        title: "Success",
        description: "Passkey updated successfully",
        type: "success",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toaster.create({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error",
        duration: 3000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasskeyVisibility = () => {
    setShowPasskey(!showPasskey);
  };

  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
      {/* Header with back button */}
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        fontSize="md"
        gap={3}
        mt={3}
        mb={5}
        mx={2}
      >
        Passkey
      </Heading>

      <Flex direction="column" justify="center" align="center">
        <Flex align="center" gap={2} mb={4}>
          <PinInput.Root
            size="lg"
            value={passKey}
            onValueChange={(e) => setPasskey(e.value)}
            mask={showPasskey ? false : true}
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

          <IconButton
            variant="ghost"
            aria-label={showPasskey ? "Hide passkey" : "Show passkey"}
            onClick={togglePasskeyVisibility}
            size="sm">
              {showPasskey ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </IconButton>
        </Flex>

        <Button
          variant="ghost"
          color="primaryColor"
          fontWeight="bold"
          fontSize="xs"
          onClick={handlePassKeyChange}
          loading={loading}
          loadingText="Updating..."
        >
          <GiPadlock size={"xs"} color="#206CE1" />
          Change Passkey
        </Button>
      </Flex>
    </Box>
  );
};

export default Security;
