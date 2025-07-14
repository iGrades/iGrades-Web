import { Box } from "@chakra-ui/react";
import { useStudentsData } from "../../context/studentsDataContext";
import GraderTable from "././graderTable";


const GraderDetails = () => {
  // gets students data array from the studentsDataContext
  const { studentsData } = useStudentsData();

  return (
    <Box>
      <GraderTable studentsData={studentsData} />
    </Box>
  );
};

export default GraderDetails;
