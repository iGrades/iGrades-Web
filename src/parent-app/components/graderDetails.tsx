import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";
import { useStudentsData } from "../context/studentsDataContext";
import GraderTable from "./graderTable";
import addFiles_img from "../../assets/addFiles_img.svg"

const GraderDetails = () => {
  // gets students data array from the studentsDataContext
  const { studentsData } = useStudentsData();

  return (
    <Box>
      <GraderTable studentsData={studentsData} />
      {studentsData.length === 0 ? (
        <Box
          w="full"
          display="flex"
          flexDirection="column"
          justifyItems="center"
          alignItems="center"
        >
          <Text my={10}>
            You have not added any child yet. Click the Students section to add
            a child
          </Text>
          <Image src={addFiles_img} />
        </Box>
      ) : null}
    </Box>
  );
};

export default GraderDetails;
