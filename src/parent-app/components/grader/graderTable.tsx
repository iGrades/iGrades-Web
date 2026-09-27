import { useState } from "react";
import { Table, Box, Text, Badge, Button, Icon } from "@chakra-ui/react";
import AvatarComp from "@/components/avatar";
import MenuModal from "../menuModal";
import EditGraderPopup from "./editGraderPopover";
import DeleteGraderPopover from "./deleteGraderPopover";
import { ParentClassChangeModal } from "./ParentClassChangeModal";
import { useStudentsData } from "../../context/studentsDataContext";
import { PiGraduationCapFill, PiUserPlusBold } from "react-icons/pi";

type Props = {
  studentsData: any[];
  onOpenAdd?: () => void;
};

const GraderTable = ({ studentsData, onOpenAdd }: Props) => {
  const [modal, setModal] = useState<"" | "edit" | "delete" | "class_change">("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const { fetchStudents } = useStudentsData();

  return (
    <>
      <Box
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        overflow="hidden"
        bg="white"
        mb={{ base: "100px", lg: "10" }}
      >
        {studentsData.length > 0 ? (
          <Table.ScrollArea>
            <Table.Root size={{ base: "sm", md: "md" }} stickyHeader>
              <Table.Header>
                <Table.Row bg="gray.50/80">
                  <Table.ColumnHeader w="60px" py={3.5} px={4}></Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.700"
                    fontSize="xs"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3.5}
                  >
                    Student Details
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.700"
                    fontSize="xs"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3.5}
                  >
                    Academic Institution
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.700"
                    fontSize="xs"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3.5}
                  >
                    Class & Level
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.700"
                    fontSize="xs"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3.5}
                  >
                    Curriculum Tier
                  </Table.ColumnHeader>
                  <Table.ColumnHeader w="60px" py={3.5} textAlign="right" px={4}>
                    Actions
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {studentsData.map((item) => {
                  const subLower = (item.subscription || "basic").toLowerCase();
                  const isPremium = subLower.includes("premium");
                  const isStandard = subLower.includes("standard");

                  return (
                    <Table.Row
                      key={item.id}
                      _hover={{ bg: "blue.50/30" }}
                      transition="background-color 0.15s ease"
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Table.Cell px={4} py={3}>
                        <AvatarComp
                          username={`${item.firstname ?? ""} ${item.lastname ?? ""}`}
                          profileImage={item.profile_image}
                        />
                      </Table.Cell>

                      <Table.Cell py={3}>
                        <Box>
                          <Text
                            color="gray.900"
                            fontSize="sm"
                            fontWeight={700}
                            whiteSpace="nowrap"
                          >
                            {item.firstname} {item.lastname}
                          </Text>
                          <Text fontSize="11px" color="gray.400" truncate maxW="180px">
                            {item.email || "Student account"}
                          </Text>
                        </Box>
                      </Table.Cell>

                      <Table.Cell py={3}>
                        <Text
                          color="gray.700"
                          fontWeight={500}
                          fontSize="xs"
                          maxW="220px"
                          truncate 
                        >
                          {item.school || "Not specified"}
                        </Text>
                      </Table.Cell>

                      <Table.Cell py={3}>
                        <Badge
                          variant="subtle"
                          colorPalette="blue"
                          size="sm"
                          borderRadius="lg"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          {item.class || "General"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell py={3}>
                        <Badge
                          bg={isPremium || isStandard ? "#206CE1" : "gray.100"}
                          color={isPremium || isStandard ? "white" : "gray.700"}
                          size="sm"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                          fontWeight="bold"
                        >
                          {item.subscription || "Basic Tier"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell py={3} px={4} textAlign="right">
                        <MenuModal
                          editText="Edit Details"
                          deleteText="Remove Child"
                          setModal={setModal}
                          onSelect={(type) => {
                            setSelectedStudent(item);
                            setModal(type);
                          }}
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
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
            py={14}
            px={4}
          >
            <Box
              p={4}
              borderRadius="2xl"
              bg="blue.50"
              color="#206CE1"
              mb={3}
            >
              <PiGraduationCapFill size={40} />
            </Box>
            <Heading size="sm" color="gray.900" fontWeight="800" mb={1}>
              No Connected Children Yet
            </Heading>
            <Text fontSize="xs" color="gray.500" maxW="360px" mb={5}>
              Connect your child to track quiz progress, monitor curriculum pacing, and view learning intelligence reports.
            </Text>
            {onOpenAdd && (
              <Button
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                borderRadius="xl"
                size="sm"
                fontWeight="bold"
                onClick={onOpenAdd}
              >
                <Icon as={PiUserPlusBold} mr={1.5} />
                Add Your Child Now
              </Button>
            )}
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
      {modal === "class_change" && selectedStudent && (
        <ParentClassChangeModal
          isOpen={true}
          onClose={() => {
            setModal("");
            setSelectedStudent(null);
          }}
          childrenList={studentsData}
          selectedStudentId={selectedStudent.id}
          onSuccess={() => {
            fetchStudents?.();
          }}
        />
      )}
    </>
  );
};

export default GraderTable;