import React, { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  Image,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { useStudentsData } from "../context/studentsDataContext";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import AvatarComp from "@/components/avatar";
import AddGraderBtn from "../components/addGraderBtn";
import AddGraderPopup from "../components/addGraderPopover";

type Props = {};

const MyChildren = (props: Props) => {
  const [myChildrenShowBox, setMyChildrenShowBox] = useState(false);

  // gets students data array from the studentsDataContext
  const { studentsData } = useStudentsData();
  console.log(studentsData);
  

  return (
    <>
      <Flex w="full" mb={{ base: "24", lg: "10" }}>
        {studentsData.length > 0 ? (
          <Box
            bg="white"
            boxShadow="md"
            borderRadius="lg"
            w="full"
            my={5}
            p={4}
          >
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
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  w="full"
                  bg="textFieldColor"
                  borderRadius="lg"
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
            <Flex justify='center'>
              <AddGraderBtn
                showBox={myChildrenShowBox}
                setShowBox={setMyChildrenShowBox}
                basePageWidth={100}
                mdPageWidth={80}
                lgPageWidth={70}
              />
            </Flex>
          </Box>
        ) : null}
      </Flex>
      {myChildrenShowBox && (
        <AddGraderPopup onClose={() => setMyChildrenShowBox(false)} />
      )}
    </>
  );
};

export default MyChildren;
