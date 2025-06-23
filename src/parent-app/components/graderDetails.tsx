import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, Text } from "@chakra-ui/react";
import { useStudentsData } from "../context/studentsDataContext";
import GraderTable from "./graderTable";

const GraderDetails = () => {

   // gets students data array from the studentsDataContext
    const { studentsData } = useStudentsData();

  return (
    <Box>
        <GraderTable studentsData={studentsData} />
      {studentsData.length === 0 ? (
        <Text>No students found.</Text>
      ) : null}
    </Box>
  );
};

export default GraderDetails;
