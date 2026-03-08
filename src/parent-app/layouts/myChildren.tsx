import { useState } from "react";
import { Box, Flex, Grid, Text, Heading, Icon } from "@chakra-ui/react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import AvatarComp from "@/components/avatar";
import AddGraderBtn from "../components/grader/addGraderBtn";
import AddGraderPopup from "../components/grader/addGraderPopover";
import EditGraderPopup from "../components/grader/editGraderPopover";

type Props = {
  data: any[];
};

const MyChildren = ({ data }: Props) => {
  const [myChildrenShowBox, setMyChildrenShowBox] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const sortedData = [...data]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <>
      <Flex w="full" mb={{ base: "100px", lg: "10" }}>
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={{ base: 3, md: 4 }}>
          <Heading as="h1" fontSize="lg" my={2} px={1}>
            My Children
          </Heading>
          
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={{ base: 3, md: 4, lg: 6 }}
            p={{ base: 1, md: 2 }}
            w="full"
          >
            {sortedData.length > 0 ? (
              sortedData.map((student, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  w="full"
                  bg="textFieldColor"
                  borderRadius="lg"
                  p={{ base: "3", md: "4", lg: "5" }}
                  cursor="pointer"
                  transition="transform 0.2s"
                  _active={{ transform: "scale(0.98)" }} 
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowStudentModal(true);
                  }}
                >
                  <Flex align="center" minW="0"> 
                    <AvatarComp
                      username={`${student.firstname ?? ""} ${student.lastname ?? ""}`}
                      profileImage={student.profile_image}
                    />
                    <Box ml={{ base: 3, md: 5 }} overflow="hidden">
                      <Heading
                        as="h2"
                        fontSize={{ base: "sm", md: "sm", lg: "md" }}
                        color="#333951"
                        truncate
                      >
                        {student.firstname} {student.lastname}
                      </Heading>
                      <Text
                        fontSize="xs"
                        color="#333951"
                        textTransform="capitalize"
                        truncate
                      >
                        {student.school} • {student.class}
                      </Text>
                    </Box>
                  </Flex>
                  <Icon 
                    as={MdOutlineKeyboardArrowRight} 
                    flexShrink={0} 
                    ml={2} 
                    fontSize="xl" 
                    color="greyOthers" 
                  />
                </Flex>
              ))
            ) : (
              <Text p={4}>No children added yet.</Text>
            )}
          </Grid>

          <Flex justify="center" mt={4} w="full">
            <AddGraderBtn
              showBox={myChildrenShowBox}
              setShowBox={setMyChildrenShowBox}
              basePageWidth={100}
              mdPageWidth={80}
              lgPageWidth={70}
            />
          </Flex>
        </Box>
      </Flex>

      {myChildrenShowBox && (
        <AddGraderPopup
          onClose={() => setMyChildrenShowBox(false)}
          showBox={myChildrenShowBox}
          setShowBox={setMyChildrenShowBox}
        />
      )}

      {showStudentModal && (
        <EditGraderPopup
          student={selectedStudent}
          setStudent={setSelectedStudent}
          showEditBtn={false}
          showDeleteBtn={false}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default MyChildren;