import { useState } from "react";
import SearchBar from "../components/searchBar";
import { Flex, Box } from "@chakra-ui/react";
import AddGraderBtn from "../components/grader/addGraderBtn";
import GraderDetails from "../components/grader/graderDetails";
import AddGraderPopup from "../components/grader/addGraderPopover";

const StudentPage = () => {
  const [showBox, setShowBox] = useState(false);

  return (
    <Flex 
      direction="column" 
      w={{ base: "100%", md: "95%" }} 
      px={{ base: 4, md: 0 }} 
      m="auto"
      pb={{ base: "100px", lg: "20px" }} 
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        w="full"
        mt={5}
        justify="space-between"
        align={{ base: "stretch", md: "center" }} 
      >
        <Box flex={{ base: "none", md: "1" }} mr={{ md: 4 }}>
          <SearchBar />
        </Box>

        <AddGraderBtn
          showBox={showBox}
          setShowBox={setShowBox}
          basePageWidth={100}
          mdPageWidth={25}
          lgPageWidth={20}
        />
      </Flex>

      <Box mt={6}>
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