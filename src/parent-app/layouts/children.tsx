import { Box, Flex, Text, Image, Heading, EmptyState, VStack} from "@chakra-ui/react";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";



type Prop ={
  data: any[]
}

const Children = ({data}: Prop) => {

  return (
    <Flex w="full">
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
              boxShadow='xs'
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
                  {data.length}
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
              shadow='xs'
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
