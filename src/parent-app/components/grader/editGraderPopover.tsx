import { useState, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Box, Button, Flex, Heading, Text, Image} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { usePassKey } from "@/parent-app/context/passkeyContext";
import EditGrader from "./editGrader";
import DeleteGraderPopover from "./deleteGraderPopover";
import AvatarComp from "@/components/avatar";

type Props = {
  student: any;
  setStudent: React.Dispatch<any>;
  onClose: () => void;
  modal: "" | "edit" | "delete";
  setModal: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>;
};

const EditGraderPopup = ({
  student,
  setStudent,
  onClose,
  modal,
  setModal,
}: Props) => {
  const [showEditBox, setShowEditBox] = useState(false);

  const { handleGeneratePassKey, decrypt } =
    usePassKey();

    const encKey = import.meta.env.VITE_ENC_KEY;

  const handleGenBtnClick = async () => {
    try {
      const { passkey, encrypted } = handleGeneratePassKey();

      const { error } = await supabase
        .from("students")
        .update({ passcode: encrypted })
        .eq("id", student.id)
        .select();

      console.log("To show to user:", passkey);
      console.log("To store in DB:", encrypted);

      if (error) {
        console.error("Error updating passcode:", error);
      }

      // Update UI
      setStudent((prev: any) => ({
        ...prev,
        passcode: encrypted,
      }));
    } catch (error) {
      console.log("Error updating passcode from catch block:", error);
    }
  };



const PassPlaceholder = useMemo(() => {
  return student?.passcode ? decrypt(student.passcode, encKey) : "";
}, [student?.passcode, encKey]);

  console.log("The passcode placeholder is:", PassPlaceholder);
  

  return (
    <>
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
          width={{ base: "100%", md: "80%", lg: "50%" }}
          maxH="90vh"
          overflowY="auto"
          bg="white"
          borderRadius="xl"
          p={{ base: "1", md: "6" }}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none", // IE and Edge
            "scrollbar-width": "none", // Firefox
          }}
        >
          {showEditBox ? (
            <EditGrader student={student} onClose={onClose} />
          ) : (
            <>
              <Flex justify="space-between" my={4}>
                <Button
                  variant="plain"
                  colorScheme="red"
                  size="sm"
                  onClick={onClose}
                >
                  <LuArrowLeft /> Back
                </Button>

                <Button
                  colorScheme="red"
                  variant="plain"
                  size="sm"
                  onClick={() => setShowEditBox(true)}
                >
                  <MdOutlineModeEditOutline /> Edit
                </Button>
              </Flex>

              <Box>
                {/* Render the student info */}
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyItems="center"
                  alignItems="center"
                  my={10}
                >
                  {student.profile_image ? (
                    <Image
                      src={
                        student.profile_image?.trim() || "/assets/manikin.png"
                      }
                      alt={student.firstname}
                      rounded="full"
                      boxSize="100px"
                      fit="cover"
                    />
                  ) : (
                    <AvatarComp
                      username={`${student.firstname ?? ""} ${
                        student.lastname ?? ""
                      }`}
                      profileImage={student.profile_image}
                    />
                  )}

                  <Heading as="h1">
                    {student.firstname} {student.lastname}
                  </Heading>

                  <Text fontSize="xs">Student</Text>
                </Box>

                <Box
                  bg="textFieldColor"
                  w="90%"
                  m="auto"
                  p={3}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                >
                  <Text
                    fontSize="xs"
                    fontWeight={"semibold"}
                    color="fieldTextColor"
                  >
                    School
                  </Text>
                  <Text fontSize="xs" fontWeight="500">
                    {student.school}
                  </Text>
                </Box>
                <Box
                  bg="textFieldColor"
                  w="90%"
                  m="auto"
                  p={3}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                >
                  <Text
                    fontSize="xs"
                    fontWeight={"semibold"}
                    color="fieldTextColor"
                  >
                    Class
                  </Text>
                  <Text fontSize="xs" fontWeight="500">
                    {student.class}
                  </Text>
                </Box>
                <Box
                  bg="textFieldColor"
                  w="90%"
                  m="auto"
                  p={3}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                >
                  <Text
                    fontSize="xs"
                    fontWeight={"semibold"}
                    color="fieldTextColor"
                  >
                    Email
                  </Text>
                  <Text fontSize="xs" fontWeight="500">
                    {student.email}
                  </Text>
                </Box>

                <Box
                  bg="textFieldColor"
                  w="90%"
                  m="auto"
                  p={3}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                >
                  <Text
                    fontSize="xs"
                    fontWeight={"semibold"}
                    color="fieldTextColor"
                  >
                    Passcode
                  </Text>
                  <Text fontSize="xs" fontWeight="500">
                    {PassPlaceholder}
                  </Text>
                  {!student?.passcode && (
                    <Button
                      bg="primaryColor"
                      variant="outline"
                      onClick={handleGenBtnClick}
                      color="white"
                      my={2}
                    >
                      Generate Passcode
                    </Button>
                  )}
                  {/* </Group> */}
                </Box>
              </Box>

              <Box my={10}>
                <Flex
                  justify="space-between"
                  align="center"
                  bg="textFieldColor"
                  w="90%"
                  m="auto"
                  p={5}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                  cursor="pointer"
                >
                  <Box
                    display="flex"
                    justifyItems="space-around"
                    alignItems="center"
                    gap="3"
                  >
                    <GiNotebook style={{ color: "blue", fontSize: "1.3rem" }} />
                    <Text fontSize="xs"> Quiz Report</Text>
                  </Box>
                  <MdOutlineKeyboardArrowRight />
                </Flex>

                <Flex
                  justify="space-between"
                  align="center"
                  bg="red.50"
                  w="90%"
                  m="auto"
                  p={5}
                  rounded="lg"
                  shadow="xs"
                  my={2}
                  cursor="pointer"
                  onClick={() => setModal && setModal("delete")}
                >
                  <Box
                    display="flex"
                    justifyItems="space-around"
                    alignItems="center"
                    gap="3"
                  >
                    <MdDelete style={{ color: "red", fontSize: "1.3rem" }} />
                    <Text fontSize="xs"> Delete Child</Text>
                  </Box>
                  <MdOutlineKeyboardArrowRight />
                </Flex>
              </Box>
            </>
          )}
        </Box>
      </Box>
      {modal === "delete" && student && setModal ? (
        <DeleteGraderPopover
          student={student}
          setStudent={setStudent}
          modal={modal}
          setModal={setModal}
          onClose={() => {
            setModal("");
            setStudent(null);
          }}
        />
      ) : null}
    </>
  );
};

export default EditGraderPopup;
