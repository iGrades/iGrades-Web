import {
  Box,
  Flex,
  Button,
  Image,
  Heading,
  Text,
} from "@chakra-ui/react";
import { FaArrowRightLong } from "react-icons/fa6";
import testimonialImg from "@/assets/landing-page/testimonial_img.png";
import orangeBlob from "@/assets/landing-page/third_orange_line.png";


const Reviews = () => {
  return (
    <Flex
      as="section"
      my={20}
      px={{ base: 4, lg: 12 }}
      align="start"
      justify="space-between"
      direction={{ base: "column", md: "row" }}
    >
      <Box
        w={{ base: "100%", md: "45%" }}
        mr={{ base: 0, md: 6, lg: 12 }}
        mb={{ base: 12, md: 0 }}
      >
        <Flex justify="start" align="center" mb={4} gap={2}>
          <Image src={orangeBlob} display="inline-block" alt="orange blob" />
          <Heading as="h4" fontSize="lg" fontWeight="semibold" color="#FD8B3A">
            {" "}
            TESTIMONIAL
          </Heading>
        </Flex>

        <Heading
          as="h2"
          lineHeight="1.2"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          fontFamily={"'Bricolage', Grotesque"}
          mb={6}
          color="#2F327D"
        >
          What They Say?
        </Heading>

        <Text w={{base: '100%', md: '90%'}} fontSize={{base:'md', md: 'md', lg: 'xl'}} color="#696984" mb={6} lineHeight="1.8">
          iGrade has got more than 100k positive ratings from our users around
          the world. <br /> <br />
          Some of the students and teachers were greatly helped by the iGrade.{" "}
          <br /> <br />
          Are you too? Please give your assessment
        </Text>

        <Button
          w={72}
          p={6}
          pr={16} // Make extra space for the icon
          rounded="3xl"
          border="1px solid"
          borderColor="primaryColor"
          bg="white"
          color="primaryColor"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          position="relative"
          fontWeight='400'
          fontSize='md'
        >
          Write your assessment
          <Box
            border="1px solid"
            borderColor="primaryColor"
            rounded="full"
            p={3.5}
            bg="white" // Match button background
            position="absolute"
            right={-1} // Overlap the border slightly
          >
            <FaArrowRightLong />
          </Box>
        </Button>
      </Box>

      <Box
        w={{ base: "100%", md: "45%" }}
        mr={{ base: 0, md: 6, lg: 12 }}
      >
        <Image
          src={testimonialImg}
          alt="testimonial-img"
          borderRadius="md"
          boxShadow="md"
        />
      </Box>
    </Flex>
  );
};

export default Reviews;
