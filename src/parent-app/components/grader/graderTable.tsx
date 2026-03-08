import { useState } from "react";
import { Table, Flex, Box, Text, Image } from "@chakra-ui/react";
import { GoDotFill } from "react-icons/go";
import AvatarComp from "@/components/avatar";
import MenuModal from "../menuModal";
import EditGraderPopup from "./editGraderPopover";
import DeleteGraderPopover from "./deleteGraderPopover";
import addFiles_img from "@/assets/addFiles_img.svg";

type Props = {
  studentsData: any[];
};

const GraderTable = ({ studentsData }: Props) => {
  const [modal, setModal] = useState<"" | "edit" | "delete">("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  return (
    <>
      <Box
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        p={{ base: 3, md: 6 }}
        bg="white"
        mb={{ base: "100px", lg: "10" }}
        mt={5}
      >
        {studentsData.length > 0 ? (
          <Table.ScrollArea border="1px solid" borderColor="gray.100" borderRadius="md">
            <Table.Root size={{ base: "sm", md: "lg" }} stickyHeader>
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader w="50px"></Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize="xs"
                    fontWeight={700}
                    whiteSpace="nowrap"
                  >
                    Name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize="xs"
                    fontWeight={700}
                    whiteSpace="nowrap"
                  >
                    School
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize="xs"
                    fontWeight={700}
                    whiteSpace="nowrap"
                  >
                    Class
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize="xs"
                    fontWeight={700}
                    whiteSpace="nowrap"
                  >
                    Subscription
                  </Table.ColumnHeader>
                  <Table.ColumnHeader w="50px"></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {studentsData.map((item) => (
                  <Table.Row key={item.id} _hover={{ bg: "gray.50" }}>
                    <Table.Cell>
                      <AvatarComp
                        username={`${item.firstname ?? ""} ${item.lastname ?? ""}`}
                        profileImage={item.profile_image}
                      />
                    </Table.Cell>

                    <Table.Cell
                      color="backgrondColor2"
                      fontSize="xs"
                      fontWeight={500}
                      whiteSpace="nowrap"
                    >
                      {item.firstname} {item.lastname}
                    </Table.Cell>
                    <Table.Cell
                      color="on_containerColor"
                      fontWeight={400}
                      fontSize="xs"
                      maxW="200px" // Prevents school name from stretching table too wide
                      isTruncated
                    >
                      {item.school}
                    </Table.Cell>
                    <Table.Cell
                      color="on_containerColor"
                      fontWeight={400}
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {item.class}
                    </Table.Cell>
                    <Table.Cell
                      color="on_containerColor"
                      fontWeight={400}
                      fontSize="xs"
                    >
                      <Flex align="center" gap="2">
                        <GoDotFill 
                          color={
                            item.subscription === "Premium" ? "green" : 
                            item.subscription === "Standard" ? "blue" : "yellow"
                          } 
                        />
                        {item.subscription || "Basic"}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <MenuModal
                        editText="Edit"
                        deleteText="Delete"
                        setModal={setModal}
                        onSelect={(type) => {
                          setSelectedStudent(item);
                          setModal(type);
                        }}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        ) : (
          <Box
            w="full"
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            px={4}
          >
            <Text my={10} fontSize="sm" color="fieldTextColor">
              You have not added any child yet. Click the button above to add a child.
            </Text>
            <Image 
              src={addFiles_img} 
              w={{ base: "80%", md: "35%", lg: "20%" }} 
              opacity={0.8} 
              mb={10}
            />
          </Box>
        )}
      </Box>

      {/* Popovers - handled by existing conditional logic */}
      {modal === "edit" && selectedStudent && (
        <EditGraderPopup
          student={selectedStudent}
          setStudent={setSelectedStudent}
          modal={modal}
          setModal={setModal}
          showEditBtn={true}
          showDeleteBtn={true}
          onClose={() => {
            setModal("");
            setSelectedStudent(null);
          }}
        />
      )}
      {modal === "delete" && selectedStudent && (
        <DeleteGraderPopover
          student={selectedStudent}
          setStudent={setSelectedStudent}
          modal={modal}
          setModal={setModal}
          onClose={() => {
            setModal("");
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default GraderTable;