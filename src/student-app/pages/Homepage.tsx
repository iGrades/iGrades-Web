import { Box } from "@chakra-ui/react";
import MyClasses from "../layouts/myClasses";
import Analytics from "../components/analytics";
import RightCTA from "../components/rightCTA";
import HomeChart from "../components/chart";
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
    <Box pt={2} pb={{ base: 28, md: 12 }}>
      <Box w={{ base: "95%", xl: "92%" }} maxW="1200px" m="auto">
        {/* 1. Number of courses and registered courses */}
        <MyClasses />

        {/* 2. Learning Analytics: shows only 1 subject (highest %) at first glance, 'See more' opens bottom-docked popup */}
        <Analytics />

        {/* 3. Take quiz and Get a tutor box (Learn with videos removed) */}
        <RightCTA />

        {/* 4. Quiz Analytics: line graph maintained, 'Last 4 Months' quotes removed */}
        <HomeChart />

        {/* 5. Exam Readiness Indicator section */}
        <ExamReadinessCard readiness={readiness} loading={loading} />

        {/* 6. What Should I Study Next section */}
        <NextStudyRecommendationCard
          recommendation={primaryRecommendation}
          allRecommendations={recommendations}
          targetExam={readiness?.targetExam || "WAEC"}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Homepage;