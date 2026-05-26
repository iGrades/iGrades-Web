import { Box, Grid, Heading, Text } from "@chakra-ui/react";

const Goals = () => {
  const goals = [
    {
      num: "01",
      title: "Contributing to Academic Excellence",
      color: "#FEA7C7",
      desc: "Delivering targeted improvement and measurable growth through tailored materials and direct One-on-One sessions.",
    },
    {
      num: "02",
      title: "Reducing Examination Malpractice",
      color: "#A7CF4B",
      desc: "Empowering honest academic success by replacing shortcuts with mastery, thorough mock preparation, and AI-guided study assistants.",
    },
    {
      num: "03",
      title: "Building Student Confidence",
      color: "#7478EC",
      desc: "Nurturing an unstoppable mindset through flexible, low-stress learning hours, engaging sessions, and committed, encouraging mentors.",
    },
  ];

  return (
    <Box
      my={{ base: 14, md: 24 }}
      px={{ base: 4, md: 8, lg: 16 }}
      w='full'
      mx="auto"
    >
      {/* ── Header Area ── */}
      <Box textAlign="center" mb={{ base: 12, md: 16 }}>
        <Heading
          as="h4"
          fontSize="md"
          fontWeight="bold"
          color="#FD8B3A"
          letterSpacing="widest"
          mb={3}
        >
          OUR VISION
        </Heading>
        <Heading
          color="on_backgroundColor"
          fontWeight="bold"
          fontSize={{ base: "3xl", md: "4xl" }}
        >
          The Goals We Strive For
        </Heading>
      </Box>

      {/* ── Unique 3-Column Stepped Card Layout ── */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={{ base: 8, md: 6, lg: 8 }}
      >
        {goals.map((goal, idx) => (
          <Box
            key={goal.num}
            position="relative"
            bg="white"
            p={{ base: 6, lg: 8 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.02)"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              borderColor: goal.color
            }}
          >
            {/* Massive Stylized Numeric Accent Overlay */}
            <Text
              position="absolute"
              top="0px"
              right="15px"
              fontSize={{ base: "5xl", lg: "6xl" }}
              fontWeight="900"
              color={goal.color}
              opacity={0.12}
              userSelect="none"
              lineHeight="1"
            >
              {goal.num}
            </Text>

            {/* Content Top */}
            <Box zIndex={1}>
              {/* Subtle visual link line between horizontal steps on desktop */}
              {idx < 2 && (
                <Box
                  display={{ base: "none", md: "block" }}
                  position="absolute"
                  top="12%"
                  right="-15%"
                  w="30%"
                  h="2px"
                  bgGradient={`linear(to-r, ${goal.color}, transparent)`}
                  zIndex={0}
                />
              )}

              {/* Decorative Pill Header Indicator */}
              <Box
                w="32px"
                h="6px"
                borderRadius="full"
                bg={goal.color}
                mb={5}
              />

              <Heading
                as="h3"
                fontSize={{ base: "lg", lg: "xl" }}
                fontWeight="bold"
                color="on_backgroundColor"
                lineHeight="1.4"
                mb={3}
              >
                {goal.title}
              </Heading>
            </Box>

            {/* Description Body */}
            <Text
              fontSize="sm"
              color="on_backgroundColor"
              opacity={0.7}
              lineHeight="1.7"
              zIndex={1}
            >
              {goal.desc}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default Goals;