import { useState } from "react";
import { Box, Flex, Grid, Text, Heading, Icon } from "@chakra-ui/react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import AvatarComp from "@/components/avatar";
import AddGraderBtn from "../components/grader/addGraderBtn";
import AddGraderPopup from "../components/grader/addGraderPopover";

type Props = {
  data: any[];
};

const MyChildren = ({ data }: Props) => {
  const [myChildrenShowBox, setMyChildrenShowBox] = useState(false);

  // Sort data by created_at (or id) and take the last 4 entries
  const sortedData = data
    .sort((a, b) => {
      // Use created_at if available, otherwise use id
      const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
      return dateB - dateA; // Descending order
    })
    .slice(0, 4); // Take the last 4 added

  return (
    <>
      <Flex w="full" mb={{ base: "24", lg: "10" }}>
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
          <Heading as="h1" fontSize='lg' my={2}>
            My Children
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 2fr)" }}
            gap={{md: 6, lg: 10}}
            p={{ base: 3, md: 5 }}
            placeItems="center"
            w={{ base: "full", md: "100%", lg: "100%" }}
            m="auto"
          >
            {sortedData.length > 0 ? (
              sortedData.map((student, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  w="full"
                  bg="textFieldColor"
                  borderRadius="lg"
                  // boxShadow="xs"
                  p={{ base: "4", md: "4", lg: "5" }}
                  my={2}
                  cursor="pointer"
                >
                  <Box
                    display="flex"
                    justifyItems="space-between"
                    alignItems="center"
                  >
                    <AvatarComp
                      username={`${student.firstname ?? ""} ${
                        student.lastname ?? ""
                      }`}
                      profileImage={student.profile_image}
                    />
                    <Box mx={5}>
                      <Heading
                        as="h2"
                        fontSize={{ base: "xs", md: "sm", lg: "md" }}
                        color="#333951"
                      >
                        {student.firstname} {student.lastname}
                      </Heading>
                      <Text
                        fontSize="xs"
                        mb={1}
                        color="#333951"
                        textTransform="capitalize"
                      >
                        {student.school} {student.class}
                      </Text>
                    </Box>
                  </Box>
                  <Icon as={MdOutlineKeyboardArrowRight} ml={5} fontSize="xl" />
                </Flex>
              ))
            ) : (
              <Text>No children added yet.</Text>
            )}
          </Grid>
          <Flex justify="center">
            <AddGraderBtn
              showBox={myChildrenShowBox}
              setShowBox={setMyChildrenShowBox}
              basePageWidth={100}
              mdPageWidth={80}
              lgPageWidth={70}
            />
          </Flex>
        </Box>
      </Flex>
      {myChildrenShowBox && (
        <AddGraderPopup
          onClose={() => setMyChildrenShowBox(false)}
          showBox={myChildrenShowBox}
          setShowBox={setMyChildrenShowBox}
        />
      )}
    </>
  );
};

export default MyChildren;
