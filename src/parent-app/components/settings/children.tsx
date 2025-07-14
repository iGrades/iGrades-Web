import { Text, Heading, Flex, Box, Icon, Grid } from "@chakra-ui/react";
import { useStudentsData } from "../../context/studentsDataContext";
import AvatarComp from "@/components/avatar";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

type Props = {};

const Children = (props: Props) => {
  const { studentsData } = useStudentsData();
  return (
    <>
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 2fr)" }}
        gap="4"
        p={{ base: 3, md: 5 }}
        placeItems="center"
        w={{ base: "full", md: "90%", lg: "80%" }}
        m="auto"
      >
        {studentsData.map((student, index) => (
          <Flex
            key={index}
            justify="space-between"
            align="center"
            w="full"
            bg="textFieldColor"
            borderRadius="lg"
            boxShadow="xs"
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
                  fontSize={{ base: "sm", md: "md", lg: "lg" }}
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
        ))}
      </Grid>
    </>
  );
};

export default Children;
