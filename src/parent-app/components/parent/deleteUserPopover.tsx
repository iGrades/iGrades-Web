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
  VStack,
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


  if (!showDeleteConfirm) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={6000} 
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: 4, md: 6 }}
    >
      <Box
        position="relative"
        width={{ base: "100%", sm: "85%", md: "70%", lg: "35%" }}
        maxH="90vh"
        overflowY="auto"
        bg="white"
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 6, md: 10 }}
      >
        {/* Warning Content */}
        <VStack gap={4} textAlign="center">
          <Icon
            bg="red.50"
            boxSize={{ base: "60px", md: "70px" }}
            color="red.500"
            rounded="full"
            p={4}
          >
            <MdErrorOutline size="100%" />
          </Icon>
          
          <Heading 
            as="h1" 
            fontSize={{ base: "xl", md: "2xl" }} 
            color="red.600" 
          >
            Delete Account?
          </Heading>
          
          <Text
            fontSize={{ base: "sm", md: "xs" }}
            color="gray.600"
            maxW="90%"
            lineHeight="tall"
          >
            This will permanently delete your account and all associated data.
            <strong> This action cannot be undone.</strong>
          </Text>
        </VStack>

        {/* Action Buttons */}
        <VStack gap={3} mt={8} w="full">
          <Button
            bg="red.500" 
            borderRadius="3xl"
            h="55px"
            w="full"
            fontSize="sm"
            fontWeight="bold"
            _hover={{ bg: "red.600" }}
            _active={{ transform: "scale(0.98)" }}
            onClick={deleteUser}
            loading={isDeleting}
            loadingText="Deleting Account..."
          >
            Yes, delete permanently
          </Button>

          <Button
            variant="outline"
            color="gray.600"
            borderColor="gray.300"
            borderRadius="3xl"
            h="55px"
            w="full"
            fontSize="sm"
            fontWeight="medium"
            _active={{ transform: "scale(0.98)" }}
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </VStack>

        {alert && (
          <Alert.Root status={alert.type} variant="subtle" mt={6} borderRadius="lg">
            <Alert.Indicator />
            <Alert.Content fontSize="xs">
              <Alert.Title>
                {alert.type === "error" ? "Error" : "Success"}
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