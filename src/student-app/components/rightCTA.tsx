import {
  Box,
  Flex,
  Text,
  Icon,
  Image,
  AbsoluteCenter,
  ProgressCircle,
} from "@chakra-ui/react";
import tutorImg from "../../assets/tutor-icon.png";
import tutorIcon from "../../assets/cube_arrow_right.png";
import quizIcon from "../../assets/quiz_check.png";


const RightCTA = () => {
  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={{ md: 5}} p={4}>
      
      {/* quiz box */}
      <Flex
        bg="#288AE4"
        direction={"column"}
        align={"center"}
        p={4}
        borderRadius="lg"
        mb={4}
      >
        <Flex justify="space-between" w={"full"}>
          <Text fontSize="xs" fontWeight="700" color={"white"}>
            Take quiz
          </Text>
          <Icon
            borderRadius="full"
            cursor="pointer"
            boxSize="25px"
            bg="white"
            color="#288AE4"
            rounded="full"
            mb={{base: 5, md: 2, lg: 5}}
            p={1}
          >
            <img src={quizIcon} alt="quiz icon" />
          </Icon>
        </Flex>
        <ProgressCircle.Root size={"xl"} value={0}>
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
          <AbsoluteCenter>
            <ProgressCircle.ValueText color={"white"} fontSize={"lg"} />
          </AbsoluteCenter>
        </ProgressCircle.Root>

        <Text fontSize="xs" color="white" mt={{base: 4, md: 2, lg: 4}}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Text>
      </Flex>
      
      {/* tutor box */}
      <Flex
        bg="#F4B4751A"
        direction={"column"}
        align={"center"}
        p={4}
        borderRadius="lg"
        mb={4}
      >
        <Flex justify="space-between" w={"full"}>
          <Text fontSize="xs" fontWeight="700" color={"black"}>
            Get a Tutor
          </Text>
          <Icon
            borderRadius="full"
            cursor="pointer"
            boxSize="25px"
            bg="white"
            color="#288AE4"
            rounded="full"
            mb={{base: 5, md: 2, lg: 5}}
            p={1}
          >
            <img src={tutorIcon} alt="quiz icon" />
          </Icon>
        </Flex>
        <Image src={tutorImg} height={{base: "100px", md: "80px", lg: "100px"}} />

        <Text fontSize="xs" color="black" mt={{base: 4, md: 2, lg: 4}}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Text>
      </Flex>
      
      {/* videos box */}
      <Flex
        bg="#F4B4751A"
        direction={"column"}
        align={"center"}
        p={4}
        borderRadius="lg"
        mb={0}
      >
        <Flex justify="space-between" w={"full"}>
          <Text fontSize="xs" fontWeight="700" color={"black"}>
            Learn with Videos
          </Text>
          <Icon
            borderRadius="full"
            cursor="pointer"
            boxSize="25px"
            bg="white"
            color="#288AE4"
            rounded="full"
            mb={{base: 5, md: 4, lg: 5}}
            p={1}
          >
            <img src={tutorIcon} alt="quiz icon" />
          </Icon>
        </Flex>
        <Image src={tutorImg} height={{base: "100px", md: "80px", lg: "100px"}} />

        <Text fontSize="xs" color="black" mt={{base: 4, md: 2, lg: 4}}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </Text>
      </Flex>
    </Box>
  );
};

export default RightCTA;
