import { useState, useMemo } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Box, Button, Flex, Heading, Text, VStack, HStack, Icon } from "@chakra-ui/react"
import { LuArrowLeft } from "react-icons/lu"
import { MdOutlineModeEditOutline, MdDelete, MdOutlineKeyboardArrowRight } from "react-icons/md"
import { GiNotebook } from "react-icons/gi"
import { usePassKey } from "@/parent-app/context/passkeyContext"
import EditGrader from "./editGrader"
import DeleteGraderPopover from "./deleteGraderPopover"
import AvatarComp from "@/components/avatar"
import QuizHistoryList from "./quizHistoryList"

type Props = {
  student: any
  setStudent: React.Dispatch<any>
  onClose: () => void
  showEditBtn?: boolean
  showDeleteBtn?: boolean
  modal?: "" | "edit" | "delete"
  setModal?: React.Dispatch<React.SetStateAction<"" | "edit" | "delete">>
}

const EditGraderPopup = ({ student, setStudent, onClose, showEditBtn, showDeleteBtn, modal, setModal }: Props) => {
  const [showEditBox, setShowEditBox] = useState(false)
  const [view, setView] = useState<"info" | "history">("info")
  const { handleGeneratePassKey, decrypt } = usePassKey()
  const encKey = import.meta.env.VITE_ENC_KEY

  const isHistory = view === "history";

  const handleGenBtnClick = async () => {
    try {
      const { encrypted } = handleGeneratePassKey()
      await supabase.from("students").update({ passcode: encrypted }).eq("id", student.id)
      setStudent((prev: any) => ({ ...prev, passcode: encrypted }))
    } catch (error) {
      console.error(error)
    }
  }

  const PassPlaceholder = useMemo(() => {
    return student?.passcode ? decrypt(student.passcode, encKey) : ""
  }, [student?.passcode, encKey])

  return (
    <>
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        w="100vw" 
        h="100vh" 
        bg="rgba(0, 0, 0, 0.7)" 
        zIndex={1000} 
        display="flex" 
        justifyContent="center" 
        alignItems={{ base: "flex-end", md: "center" }} // Slide up from bottom on mobile
        p={{ base: 0, md: 4 }}
      >
        <Box 
          position="relative" 
          width={isHistory ? { base: "100%", lg: "95%" } : { base: "100%", md: "80%", lg: "45%" }} 
          height={isHistory ? { base: "100%", md: "95vh" } : "auto"}
          maxH={{ base: "100%", md: "95vh" }} 
          overflowY="auto" 
          css={{
             "&::-webkit-scrollbar": {
               display: "none",
             },
             scrollbarWidth: "none",
           }}
          bg="white" 
          borderRadius={{ base: "2xl 2xl 0 0", md: "2xl" }} 
          p={{ base: 4, md: 8 }}
          pb={{ base: "100px", md: 8 }} 
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          {view === "info" ? (
            <>
              {showEditBox ? (
                <EditGrader student={student} onClose={() => setShowEditBox(false)} />
              ) : (
                <VStack align="stretch" gap={6}>
                  <Flex justify="space-between" align="center">
                    <Button variant="ghost" size="sm" onClick={onClose} px={2}> 
                      <LuArrowLeft /> Back
                    </Button>
                    {showEditBtn && (
                      <Button variant="subtle" size="xs" colorScheme="blue" borderRadius="full" onClick={() => setShowEditBox(true)} > 
                        <MdOutlineModeEditOutline /> Edit
                      </Button>
                    )}
                  </Flex>

                  <VStack my={2}>
                    <AvatarComp username={`${student.firstname} ${student.lastname}`} profileImage={student.profile_image} />
                    <Heading size="md" mt={2}>{student.firstname} {student.lastname}</Heading>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                      Student Profile
                    </Text>
                  </VStack>

                  <VStack gap={3} align="stretch" w="full">
                    {[
                      { label: "School", value: student.school },
                      { label: "Class", value: student.class },
                      { label: "Email", value: student.email },
                      { label: "Passcode", value: PassPlaceholder },
                    ].map((item) => (
                      <Box key={item.label} bg="gray.50" p={4} rounded="xl" border="1px solid" borderColor="gray.100">
                        <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase">{item.label}</Text>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" fontWeight="600" color="gray.700">{item.value || "Not Set"}</Text>
                          {item.label === "Passcode" && !student.passcode && (
                            <Button size="xs" h="24px" colorScheme="blue" onClick={handleGenBtnClick}>Generate</Button>
                          )}
                        </Flex>
                      </Box>
                    ))}
                  </VStack>

                  <VStack gap={3} w="full" mt={2}>
                    <Flex 
                      w="full" 
                      p={4} 
                      bg="blue.50" 
                      rounded="xl" 
                      justify="space-between" 
                      align="center" 
                      cursor="pointer" 
                      _active={{ bg: "blue.100" }} 
                      onClick={() => setView("history")}
                    >
                      <HStack gap={3}>
                        <Icon as={GiNotebook} boxSize="20px" color="blue.600" />
                        <Text fontSize="sm" fontWeight="bold" color="blue.900">Quiz Report</Text>
                      </HStack>
                      <Icon as={MdOutlineKeyboardArrowRight} boxSize="20px" color="blue.600" />
                    </Flex>

                    {showDeleteBtn && (
                      <Flex 
                        w="full" 
                        p={4} 
                        bg="red.50" 
                        rounded="xl" 
                        justify="space-between" 
                        align="center" 
                        cursor="pointer" 
                        _active={{ bg: "red.100" }} 
                        onClick={() => setModal?.("delete")}
                      >
                        <HStack gap={3}>
                          <Icon as={MdDelete} boxSize="20px" color="red.600" />
                          <Text fontSize="sm" fontWeight="bold" color="red.600">Delete Child Account</Text>
                        </HStack>
                        <Icon as={MdOutlineKeyboardArrowRight} boxSize="20px" color="red.200" />
                      </Flex>
                    )}
                  </VStack>
                </VStack>
              )}
            </>
          ) : (
            /* HISTORY VIEW */
            <VStack align="stretch" gap={6}>
               <Box 
                 position="sticky" 
                 top="-4" // Tightened for mobile scroll
                 bg="white" 
                 pt={2} 
                 pb={4} 
                 zIndex={20} 
                 borderBottom="1px solid" 
                 borderColor="gray.100"
               >
                <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
                  <HStack w={{ base: "full", sm: "auto" }} justify="space-between">
                    <Button variant="ghost" size="sm" onClick={() => setView("info")} px={1}> 
                      <LuArrowLeft /> <Text display={{ base: "none", md: "inline" }}>Back to Profile</Text>
                    </Button>
                    <Heading size="md" fontSize={{ base: "md", md: "lg" }}>Academic Dashboard</Heading>
                  </HStack>
                  <Button variant="outline" size="sm" w={{ base: "full", sm: "auto" }} onClick={onClose}>Close Report</Button>
                </Flex>
              </Box>
              <QuizHistoryList studentId={student.id} />
            </VStack>
          )}
        </Box>
      </Box>

      {modal === "delete" && student && setModal && (
        <DeleteGraderPopover 
          student={student} 
          setStudent={setStudent} 
          modal={modal} 
          setModal={setModal} 
          onClose={() => setModal("")} 
        />
      )}
    </>
  )
}

export default EditGraderPopup;