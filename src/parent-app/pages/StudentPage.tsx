import React, { useState } from "react";
import SearchBar from "../components/searchBar";
import { Flex, Box } from "@chakra-ui/react";

import AddGraderBtn from "../components/addGraderBtn";
import AddGrader from "../components/addGrader";
import GraderDetails from "../components/graderDetails";
import GraderTable from "../components/graderTable";

type Props = {};

const StudentPage = (props: Props) => {
  const [showBox, setShowBox] = useState(false);
  const [showPage, setShowPage] = useState(false);

  return (
    <Flex direction="column" w="95%" m="auto">
      <Flex w="full" my={5} justify="space-between" align="center">
        <SearchBar />
        <AddGraderBtn showBox={showBox} setShowBox={setShowBox} />
      </Flex>
      <Box>{showBox ? <AddGrader /> : <GraderDetails />}</Box>
    </Flex>
  );
};

export default StudentPage;
