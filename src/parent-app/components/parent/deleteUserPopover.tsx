import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useUser } from "../../context/parentDataContext";
import {
  Box,
  Heading,
  Icon,
  Button,
  Text,
  Alert,
} from "@chakra-ui/react";
import { MdErrorOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  alert: { type: "success" | "error"; message: string } | null;
  setAlert: Dispatch<
    SetStateAction<{ type: "success" | "error"; message: string } | null>
  >;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: Dispatch<React.SetStateAction<boolean>>;
};

const DeleteUserPopover = ({
  alert,
  setAlert,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: Props) => {
  const { parent } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const deleteUser = async () => {
    if (!parent[0]?.id) return;

    setIsDeleting(true);
    try {
      // Delete profile image if exists
      if (parent[0].profile_image) {
        const publicUrl = parent[0].profile_image;
        const parts = publicUrl.split("/");
        const bucketIndex = parts.findIndex(
          (part: string) => part === "profile-photos"
        );

        if (bucketIndex > -1) {
          const filePath = parts.slice(bucketIndex + 1).join("/");
          const { error: storageError } = await supabase.storage
            .from("profile-photos")
            .remove([filePath]);

          if (storageError) throw storageError;
        }
      }

      // Delete user record
      const { error } = await supabase
        .from("parents")
        .delete()
        .eq("id", parent[0].id);

      if (error) throw error;

      // Sign out the user
      const { error: signOutError } =
        await supabase.auth.admin.deleteUser(parent[0].user_id);
      if (signOutError) throw signOutError;

      setAlert({ type: "success", message: "Account deleted successfully" });
      navigate("/login");
    } catch (error) {
      console.error("Delete error:", error);
      setAlert({ type: "error", message: "Failed to delete account" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!showDeleteConfirm) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex={1000}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: "2", md: "4" }}
    >
      <Box
        position="relative"
        width={{ base: "95%", md: "70%", lg: "40%" }}
        maxH="90vh"
        overflowY="auto"
        bg="white"
        borderRadius="2xl"
        boxShadow="lg"
        p={{ base: "5", md: "10" }}
      >
        {/* Warning Content */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
          alignItems="center"
        >
          <Icon
            bg="red.100"
            boxSize="70px"
            color="red.400"
            rounded="full"
            mb={5}
          >
            <MdErrorOutline />
          </Icon>
          <Heading as="h1" fontSize="2xl" color="backgroundColor2" my={2}>
            Delete Account Request
          </Heading>
          <Text
            fontSize="xs"
            color="on_containerColor"
            textAlign="center"
            w={{ base: "100%", md: "80%" }}
            mb="2"
          >
            This will permanently delete your account and all associated data.
            This action cannot be undone.
          </Text>
        </Box>

        {/* Buttons */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space between"
          alignItems="center"
          w={{ base: "100%", md: "90%" }}
          m="auto"
          my={5}
          gap={4}
        >
          <Button
            bg="white"
            color="primaryColor"
            borderColor="primaryColor"
            borderRadius="3xl"
            outline="none"
            p={6}
            w={"100%"}
            fontSize={"sm"}
            fontWeight={500}
            _hover={{ bg: "primaryColor", color: "white" }}
            onClick={deleteUser}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            Yes, delete permanently
          </Button>

          <Button
            bg="white"
            color="blue.600"
            borderColor="blue.600"
            borderRadius="3xl"
            outline="none"
            p={6}
            w={"100%"}
            fontSize={"sm"}
            fontWeight={500}
            _hover={{ bg: "primaryColor", color: "white" }}
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </Box>

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
  );
};

export default DeleteUserPopover;
