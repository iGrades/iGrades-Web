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
        <Flex direction="column" justify="center" align="center" h="85vh">
          <Spinner size="xl" color="#206CE1" />
          <Text mt={4}>Checking for data</Text>
        </Flex>
      ) : studentsData.length > 0 ? (
        // Show data when loaded and available

        <Flex w={{ base: "100%", md: "95%" }} px={{ base: 4, md: 0 }} m="auto" direction="column">
          <Children data={studentsData} />
          <MyChildren data={studentsData} />
        </Flex>
      ) : (
        // Only show empty state when not loading AND no data exists
        <Box
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={{ base: 4, md: 6 }} 
          bg="white"
          mb={10}
          mt={5}
          h={{ base: "auto", md: "85vh" }} 
          minH="70vh"
        >
          <Box
            w="full"
            display="flex"
            flexDirection="column"
            justifyContent="center" 
            alignItems="center"
            textAlign="center" 
          >
            <Text 
              my={{ base: 6, md: 10 }} 
              fontSize={{ base: "sm", md: "xs" }}
              color="fieldTextColor"
              maxW="80%" 
            >
              You have not added any child yet. Click the Students section to add
              a child
            </Text>
            <Image 
              src={addUser_img} 
              w={{ base: "80%", md: "45%", lg: "35%" }}
              my={{ base: 8, md: 16 }} 
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default HomePage;