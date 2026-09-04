import { Flex, Box } from "@chakra-ui/react";
import MyClasses from "../layouts/myClasses"; 
import HomeChart from "../components/chart";
import Analytics from "../components/analytics";
import RightCTA from "../components/rightCTA";
import { ExamReadinessCard } from "../components/readiness/ExamReadinessCard";
import { NextStudyRecommendationCard } from "../components/recommendations/NextStudyRecommendationCard";
import { useExamReadiness } from "@/hooks/useExamReadiness";
import { useAuthdStudentData } from "../context/studentDataContext";

const Homepage = () => {
  const { authdStudent } = useAuthdStudentData();
  const { readiness, primaryRecommendation, recommendations, loading } = useExamReadiness(
    authdStudent?.id,
    authdStudent?.class
  );

  return (
    <Box pt={2}>
      <Flex
        w="95%"
        m="auto"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align="stretch"
        gap={5}
      >
        <Box w={{ base: "full", lg: "80%" }} mb={{ md: 20, lg: 0 }}>
          <MyClasses />
          <NextStudyRecommendationCard
            recommendation={primaryRecommendation}
            allRecommendations={recommendations}
            targetExam={readiness?.targetExam || "WAEC"}
            loading={loading}
          />
          <ExamReadinessCard readiness={readiness} loading={loading} />
          <Flex direction={{ base: "column", md: "row" }} align="stretch" h="full">
            <HomeChart />
            <Analytics />
          </Flex>
        </Box>
        <Box
          w={{ base: "full", lg: "20%" }}
          mb={{ base: 20, lg: 0 }}
          position={{ md: "sticky" }}
          top={{ md: "0" }}
          alignSelf="flex-start"
        >
          <RightCTA />
        </Box>
      </Flex>
    </Box>
  );
};

export default Homepage;