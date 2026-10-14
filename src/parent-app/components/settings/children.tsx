import { useState } from "react";
import { Text, Heading, Flex, Box, Grid, Button, Badge, Icon } from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";
import { useStudentsData } from "../../context/studentsDataContext";
import AvatarComp from "@/components/avatar";
import { ParentClassChangeModal } from "../grader/ParentClassChangeModal";

const Children = () => {
  const { studentsData, fetchStudents } = useStudentsData();
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={{ base: 4, md: 6, lg: 8 }}
        p={{ base: 3, md: 5 }}
        w={{ base: "full", md: "95%", lg: "95%" }}
        m="auto"
      >
        {studentsData && studentsData.length > 0 ? (
          studentsData.map((student, index) => (
            <Flex
              key={student.id || index}
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={3}
              w="full"
              bg="#F4F7FB"
              borderRadius="xl"
              border="none"
              outline="none"
              boxShadow="none"
              p={{ base: "4", md: "4", lg: "5" }}
              transition="all 0.2s"
              _hover={{ bg: "blue.50/30" }}
            >
              <Box
                display="flex"
                alignItems="center"
                minW="0" 
              >
                <AvatarComp
                  username={`${student.firstname ?? ""} ${student.lastname ?? ""}`}
                  profileImage={student.profile_image}
                />
                <Box ml={{ base: 3, md: 5 }} overflow="hidden">
                  <Heading
                    as="h2"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="700"
                    color="gray.800"
                    truncate 
                  >
                    {student.firstname} {student.lastname}
                  </Heading>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="capitalize"
                    truncate 
                    mt={0.5}
                  >
                    {student.school || "Student"} • <Badge colorPalette="blue" size="xs" variant="subtle" borderRadius="md">{student.class || "General"}</Badge>
                  </Text>
                </Box>
              </Box>

              <Button
                size="xs"
                variant="solid"
                bg="#206CE1"
                color="white"
                borderRadius="lg"
                fontWeight="700"
                _hover={{ bg: "#1956b5" }}
                onClick={() => {
                  setSelectedStudent(student);
                  setShowModal(true);
                }}
              >
                <Icon as={FiSend} mr={1} boxSize={3} />
                Change Class
              </Button>
            </Flex>
          ))
        ) : (
          <Box gridColumn="1 / -1" textAlign="center" py={10}>
            <Text fontSize="sm" color="gray.500">
              You don't have any children registered on the igrade app. Navigate
              to the Students section to add a child
            </Text>
          </Box>
        )}
      </Grid>

      {showModal && selectedStudent && (
        <ParentClassChangeModal
          isOpen={true}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          childrenList={studentsData}
          selectedStudentId={selectedStudent.id}
          onSuccess={() => {
            fetchStudents?.();
            setShowModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default Children;