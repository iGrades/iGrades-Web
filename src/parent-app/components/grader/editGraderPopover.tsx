"use client"

import { useState, useMemo } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Box, Button, Flex, Heading, Text, VStack, HStack, Icon, Separator } from "@chakra-ui/react"
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
      <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0, 0, 0, 0.6)" zIndex={1000} display="flex" justifyContent="center" alignItems="center" p={4}>
        <Box 
          position="relative" 
          // Dynamic width and height for "Full Page Popup" feel
          width={isHistory ? { base: "98%", lg: "95%" } : { base: "100%", md: "80%", lg: "50%" }} 
          height={isHistory ? "95vh" : "auto"}
          maxH="95vh" 
          overflowY="auto" 
          bg="white" 
          borderRadius="2xl" 
          p={isHistory ? { base: 4, md: 8 } : { base: 4, md: 6 }}
          transition="all 0.3s ease-in-out"
        >
          
          {view === "info" ? (
            <>
              {showEditBox ? (
                <EditGrader student={student} onClose={() => setShowEditBox(false)} />
              ) : (
                <VStack align="stretch" gap={6}>
                  <Flex justify="space-between">
                    <Button variant="ghost" size="sm" onClick={onClose}> <LuArrowLeft /> Back</Button>
                    {showEditBtn && (
                      <Button variant="ghost" size="sm" onClick={() => setShowEditBox(true)} > <MdOutlineModeEditOutline /> Edit</Button>
                    )}
                  </Flex>

                  <VStack my={4}>
                    <AvatarComp username={`${student.firstname} ${student.lastname}`} profileImage={student.profile_image} />
                    <Heading size="md">{student.firstname} {student.lastname}</Heading>
                    <Text fontSize="xs" color="gray.500">Student Profile</Text>
                  </VStack>

                  <VStack gap={3} align="stretch" w="90%" m="auto">
                    {[
                      { label: "School", value: student.school },
                      { label: "Class", value: student.class },
                      { label: "Email", value: student.email },
                      { label: "Passcode", value: PassPlaceholder },
                    ].map((item) => (
                      <Box key={item.label} bg="gray.50" p={3} rounded="lg">
                        <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">{item.label}</Text>
                        <Text fontSize="xs" fontWeight="600">{item.value || "Not Set"}</Text>
                        {item.label === "Passcode" && !student.passcode && (
                          <Button size="xs" mt={2} colorScheme="blue" onClick={handleGenBtnClick}>Generate</Button>
                        )}
                      </Box>
                    ))}
                  </VStack>

                  <VStack gap={3} w="90%" m="auto" mt={4}>
                    <Flex w="full" p={4} bg="blue.50" rounded="xl" justify="space-between" align="center" cursor="pointer" onClick={() => setView("history")}>
                      <HStack gap={3}>
                        <Icon as={GiNotebook} color="blue.600" />
                        <Text fontSize="xs" fontWeight="bold">Quiz Report</Text>
                      </HStack>
                      <Icon as={MdOutlineKeyboardArrowRight} />
                    </Flex>

                    {showDeleteBtn && (
                      <Flex w="full" p={4} bg="red.50" rounded="xl" justify="space-between" align="center" cursor="pointer" onClick={() => setModal?.("delete")}>
                        <HStack gap={3}>
                          <Icon as={MdDelete} color="red.600" />
                          <Text fontSize="xs" fontWeight="bold" color="red.600">Delete Child Account</Text>
                        </HStack>
                        <Icon as={MdOutlineKeyboardArrowRight} color="red.200" />
                      </Flex>
                    )}
                  </VStack>
                </VStack>
              )}
            </>
          ) : (
            /* HISTORY VIEW - Full Page Style Header */
            <VStack align="stretch" gap={6}>
               <Box position="sticky" top="-8" bg="white" pt={2} pb={4} zIndex={20} borderBottom="1px solid" borderColor="gray.100">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Button variant="ghost" size="sm" onClick={() => setView("info")}> <LuArrowLeft /> Back to Profile</Button>
                    <Separator orientation="vertical" h="20px" mx={2} />
                    <Heading size="md">Academic Dashboard</Heading>
                  </HStack>
                  <Button variant="outline" size="sm" onClick={onClose}>Close Report</Button>
                </Flex>
              </Box>
              <QuizHistoryList studentId={student.id} />
            </VStack>
          )}
        </Box>
      </Box>

      {modal === "delete" && student && setModal && (
        <DeleteGraderPopover student={student} setStudent={setStudent} modal={modal} setModal={setModal} onClose={() => setModal("")} />
      )}
    </>
  )
}

export default EditGraderPopup