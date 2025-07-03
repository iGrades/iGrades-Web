import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Icon, Heading, Text, Button } from "@chakra-ui/react";
import { MdErrorOutline } from "react-icons/md";

type Props = {
  student: any;
  setStudent: React.Dispatch<any>;
  modal: "" | "edit" | "delete" | "undefined";
  setModal: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>;
  onClose: () => void;
};

const DeleteGraderPopover = ({
  student,
  setStudent,
  modal,
  setModal,
  onClose,
}: Props) => {
  
  // delete function

  const tryDelete = async () => {
    if (modal === "delete" && student) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${student.firstname}?`
      );
      if (!confirmDelete) {
        setModal("");
        setStudent(null);
        return;
      }

      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id);

      if (error) {
        console.error("Delete failed:", error.message);
        alert("Failed to delete student.");
      } else {
        alert("Student deleted successfully.");
        setModal("");
        setStudent(null);
      }
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
        width={{ base: "95%", md: "80%", lg: "50%" }}
        maxH="90vh"
        overflowY="auto"
        bg="white"
        borderRadius="2xl"
        boxShadow="lg"
        p={{base: '5', md: '10'}}
      >
        {/* warning texts */}
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
            Delete Student Request
          </Heading>
          <Text
            fontSize="xs"
            color="on_containerColor"
            textAlign="center"
            w={{base: '100%', md:'80%'}}
            mb="2"
          >
            By removing the child all classes are going to be cancelled and fees
            for uncompleted classes are non-refundable.
          </Text>
        </Box>

        {/* Buttons */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space between"
          alignItems="center"
          w={{base: '100%', md:'90%'}}
          m="auto"
          my={5}
          gap={4}
        >
          {/* Delete button */}
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
            onClick={tryDelete}
          >
            Yes, delete
          </Button>

          {/* Cancel button */}
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
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DeleteGraderPopover;
