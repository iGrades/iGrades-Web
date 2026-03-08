import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Icon, Heading, Text, Button, Alert } from "@chakra-ui/react";
import { MdErrorOutline } from "react-icons/md";
import { useStudentsData } from "../../context/studentsDataContext";

type Props = {
  student: any;
  setStudent: React.Dispatch<any>;
  modal: "" | "edit" | "delete" | "undefined";
  setModal: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>;
  onClose: () => void;
};

type DeleteStep = "warning" | "confirm" | "deleting" | "success";

const DeleteGraderPopover = ({
  student,
  setStudent,
  setModal,
  onClose,
}: Props) => {
  const { getGraderDetails } = useStudentsData();
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("warning");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

    const handleDelete = async () => {
      setDeleteStep("deleting");
  
      try {
        // Extract file path from public URL
        const publicUrl = student.profile_image;
        let filePath = "";
        if (publicUrl) {
          const parts = publicUrl.split("/");
          const bucketNameIndex = parts.findIndex(
            (p: string) => p === "profile-photos"
          );
          filePath = parts.slice(bucketNameIndex + 1).join("/");
        }
  
        // Delete image if exists
        if (filePath) {
          const { error: imageError } = await supabase.storage
            .from("profile-photos")
            .remove([filePath]);
          if (imageError) throw imageError;
        }
  
        // Delete student record
        const { error: dbError } = await supabase
          .from("students")
          .delete()
          .eq("id", student.id);
        if (dbError) throw dbError;
  
        // Success
        setDeleteStep("success");
        getGraderDetails();
        setTimeout(() => {
          setModal("");
          setStudent(null);
          onClose();
        }, 1500);
      } catch (error: any) {
        setDeleteStep("warning");
        setAlert({
          type: "error",
          message: error.message || "Failed to delete student",
        });
      }
    };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={4000} 
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: 4, md: 6 }}
    >
      <Box
        position="relative"
        width={{ base: "100%", sm: "85%", md: "60%", lg: "35%" }}
        maxH="90vh"
        bg="white"
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 6, md: 10 }}
        overflowY="auto"
      >
        {/* Content Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Icon
            bg={deleteStep === "success" ? "green.100" : deleteStep === "deleting" ? "blue.100" : "red.100"}
            boxSize={{ base: "60px", md: "70px" }}
            color={deleteStep === "success" ? "green.500" : deleteStep === "deleting" ? "blue.500" : "red.500"}
            rounded="full"
            mb={5}
            p={4}
          >
            <MdErrorOutline size="100%" />
          </Icon>

          <Heading 
            as="h1" 
            fontSize={{ base: "xl", md: "2xl" }} 
            color="backgroundColor2" 
            mb={3}
          >
            {deleteStep === "warning" && "Delete Student Request"}
            {deleteStep === "confirm" && "Confirm Deletion"}
            {deleteStep === "deleting" && "Deleting Student..."}
            {deleteStep === "success" && "Deleted Successfully!"}
          </Heading>

          {(deleteStep === "warning" || deleteStep === "confirm") && (
            <Text
              fontSize={{ base: "sm", md: "xs" }}
              color="on_containerColor"
              maxW="90%"
              mb={6}
            >
              {deleteStep === "warning" 
                ? "By removing the child, all classes will be cancelled and fees for uncompleted classes are non-refundable."
                : `Are you sure you want to permanently delete ${student?.firstname}'s account? This action cannot be undone.`
              }
            </Text>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          w="full"
          mt={2}
        >
          {(deleteStep === "warning" || deleteStep === "confirm") && (
            <>
              <Button
                bg="red.500"
                color="white"
                borderRadius="3xl"
                h="50px"
                w="full"
                fontSize="sm"
                fontWeight="bold"
                _hover={{ bg: "red.600" }}
                _active={{ transform: "scale(0.97)" }}
                onClick={() =>
                  deleteStep === "warning"
                    ? setDeleteStep("confirm")
                    : handleDelete()
                }
              >
                {deleteStep === "warning" ? "Yes, Delete" : "Yes, Delete Permanently"}
              </Button>

              <Button
                variant="outline"
                color="gray.600"
                borderColor="gray.300"
                borderRadius="3xl"
                h="50px"
                w="full"
                fontSize="sm"
                fontWeight="medium"
                _active={{ transform: "scale(0.97)" }}
                onClick={() =>
                  deleteStep === "confirm" ? setDeleteStep("warning") : onClose()
                }
              >
                Cancel
              </Button>
            </>
          )}

          {deleteStep === "success" && (
            <Button
              bg="primaryColor"
              color="white"
              borderRadius="3xl"
              h="50px"
              w="full"
              fontSize="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </Box>

        {/* Alerts */}
        {alert && (
          <Alert.Root status={alert.type} variant="subtle" mt={6} borderRadius="lg">
            <Alert.Indicator />
            <Alert.Content fontSize="xs">
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </Box>
    </Box>
  );
};

export default DeleteGraderPopover;