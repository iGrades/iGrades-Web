import { useStudentsData } from "../context/studentsDataContext";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import Children from "../layouts/children";
import MyChildren from "../layouts/myChildren";
import addUser_img from "../../assets/addUser_img.svg";

const HomePage = () => {
  // gets students data array from the studentsDataContext
  const { studentsData } = useStudentsData();

  return (
    <>
      {studentsData.length > 0 ? (
        <Flex w="95%" m="auto" direction="column">
          <Children data={studentsData} />
          <MyChildren data={studentsData} />
        </Flex>
      ) : (
        <Box
          w="full"
          display="flex"
          flexDirection="column"
          justifyItems="center"
          alignItems="center"
        >
          <Text my={10} fontSize="xs" color="fieldTextColor">
            You have not added any child yet. Click the Students section to add a child 
          </Text>
          <Image src={addUser_img} w="50%" my={16} />
        </Box>
      )}
    </>
  );
};

export default HomePage;
