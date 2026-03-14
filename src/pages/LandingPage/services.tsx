import { Box, Grid, Heading, Icon, Image, Text } from "@chakra-ui/react";

import { AiFillDollarCircle } from "react-icons/ai";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import { MdTimer } from "react-icons/md";
import orangeBlob from "@/assets/landing-page/second_orange_line.png";

const Services = () => {
  const services = [
    {
      label: "One-on-One Session",
      icon: <MdOutlinePeopleAlt />,
      color: "#FEA7C7",
      desc: "Personalized live sessions that give students focused attention, tailored explanations, and direct academic support to improve understanding and performance.",
    },
    {
      label: "Affordable Packages",
      icon: <AiFillDollarCircle />,
      color: "#A7CF4B",
      desc: "Flexible and student-friendly pricing that makes quality education accessible without compromising learning standards.",
    },
    {
      label: "24/7 Accessibility",
      icon: <BsFillCalendarCheckFill />,
      color: "#F0C933",
      desc: "Access learning support anytime, ensuring help is always available when students need it most.",
    },
    {
      label: "Flexible Hours",
      icon: <MdTimer />,
      color: "#7478EC",
      desc: "Learn or teach at convenient times that fit individual schedules, allowing full control over lesson timing and pace, without fixed classroom constraints.",
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
        // Fix 6: position="relative" so the absolute blob is contained here
        position="relative"
      >
        <Heading
          color="on_backgroundColor"
          fontWeight="300"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          lineHeight="1.2"
        >
          Online tutoring services <br /> at{" "}
          {/* Fix 2 & 6: span is relative so blob positions against "Indomitable" */}
          <Box as="span" color="#206CE1" fontWeight="bold" position="relative" display="inline-block">
            Indomitable
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
        w={{ base: "100%", md: "90%", lg: "85%" }}
        mx="auto"
      >
        {services.map((service) => (
          <Box
            key={service.label}
            p={6}
            display="flex"
            flexDirection="column"
            alignItems={{ base: "center", lg: "flex-start" }}
            // Fix 5: consistent card style with border so all cards look uniform
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)"
            // Fix 3: removed m="auto" so grid gap works correctly
            // Fix 5: stretch to equal height
            h="full"
          >
            {/* Fix 1: fixed icon circle size instead of % */}
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