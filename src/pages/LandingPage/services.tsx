import { Box, Image, Grid, Heading, Icon, Text } from "@chakra-ui/react";

import { AiFillDollarCircle } from "react-icons/ai";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import { MdTimer } from "react-icons/md";
import orangeBlob from "@/assets/landing-page/second_orange_line.png";

const Services = () => {
  const services = [
    {
      label: "One-on-One Teaching",
      icon: MdOutlinePeopleAlt,
      color: "#FEA7C7",
      desc: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },

    {
      label: "Affordable Prices",
      icon: AiFillDollarCircle,
      color: "#A7CF4B",
      desc: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      label: "24/7 Avialability",
      icon: BsFillCalendarCheckFill,
      color: "#F0C933",
      desc: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      label: "Flexible Timing",
      icon: MdTimer,
      color: "#7478EC",
      desc: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];
  return (
    <Box
      my={{ base: 10, md: 20 }}
      px={{ base: 2, md: 4, lg: 12 }}
      py={{ base: 12, md: 0 }}
    >
      <Heading
        as="h4"
        textAlign="center"
        fontSize="md"
        fontWeight="bold"
        color="#FD8B3A"
      >
        OUR SERVICES
      </Heading>

      <Heading
        color="on_backgroundColor"
        textAlign="center"
        mb={5}
        fontWeight="300"
        fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
        lineHeight="1.2"
        w={{ base: "90%", md: "70%", lg: "50%" }}
        mx="auto"
      >
        Online tutoring services <br /> at{" "}
        <span style={{ color: "#206CE1", fontWeight: "bold" }}>
          Indomitable
          <Image
            src={orangeBlob}
            alt="orange-blob"
            ml={{ base: 28, md: 48, lg: 56 }}
            w={{ base: 44, md: 48, lg: "64" }}
            position="absolute"
          />
        </span>
      </Heading>

      <Grid
        templateColumns={{
          base: "repeat(auto-fill, minmax(200px, 1fr))",
          md: "repeat(auto-fill, minmax(245px, 1fr))",
          lg: "repeat(auto-fill, minmax(250px, 1fr))",
        }}
        gap={{ base: 4, md: 8, lg: 6 }}
        py={{ base: 4, md: 6 }}
      >
        {services.map((service) => (
          <Box
            p={4}
            key={service.label}
            display="flex"
            flexDirection="column"
            alignItems={{ base: "center", lg: "start" }}
            w={{ base: "100%", lg: "full" }}
            m={"auto"}
            bg={{ base: "textFieldColor", md: "none" }}
          >
            <Box
              w={{ base: "13.5%", md: "15%", lg: "18%" }}
              py={3}
              px={3}
              bg={service.color}
              rounded="2xl"
            >
              <Icon
                as={service.icon}
                boxSize={6}
                color="white"
                mb={4}
                m="auto"
              />
            </Box>

            <Text
              as="h3"
              fontSize="md"
              fontWeight="semibold"
              mt={4}
              mb={2}
              color="on_backgroundColor"
            >
              {service.label}
            </Text>
            <Text
              textAlign={{ base: "center", lg: "left" }}
              w='90%'
              fontSize="sm"
              color="on_backgroundColor"
              opacity={0.8}
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
