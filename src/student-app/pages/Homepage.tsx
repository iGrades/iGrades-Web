import { Flex, Box } from "@chakra-ui/react";
import MyClasses from "../layouts/myClasses"; 
import HomeChart from "../components/chart";
import Analytics from "../components/analytics";
import RightCTA from "../components/rightCTA";
import AIChatbot from "../components/AIChatbot";

const Homepage = () => {
  return (
    <Box>
      <Flex
        w="95%"
        m="auto"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="stretch"
        gap={5}
      >
        <Box w={{ base: "full", lg: "80%" }} mb={{ md: 20, lg: 0 }}>
          <MyClasses />
          <Flex direction={{ base: "column", md: "row" }} align="stretch" h="full">
            <HomeChart />
            <Analytics />
          </Flex>
        </Box>
        <Box
          w={{ base: "full", md: "35%", lg: "20%" }}
          mb={{ base: 20, lg: 0 }}
          position={{ md: "sticky" }}
          top={{ md: "0" }}
          alignSelf="flex-start"
        >
          <RightCTA />
        </Box>
        <AIChatbot />
      </Flex>
    </Box>
  );
};

export default Homepage;