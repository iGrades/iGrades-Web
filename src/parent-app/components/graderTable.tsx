import { Table } from "@chakra-ui/react";

type Props = {
    studentsData: any[]
};

const GraderTable = ({ studentsData }: Props) => {

  return (
    <Table.Root size="lg">
      <Table.Header>
        <Table.Row>
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
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {studentsData.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell
              color="backgrondColor2"
              fontSize={"sm"}
              fontWeight={700}
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
            >
              {item.class}
            </Table.Cell>
            <Table.Cell>{item.subscription}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default GraderTable

