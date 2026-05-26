import { Box, Grid, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { LuClock, LuPercent, LuSmartphone } from "react-icons/lu";

const Offers = () => {
  const offers = [
    {
      label: "24/7 Accessibility",
      icon: <LuSmartphone />,
      color: "#FEA7C7",
      desc: "You can access your lessons and practices anytime and anywhere.",
    },
    {
      label: "Flexible Hours",
      icon: <LuClock />,
      color: "#A7CF4B",
      desc: "Every lesson is suited for your learning schedule and time. You can come back anytime to continue right where you left off.",
    },
    {
      label: "Affordable Packages",
      icon: <LuPercent />,
      color: "#F0C933",
      desc: "Our service prices are budget and student-friendly, making quality learning easily affordable for all.",
    },
  ];

  return (
    <Box
      my={{ base: 10, md: 20 }}
      px={{ base: 4, md: 8, lg: 12}}
      py={{ base: 12, md: 16 }}
      bg="gray.50" // Subtle alternative background to separate sections
      borderRadius="2xl"
      w={{ base: "100%", md: "90%" }}
      mx="auto"
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1.3fr" }}
        gap={{ base: 10, lg: 16 }}
        alignItems="center"
      >
        {/* ── Left Column: Section Headers ── */}
        <VStack
          align={{ base: "center", lg: "flex-start" }}
          gap={4}
          textAlign={{ base: "center", lg: "left" }}
        >
          <Heading
            as="h4"
            fontSize="md"
            fontWeight="bold"
            color="#FD8B3A"
            letterSpacing="wider"
          >
            WHY CHOOSE US
          </Heading>
          
          <Heading
            color="on_backgroundColor"
            fontWeight="bold"
            fontSize={{ base: "3xl", md: "4xl" }}
            lineHeight="1.2"
          >
            What Makes Us <br /> Different
          </Heading>
          
          <Text 
            fontSize="sm" 
            color="on_backgroundColor" 
            opacity={0.6} 
            maxW="380px"
          >
            We balance accessibility, convenience, and low cost to deliver an exceptional study experience built completely around your personal life.
          </Text>
        </VStack>

        {/* ── Right Column: The 3 Offers stacked beautifully ── */}
        <Grid templateColumns="1fr" gap={6}>
          {offers.map((offer) => (
            <Box
              key={offer.label}
              p={6}
              display="flex"
              flexDirection={{ base: "column", sm: "row" }}
              alignItems={{ base: "center", sm: "flex-start" }}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="0 2px 8px rgba(0,0,0,0.04)"
              gap={5}
            >
              {/* Icon Container */}
              <Box
                w="48px"
                h="48px"
                bg={offer.color}
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon boxSize={5} color="white">
                  {offer.icon}
                </Icon>
              </Box>

              {/* Offer Text */}
              <VStack 
                align={{ base: "center", sm: "flex-start" }} 
                gap={1}
                textAlign={{ base: "center", sm: "left" }}
              >
                <Text
                  as="h3"
                  fontSize="md"
                  fontWeight="semibold"
                  color="on_backgroundColor"
                >
                  {offer.label}
                </Text>
                <Text
                  fontSize="sm"
                  color="on_backgroundColor"
                  opacity={0.7}
                  lineHeight="1.6"
                >
                  {offer.desc}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Offers;