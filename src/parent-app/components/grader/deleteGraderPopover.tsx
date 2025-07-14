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
  modal,
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
        {/* Warning/Confirm Content */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-around"
          alignItems="center"
        >
          {deleteStep === "warning" && (
            <>
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
                Delete Student Request
              </Heading>
              <Text
                fontSize="xs"
                color="on_containerColor"
                textAlign="center"
                w={{ base: "100%", md: "80%" }}
                mb="2"
              >
                By removing the child all classes are going to be cancelled and
                fees for uncompleted classes are non-refundable.
              </Text>
            </>
          )}

          {deleteStep === "confirm" && (
            <>
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
                Confirm Deletion
              </Heading>
              <Text
                fontSize="xs"
                color="on_containerColor"
                textAlign="center"
                w={{ base: "100%", md: "80%" }}
                mb="2"
              >
                Are you sure you want to permanently delete {student?.firstname}
                's account? This action cannot be undone.
              </Text>
            </>
          )}

          {deleteStep === "deleting" && (
            <>
              <Icon
                bg="blue.100"
                boxSize="70px"
                color="blue.400"
                rounded="full"
                mb={5}
              >
                <MdErrorOutline />
              </Icon>
              <Heading as="h1" fontSize="2xl" color="backgroundColor2" my={2}>
                Deleting Student...
              </Heading>
            </>
          )}

          {deleteStep === "success" && (
            <>
              <Icon
                bg="green.100"
                boxSize="70px"
                color="green.400"
                rounded="full"
                mb={5}
              >
                <MdErrorOutline />
              </Icon>
              <Heading as="h1" fontSize="2xl" color="backgroundColor2" my={2}>
                Deleted Successfully!
              </Heading>
            </>
          )}
        </Box>

        {/* Buttons - changes based on step */}
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
          {(deleteStep === "warning" || deleteStep === "confirm") && (
            <>
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
                onClick={() =>
                  deleteStep === "warning"
                    ? setDeleteStep("confirm")
                    : handleDelete()
                }
              >
                {deleteStep === "warning"
                  ? "Yes, Delete"
                  : "Yes, Delete Permanently"}
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
                onClick={() =>
                  deleteStep === "confirm"
                    ? setDeleteStep("warning")
                    : onClose()
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
              p={6}
              w={"100%"}
              fontSize={"sm"}
              fontWeight={500}
              _hover={{ opacity: 0.8 }}
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </Box>

        {/* Alert messages */}
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

export default DeleteGraderPopover;
