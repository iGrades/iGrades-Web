import React, { useState } from "react";
import { Box, Flex, Text, Image, Heading, Icon } from "@chakra-ui/react";
import { useStudentsData } from "../context/studentsDataContext";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";
import addUser_img from "../../assets/addUser_img.svg";
import addFiles_img from "../../assets/addFiles_img.svg";

type Props = {
};

const Children = (prop: Props) => {
    // gets students data array from the studentsDataContext
  const { studentsData } = useStudentsData();

  return (
    <Flex w="full">
      {studentsData.length > 0 ? (
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
          <Heading as="h1" my={2}>
            Children
          </Heading>
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            alignItems="center"
          >
            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="textFieldColor"
              borderRadius="lg"
              p={{ base: "5", md: "8", lg: "10" }}
              my={2}
            >
              <Image src={childrenBox_ico} boxSize="60px" />
              <Box mx={5}>
                <Text
                  fontSize={{ base: "md", lg: "lg" }}
                  mb={1}
                  color="#333951"
                >
                  My Children
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  color="#333951"
                >
                  {studentsData.length}
                </Heading>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="textFieldColor"
              borderRadius="lg"
              p={{ base: "5", md: "8", lg: "10" }}
              my={2}
            >
              <Image src={activeChildrenBox_ico} boxSize="60px" />
              <Box mx={5}>
                <Text
                  fontSize={{ base: "md", lg: "lg" }}
                  mb={1}
                  color="#333951"
                >
                  Active Students (Subscribed)
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  color="#333951"
                >
                  {
                    studentsData.filter(
                      (student) =>
                        student.subscription === "Standard" ||
                        student.subscription === "Premium"
                    ).length
                  }
                </Heading>
              </Box>
            </Box>
          </Flex>
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
          <Image src={addUser_img} w='40%' my={16} />
        </Box>
      )}
    </Flex>
  );
};

export default Children;
