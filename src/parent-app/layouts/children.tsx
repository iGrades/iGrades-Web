import { Box, Flex, Text, Image, Heading } from "@chakra-ui/react";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";

type Prop = {
  data: any[];
};

const Children = ({ data }: Prop) => {
  return (
    <Flex w="full">
      <Box 
        bg="white" 
        boxShadow="md" 
        borderRadius="lg" 
        w="full" 
        my={5} 
        p={{ base: 3, md: 4 }} 
      >
        <Heading as="h1" fontSize={{ base: "md", md: "lg" }} mb={4}>
          Children
        </Heading>
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          alignItems="stretch" 
          gap={2} 
        >
          {/* Card 1: My Children */}
          <Box
            display="flex"
            justifyContent="flex-start" 
            alignItems="center"
            w={{ base: "full", lg: "49%" }}
            bg="textFieldColor"
            borderRadius="lg"
            p={{ base: "4", md: "6", lg: "8" }} 
            my={{ base: 1, lg: 2 }}
          >
            <Image 
              src={childrenBox_ico} 
              boxSize={{ base: "50px", md: "60px" }} 
            />
            <Box mx={{ base: 3, md: 5 }}>
              <Text
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                mb={0}
                color="#333951"
                fontWeight="medium"
              >
                My Children
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="#333951"
              >
                {data.length}
              </Heading>
            </Box>
          </Box>

          {/* Card 2: Active Students */}
          <Box
            display="flex"
            justifyContent="flex-start" 
            alignItems="center"
            w={{ base: "full", lg: "49%" }}
            bg="textFieldColor"
            borderRadius="lg"
            p={{ base: "4", md: "6", lg: "8" }}
            my={{ base: 1, lg: 2 }}
          >
            <Image 
              src={activeChildrenBox_ico} 
              boxSize={{ base: "50px", md: "60px" }} 
            />
            <Box mx={{ base: 3, md: 5 }}>
              <Text
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                mb={0}
                color="#333951"
                fontWeight="medium"
                lineHeight="shorter"
              >
                Active Students (Subscribed)
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "lg", md: "2xl", lg: "3xl" }}
                color="#333951"
              >
                {
                  data.filter(
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
    </Flex>
  );
};

export default Children;