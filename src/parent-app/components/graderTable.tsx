import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Table, Flex } from "@chakra-ui/react";
import { VscKebabVertical } from "react-icons/vsc";
import { GoDotFill } from "react-icons/go";
import AvatarComp from "@/components/avatar";
import MenuModal from "./menuModal";
import EditGraderPopup from "./editGraderPopover";
import DeleteGraderPopover from "./deleteGraderPopover";

type Props = {
  studentsData: any[];
};

const GraderTable = ({ studentsData }: Props) => {
  const [modal, setModal] = useState<"" | "edit" | "delete">("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  return (
    <>
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
                    username={`${item.firstname ?? ""} ${item.lastname ?? ""}`}
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
                  textTransform="uppercase"
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
                      setSelectedStudent(item); // this item is the current student
                      setModal(type); // type is "edit" or "delete"
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {modal === "edit" && selectedStudent ? (
        <EditGraderPopup
          student={selectedStudent}
          setStudent={setSelectedStudent}
          modal={modal}
          setModal={setModal}
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
