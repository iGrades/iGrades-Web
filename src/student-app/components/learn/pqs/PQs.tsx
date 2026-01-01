import { Box, Heading, Grid, Text, Image, Flex} from "@chakra-ui/react";

import { useState } from "react";
import { GoArrowRight } from "react-icons/go";
import waec_img from "@/assets/waec_logo.png";
import jamb_img from "@/assets/jamb_logo.png";
import neco_img from "@/assets/neco_logo.png";
import SubjectsList from "./subjectList";


const PQs = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [showSubjectList, setShowSubjectList] = useState(false);

  const examTypes = [
    { type: "WAEC", name: "West African Examinations Council", img: waec_img },

    { type: "NECO", name: "National Examinations Council", img: neco_img },
    {
      type: "JAMB",
      name: "Joint Admissions and Matriculation Board",
      img: jamb_img,
    },
  ];

  const handleClick = (examType: string) => {
    setSelectedExam(examType);
    setShowSubjectList(true);
  }


  return (
    <>
     {showSubjectList ? (
      <SubjectsList onBack={() => setShowSubjectList(false)} selectedExam={selectedExam} />
     ) : (
       <Box bg="white" rounded="lg" shadow="sm"  p={4} mb={20} h={{base: 'auto', lg: '75vh'}}>
        <Heading color="#333951">Select Exam Type</Heading>

        <Grid
          templateColumns={{
            base: "repeat(auto-fill, minmax(200px, 1fr))",
            md: "repeat(auto-fill, minmax(200px, 1fr))",
            lg: "repeat(auto-fill, minmax(250px, 1fr))",
          }}
          gap={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
          justifyItems="center"
          alignItems="center"
        >
          {examTypes.map((exam) => (
            <Box
              key={exam.type}
              p={4}
              w={{ base: "100%", lg: "90%" }}
              h={{ base: "auto", md: "72", lg: "96" }}
              bg="textFieldColor"
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ boxShadow: "sm" }}
              cursor="pointer"
              onClick={handleClick.bind(null, exam.type)}
            >
              <Heading fontSize="xl" color="#333951" mb={2}>
                {exam.type}
              </Heading>
              <Text color="#333951" w={{md: 40}}>
                {exam.name}
              </Text>
              <Flex
                justify="center"
                align="center"
                mt={{ base: 2, md: 4, lg: 2 }}
                mb={2}
              >
                <Image
                  src={exam.img}
                  alt={exam.type}
                  height={{base: "200px", md: "170px", lg: "200px"}}
                  mt={{base: 6, md: -4, lg: 6}}
                  objectFit="cover"
                  p={{ base: 4, md: 5, lg: 3 }}
                />
              </Flex>
              <Flex justify="flex-end" align="center" my={{base: 4, md: -6, lg: 4}} fontWeight="500">
                <GoArrowRight size={24} color="#206CE1" />
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
     )}
    </>
  );
};

export default PQs;
