import { Box, Grid, Heading, Icon, Image, Text } from "@chakra-ui/react";

import { MdOutlinePeopleAlt } from "react-icons/md";
import { LuYoutube, LuFileText, LuClock } from "react-icons/lu"; 
import orangeBlob from "@/assets/landing-page/second_orange_line.png";

const Services = () => {
  const services = [
    {
      label: "One-on-One Session",
      icon: <MdOutlinePeopleAlt />,
      color: "#FEA7C7",
      desc: "Every lesson is personalized and tailored fit for every student. Every tutor’s goal is to give direct academic support, simpler and improved lessons to help transform a student's performance and grades.",
    },
    {
      label: "Video Contents",
      icon: <LuYoutube />,
      color: "#A7CF4B",
      desc: "High-quality, bite-sized video lessons breaking down complex concepts. Students can learn at their own pace, pause, and replay core topics anytime they need a refresher.",
    },
    {
      label: "PDF Contents",
      icon: <LuFileText />,
      color: "#F0C933",
      desc: "Comprehensive study guides, summary notes, and downloadable worksheets tailored to the curriculum to reinforce offline learning and revision.",
    },
    {
      label: "Test and Exam Practices",
      icon: <LuClock />,
      color: "#7478EC",
      desc: "Every lesson comes with test and exam Practices with an AI assistant to guide and not tell during preparations.",
    },
  ];

  return (
    <Box
      my={{ base: 10, md: 20 }}
      px={{ base: 2, md: 4, lg: 12 }}
      py={{ base: 12, md: 0 }}
    >
      {/* ── Section label ── */}
      <Heading
        as="h4"
        textAlign="center"
        fontSize="md"
        fontWeight="bold"
        color="#FD8B3A"
        mb={3}
      >
        OUR SERVICES
      </Heading>

      {/* ── Section heading with decorative blob ── */}
      <Box
        textAlign="center"
        mb={10}
        w={{ base: "90%", md: "70%", lg: "50%" }}
        mx="auto"
        position="relative"
      >
        <Heading
          color="on_backgroundColor"
          fontWeight="300"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          lineHeight="1.2"
        >
          What we offer <br /> at{" "}
          <Box as="span" color="#206CE1" fontWeight="bold" position="relative" display="inline-block">
            iGrades
            <Image
              src={orangeBlob}
              alt=""
              aria-hidden="true"
              position="absolute"
              bottom="-14px"
              left="50%"
              transform="translateX(-50%)"
              w={{ base: "140px", md: "180px", lg: "220px" }}
              pointerEvents="none"
            />
          </Box>
        </Heading>
      </Box>

      {/* ── Service cards ── */}
      <Grid
        templateColumns={{
          base: "repeat(auto-fill, minmax(200px, 1fr))",
          md: "repeat(auto-fill, minmax(245px, 1fr))",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 4, md: 6 }}
        w={{ base: "100%", md: "90%" }}
        mx="auto"
      >
        {services.map((service) => (
          <Box
            key={service.label}
            p={6}
            display="flex"
            flexDirection="column"
            alignItems={{ base: "center", lg: "flex-start" }}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)"
            h="full"
          >
            <Box
              w="48px"
              h="48px"
              bg={service.color}
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              mb={4}
            >
              <Icon boxSize={5} color="white">
                {service.icon}
              </Icon>
            </Box>

            <Text
              as="h3"
              fontSize="md"
              fontWeight="semibold"
              mb={2}
              color="on_backgroundColor"
            >
              {service.label}
            </Text>
            <Text
              textAlign={{ base: "center", lg: "left" }}
              fontSize="sm"
              color="on_backgroundColor"
              opacity={0.7}
              lineHeight="1.6"
            >
              {service.desc}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default Services;