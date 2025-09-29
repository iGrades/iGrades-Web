import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa6";
import headerPic from "@/assets/landing-page/header-pic.png";
import orangeBlob from "@/assets/landing-page/orange_line.png";
// import AnimatedSection from "./animatedSection";

const Hero = () => {
  const stats = [
    { id: 1, value: "60k+", label: "Total Registered Students" },
    { id: 2, value: "10K+", label: "Total Avialable Courses/Subjects" },
    { id: 3, value: "2K+", label: "Certified Tutors" },
    { id: 4, value: "5K+", label: "Acreditted Quizzes" },
  ];
  return (
    <Box mb={{ base: 10, md: 20 }}>
      <Flex
        as="section"
        direction={{ base: "column-reverse", md: "row" }}
        align="center"
        justify="space-between"
        px={{ base: 2, md: 4, lg: 12 }}
        py={{ base: 12, md: 6, lg: 0 }}
        // bg="blue.400"
      >
        <Box
          w={{ base: "100%", md: "45%" }}
          mr={{ base: 0, md: 6, lg: 12 }}
          mb={{ base: 12, md: 0 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: "4xl", lg: "6xl" }}
            fontWeight="bold"
            mb={6}
            color="on_backgroundColor"
            lineHeight="1.2"
            textAlign={{ base: "center", md: "left" }}
            position="relative"
          >
            Get Quality{" "}
            <span style={{ color: "#206CE1" }}>
              1-on-1
              <Image
                src={orangeBlob}
                alt="orange-blob"
                ml={{ base: 60, md: 48, lg: 80 }}
                w={{ base: 28, md: 32, lg: "52" }}
                position="absolute"
              />
            </span>
            <br /> Tutoring at your <br /> Convinience
          </Heading>
          <Text
            color="on_backgroundColor"
            fontWeight="600"
            fontSize={{ base: "md", lg: "lg" }}
            mb={6}
            lineHeight="1.6"
            w={{ base: "100%", lg: "70%" }}
            textAlign={{ base: "center", md: "left" }}
          >
            1-on-1 lessons with expert teachers based on your specific goals or
            interest.
          </Text>

          <Flex
            justify="space-between"
            align="center"
            w={{ base: "100%", lg: "90%" }}
            py={4}
            pr={4}
          >
            <Button
              bg="primaryColor"
              rounded={{ base: "3xl", md: "xl", lg: "4xl" }}
              w="45%"
              p={{ base: 7, md: 4, lg: 8 }}
              fontWeight="bold"
            >
              Join for free
            </Button>
            <Button
              variant="plain"
              fontWeight="bold"
              w="45%"
              p={{ base: 7, md: 4, lg: 8 }}
              mr={4}
              _hover={{ border: "1px solid", borderColor: "gray.300" }}
            >
              <FaPlay /> How it works
            </Button>
          </Flex>
        </Box>

        {/* Hero image */}

        <Box w={{ base: "100%", md: "50%" }} flex="1">
          <Image
            src={headerPic}
            alt="lovely-teenage-girl-with-curly-hair-posing-yellow-tshirt-min 1"
          />
        </Box>
      </Flex>

      {/* mobile Banner */}
      <Box
        display={{ base: "flex", md: "none" }}
        bg="primaryColor"
        w="100%"
        overflowX="auto"
        flex="1"
      >
        <Flex
          w={"150%"}
          mb={6}
          pt="5"
          px="4"
          justify="space-around"
          gap={4}
          align="start"
        >
          {stats.map((stat) => (
            <Box
              key={stat.id}
              flex="1"
              textAlign="left"
              ml={2}
              w="200px"
              // borderRight={stat.id !== stats.length ? "1px solid" : "none"}
              // borderColor="gray.200"
            >
              <Heading fontSize="2xl" color="white" mx="auto">
                {stat.value}
              </Heading>
              <Heading fontSize="xs" mt={6} color="gray.300" mx="auto">
                {stat.label}
              </Heading>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* desktop Banner */}
      <Flex
        display={{ base: "none", md: "flex" }}
        bg="primaryColor"
        rounded={{ md: "2xl", lg: "4xl" }}
        mx={{ md: 4, lg: 16 }}
        mb={6}
        mt={{ md: "-80px", lg: "-90px" }}
        py={{ base: 6, md: 12, lg: 20 }}
        px={{ base: 6, md: 2, lg: 12 }}
        justify="space-around"
        align="start"
      >
        {stats.map((stat) => (
          <Box
            key={stat.id}
            flex="1"
            mx={4}
            textAlign="center"
            // borderRight={stat.id !== stats.length ? "1px solid" : "none"}
            // borderColor="gray.200"
          >
            <Heading
              fontSize={{ md: "5xl", lg: "6xl" }}
              color="white"
              mx="auto"
            >
              {stat.value}
            </Heading>
            <Heading fontSize="sm" mt={6} color="gray.300" mx="auto">
              {stat.label}
            </Heading>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Hero;
