import {
  Box,
  Flex,
  Button,
  Image,
  Heading,
  Text,
} from "@chakra-ui/react";
import instructorsBg from "@/assets/landing-page/instructors_bg.png";
import studentsBg from "@/assets/landing-page/students_bg.png";
import resultsImg from "@/assets/landing-page/results_img.png";

const About = () => {
  const actions = [
    {
      label: "For Instructors",
      bgImage: instructorsBg,
      btnColor: "transparent",
      borderColor: "white",
      btnLabel: "Start a class today",
      hoverColor: "#23BDEEE5",
    },
    {
      label: "For Students",
      bgImage: studentsBg,
      btnColor: "#23BDEEE5",
      borderColor: "transparent",
      btnLabel: "Enter access code",
      hoverColor: "transparent",
    },
  ];
  return (
    <Box my={20} px={{ base: 2, md: "4", lg: 12 }} py={{ base: 6,  lg: 4 }}>
      <Box
        w={{ base: "95%", md: "90%", lg: "65%" }}
        m="auto"
        textAlign={"center"}
        mb={20}
      >
        {" "}
        <Heading
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          mb={6}
          color="on_backgroundColor"
          lineHeight="1.2"
        >
          What is <span style={{ color: "#FD8B3A" }}>iGrade?</span>
        </Heading>
        <Text fontSize="md" color="on_backgroundColor" opacity={0.9}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique
          illo tenetur illum voluptas enim impedit veniam quis dolore possimus
          tempora, neque officiis accusamus sed laboriosam, blanditiis iure.
          Magnam, ex molestias illum voluptas enim impedit veniam quis dolore
          possimus tempora, neque officiis accusamus sed laboriosam, blanditiis
          iure. Magnam, ex molestias.
        </Text>
      </Box>

      <Flex gap={6} direction={{ base: "column", lg: "row" }} mb={20}>
        {actions.map((action) => (
          <Box
            key={action.label}
            flex={{base: 'none', lg: 1}}
            mx={2}
            alignContent="center"
            justifyItems="center"
            textAlign="center"
            position="relative"
            height={{ base: "300px", md: "400px", lg: "375px" }}
            borderRadius="15px"
            overflow="hidden"
            boxShadow="md"
            bgImage={`url(${action.bgImage})`}
            bgSize="cover"
            // bgPosition="center"
          >
            <Heading
              color="white"
              fontSize="3xl"
              fontWeight="500"
              textTransform="uppercase"
              my={2}
            >
              {action.label}
            </Heading>
            <Button
              p={8}
              w={56}
              my={4}
              bg={action.btnColor}
              border="1px solid"
              borderColor={action.borderColor}
              rounded="3xl"
              color="white"
              fontSize="md"
              _hover={{ bg: "black", borderColor: "white", opacity: 0.7 }}
            >
              {action.btnLabel}
            </Button>
          </Box>
        ))}
      </Flex>

      {/* Assessmennt, Quizzes and Tests */}
      <Flex
        direction={{ base: "column", md: "row" }}
        my={{ base: 0, md: 10 }}
        justify="space-between"
        align="center"
        gap={2}
      >
        <Box
          w={{ base: "100%", md: "50%", lg: "55%" }}
          mt={{ base: 0, lg: 10 }}
          ml={{ base: 5, md: 0, lg: 10 }}
        >
          <Image src={resultsImg} alt="results_image" />
        </Box>
        <Box
          w={{ base: "100%", md: "40%" }}
          textAlign={{ base: "center", md: "left" }}
          mr={{ base: 0, lg: 10 }}
          mt={{ base: 10, md: 0, lg: 10 }}
        >
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            color="on_backgroundColor"
            lineHeight="1.2"
          >
            Assessments, <span style={{ color: "#FD8B3A" }}>Quizzes</span>,
            Tests
          </Heading>
          <Text fontSize="lg" color="on_backgroundColor" opacity={0.9} mt={6}>
            Easily launch live assignments, quizzes and tests. Student results
            are automatically entered in the online gradebook
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default About;
