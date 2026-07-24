
import { Box, Image, Heading } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

import mathsBg from "@/assets/courses/genMaths_bg.png";
import engBg from "@/assets/courses/eng_bg.png";
import accBg from "@/assets/courses/acc_bg.png";
import agricBg from "@/assets/courses/agric_bg.png";
import basicSciBg from "@/assets/courses/basicSci_bg.png";
import basicTechBg from "@/assets/courses/basicTech_bg.png";
import bioBg from "@/assets/courses/bio_bg.png";
import businessBg from "@/assets/courses/business_bg.png";
import chemBg from "@/assets/courses/chem_bg.png";
import compBg from "@/assets/courses/comp_bg.png";
import econsBg from "@/assets/courses/econs_bg.png";
import geoBg from "@/assets/courses/geo_bg.png";
import govtBg from "@/assets/courses/govt_bg.png";
import phyBg from "@/assets/courses/phy_bg.png";

const Courses = () => {
  const courses = [
    { name: "Mathematics", img: mathsBg },
    { name: "English", img: engBg },
    { name: "Accounting", img: accBg },
    { name: "Agric Science", img: agricBg },
    { name: "Basic Science", img: basicSciBg },
    { name: "Basic Technology", img: basicTechBg },
    { name: "Biology", img: bioBg },
    { name: "Business Studies", img: businessBg },
    { name: "Chemistry", img: chemBg },
    { name: "Computer Studies", img: compBg },
    { name: "Economics", img: econsBg },
    { name: "Geography", img: geoBg },
    { name: "Government", img: govtBg },
    { name: "Physics", img: phyBg },
  ];

  // scroll the whole row across and leave empty space
  const slide = keyframes`
    0%   { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  `;

  return (
    <Box my={20}>
      <Box textAlign="center" mb={10} px={{ base: 2, md: 4, lg: 12 }} >
        <Heading as="h4" fontSize="md" fontWeight="bold" color="#FD8B3A">
          COURSES
        </Heading>

        <Heading as="h2" w={{base:'85%', md: '65%', lg: '65%'}} m='auto' lineHeight="1.1" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} mb={6} color="on_backgroundColor">
          We offer a wide range of subjects or courses relating to your preference
        </Heading>
      </Box>
      <Box
        width="100%"
        overflow="hidden"
        py={4}
        css={{
          ":hover .marquee": { animationPlayState: "paused" },
          "@media (prefers-reduced-motion: reduce)": {
            ".marquee": { animation: "none" },
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={4} p={4} bg='gray.100'>
          <Box
            className="marquee"
            display="inline-flex"
            gap={4}
            animation={`${slide} 30s linear infinite`}
            minW="100%"
          >
            {courses.map((course, idx) => (
              <Image
                key={idx}
                src={course.img}
                alt={course.name}
                objectFit="cover"
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Courses;
