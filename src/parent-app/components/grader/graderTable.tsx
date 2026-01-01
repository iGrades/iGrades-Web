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
  const [modal, setModal] = useState<"" | "edit" | "delete" >("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  return (
    <>
      <Box
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        p={6}
        bg="white"
        mb={10}
        mt={5}
      >
        {studentsData.length > 0 ? (
          <Table.ScrollArea>
            <Table.Root size="lg" stickyHeader mb={{ base: "24", lg: "10" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  ></Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  >
                    Name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  >
                    School
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  >
                    Class
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  >
                    Subscription
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="on_backgroundColor"
                    fontSize={"xs"}
                    fontWeight={700}
                  ></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {studentsData.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <AvatarComp
                        username={`${item.firstname ?? ""} ${
                          item.lastname ?? ""
                        }`}
                        profileImage={item.profile_image}
                      />
                    </Table.Cell>

                    <Table.Cell
                      color="backgrondColor2"
                      fontSize={"xs"}
                      fontWeight={400}
                    >
                      {item.firstname} {item.lastname}
                    </Table.Cell>
                    <Table.Cell
                      color="on_containerColor"
                      fontWeight={400}
                      fontSize="xs"
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
                        {item.subscription === "Premium" ? (
                          <GoDotFill color="green" />
                        ) : item.subscription === "Standard" ? (
                          <GoDotFill color="blue" />
                        ) : item.subscription === "Basic" ? (
                          <GoDotFill color="yellow" />
                        ) : (
                          <GoDotFill color="yellow" />
                        )}

                        {item.subscription || "Basic"}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell cursor="pointer">
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
            justifyItems="center"
            alignItems="center"
          >
            <Text my={10} fontSize="xs" color="fieldTextColor">
              You have not added any child yet. Click the button above to add a
              child
            </Text>
            <Image src={addFiles_img} w={{ md: "35%", lg: "20%" }} my={16} />
          </Box>
        )}
      </Box>

      {modal === "edit" && selectedStudent ? (
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
      ) : modal === "delete" && selectedStudent ? (
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
      ) : null}
    </>
  );
};

export default GraderTable;
