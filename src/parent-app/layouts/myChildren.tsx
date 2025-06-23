import React, { useState } from "react";
import { Box, Flex, Grid, Text, Image, Heading, Icon, } from "@chakra-ui/react";
import { useStudentsData } from "../context/studentsDataContext";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import AvatarComp from "@/components/avatar";
import addUser_img from "../../assets/addUser_img.svg";
import addFiles_img from "../../assets/addFiles_img.svg";

type Props = {}

const MyChildren = (props: Props) => {
     // gets students data array from the studentsDataContext
      const { studentsData } = useStudentsData();

  return (
    <Flex w="full">
      {studentsData.length > 0 ? (
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
          <Heading as="h1" my={2}>
            My Children
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 2fr)" }}
            gap="4"
            p={{ base: 3, md: 5 }}
            placeItems="center"
            w={{ base: "full", md: "90%", lg: "80%" }}
            m="auto"
          >
            {studentsData.map((student, index) => (
              <Box
                key={index}
                display="flex"
                justifyItems="space-between"
                alignItems="center"
                w="full"
                bg="textFieldColor"
                borderRadius="lg"
                p={{ base: "4", md: "4", lg: "5" }}
                my={2}
              >
            
                <AvatarComp username={`${student.firstname ?? ""} ${student.lastname ?? ""}`} />
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

                <Icon as={MdOutlineKeyboardArrowRight} ml={5} fontSize="lg" />
              </Box>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box
          w="full"
          display="flex"
          flexDirection="column"
          justifyItems="center"
          alignItems="center"
        >
          <Text my={10}>
            You have not added any child yet. Click the Students section to add
            a child
          </Text>
          <Image src={addUser_img} />
        </Box>
      )}
    </Flex>
  );
}

export default MyChildren