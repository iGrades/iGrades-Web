import { useStudentsData } from "../context/studentsDataContext";
import { Flex, Text, Box, Image, Spinner } from "@chakra-ui/react";
import Children from "../layouts/children";
import MyChildren from "../layouts/myChildren";
import addUser_img from "../../assets/addUser_img.svg";

const HomePage = () => {
  // Get both students data and loading state from context
  const { studentsData, loading } = useStudentsData();

  return (
    <>
      {loading ? (
        // Show loading spinner while data is being fetched
        <Flex direction="column" justify="center" align="center">
          <Spinner size="xl" color="#206CE1" />
          <Text>Checking for data</Text>
        </Flex>
      ) : studentsData.length > 0 ? (
        // Show data when loaded and available
        <Flex w="95%" m="auto" direction="column">
          <Children data={studentsData} />
          <MyChildren data={studentsData} />
        </Flex>
      ) : (
        // Only show empty state when not loading AND no data exists
        <Box
          w="full"
          display="flex"
          flexDirection="column"
          justifyItems="center"
          alignItems="center"
        >
          <Text my={10} fontSize="xs" color="fieldTextColor">
            You have not added any child yet. Click the Students section to add
            a child
          </Text>
          <Image src={addUser_img} w="50%" my={16} />
        </Box>
      )}
    </>
  );
};

export default HomePage;
