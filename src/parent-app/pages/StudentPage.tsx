import { useState } from "react";
import SearchBar from "../components/searchBar";
import { Flex, Box } from "@chakra-ui/react";
import AddGraderBtn from "../components/grader/addGraderBtn";
import GraderDetails from "../components/grader/graderDetails";
import AddGraderPopup from "../components/grader/addGraderPopover";

type Props = {};

const StudentPage = () => {
  const [showBox, setShowBox] = useState(false);

  return (
    <Flex direction="column" w="95%" m="auto">
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        w="full"
        mt={5}
        justify="space-between"
        align="center"
      >
        <SearchBar />
        <AddGraderBtn
          showBox={showBox}
          setShowBox={setShowBox}
          basePageWidth={100}
          mdPageWidth={25}
          lgPageWidth={20}
        />
      </Flex>
      <Box>
        <GraderDetails />
        {showBox && (
          <AddGraderPopup
            showBox={showBox}
            setShowBox={setShowBox}
            onClose={() => setShowBox(false)}
          />
        )}
      </Box>
    </Flex>
  );
};

export default StudentPage;
