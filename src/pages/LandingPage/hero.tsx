import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa6";
import headerPic from "@/assets/landing-page/header-pic.png";
import orangeBlob from "@/assets/landing-page/orange_line.png";

const Hero = () => {
  const words = ["Excellence", "Education", "Tutoring"];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
        setIsFading(false);
      }, 300);
      
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { id: 1, value: "50k+", label: "Potential Registered Students" },
    { id: 2, value: "20+", label: "Total Available Courses/Subjects" },
    { id: 3, value: "50+", label: "Potential Certified Tutors" },
    { id: 4, value: "5K+", label: "Accredited Quizzes" },
  ];

  return (

    <Box mb={{ base: 10, md: 20 }} mt={{ base: 0, md: -12 }}>
      <Flex
        as="section"
          direction={{ base: "column-reverse", md: "row" }}
          align={{ base: "center", md: "flex-start" }} 
          justify="space-between"
          px={{ base: 2, md: 4, lg: 12 }}
          py={{ base: 12, md: 6, lg: 0 }}
      >
        <Box
          w={{ base: "100%", md: "45%" }}
              mr={{ base: 0, md: 6, lg: 12 }}
              mb={{ base: 12, md: 0 }}
              pt={{ base: 0, md: "80px", lg: "110px", xl: "140px" }}
        >
          {/* Subheading Label */}
          <Text
            color="#FD8B3A"
            fontWeight="bold"
            fontSize="sm"
            letterSpacing="widest"
            mb={2}
            textAlign={{ base: "center", md: "left" }}
          >
            LEVEL UP YOUR LEARNING
          </Text>

          {/* Core Dynamic Heading */}
          <Heading
            as="h1"
            fontSize={{ base: "4xl", lg: "6xl" }}
            fontWeight="bold"
            mb={6}
            color="on_backgroundColor"
            lineHeight="1.2"
            textAlign={{ base: "center", md: "left" }}
          >
            We Are Making Our <br />
            <Box
              as="span"
              position="relative"
              display="inline-block"
              color="#206CE1"
              style={{
                opacity: isFading ? 0 : 1,
                transform: isFading ? "translateY(5px)" : "translateY(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              {words[currentWordIdx]}
              <Image
                src={orangeBlob}
                alt=""
                aria-hidden="true"
                position="absolute"
                bottom="-7px"
                left="50%" 
                transform="translateX(-50%)" 
                w="65%"
                pointerEvents="none"
              />
            </Box>{" "}
            Great <br /> Again
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
            Quality Education. Real Tutors. Flexible Learning at your convenience.
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
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              <FaPlay /> How it works
            </Button>
          </Flex>
        </Box>

        {/* Hero Image Side */}
        <Box w={{ base: "100%", md: "50%" }} flex="1">
          <Image
            src={headerPic}
            alt="Student learning happily"
            w="100%"
            h="auto"
          />
        </Box>
      </Flex>

      {/* Mobile Banner Panel (Restored Sizes) */}
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
            <Box key={stat.id} flex="1" textAlign="left" ml={2} w="200px">
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

      {/* Desktop Banner Panel (Restored Sizes) */}
      <Flex
        display={{ base: "none", md: "flex" }}
        bg="primaryColor"
        rounded={{ md: "2xl", lg: "4xl" }}
        mx={{ md: 4, lg: 16 }}
        mb={6}
        mt={{ md: "-92px", lg: "-102px" }}
        py={{ base: 6, md: 12, lg: 20 }}
        px={{ base: 6, md: 2, lg: 12 }}
        justify="space-around"
        align="start"
        position="relative"
        zIndex={2}
      >
        {stats.map((stat) => (
          <Box key={stat.id} flex="1" mx={4} textAlign="center">
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