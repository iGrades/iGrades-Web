import { Text, Heading, Flex, Box, Grid } from "@chakra-ui/react";
import { useStudentsData } from "../../context/studentsDataContext";
import AvatarComp from "@/components/avatar";

const Children = () => {
  const { studentsData } = useStudentsData();
  
  return (
    <>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={{ base: 4, md: 6, lg: 8 }}
        p={{ base: 3, md: 5 }}
        w={{ base: "full", md: "95%", lg: "95%" }}
        m="auto"
      >
        {studentsData && studentsData.length > 0 ? (
          studentsData.map((student, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              w="full"
              bg="textFieldColor"
              borderRadius="lg"
              p={{ base: "4", md: "4", lg: "5" }}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ shadow: "sm", transform: "translateY(-2px)" }}
            >
              <Box
                display="flex"
                alignItems="center"
                minW="0" 
              >
                <AvatarComp
                  username={`${student.firstname ?? ""} ${student.lastname ?? ""}`}
                  profileImage={student.profile_image}
                />
                <Box ml={{ base: 3, md: 5 }} overflow="hidden">
                  <Heading
                    as="h2"
                    fontSize={{ base: "sm", md: "md" }}
                    color="#333951"
                    truncate 
                  >
                    {student.firstname} {student.lastname}
                  </Heading>
                  <Text
                    fontSize="xs"
                    color="#333951"
                    textTransform="capitalize"
                    truncate 
                  >
                    {student.school} • {student.class}
                  </Text>
                </Box>
              </Box>
            </Flex>
          ))
        ) : (
          <Box gridColumn="1 / -1" textAlign="center" py={10}>
            <Text fontSize="sm" color="gray.500">
              You don't have any children registered on the igrade app. Navigate
              to the Students section to add a child
            </Text>
          </Box>
        )}
      </Grid>
    </>
  );
};

export default Children;