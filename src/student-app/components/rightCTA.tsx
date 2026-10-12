import {
  Flex,
  Text,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import tutorImg from "../../assets/tutor-icon.png";
import tutorIcon from "../../assets/cube_arrow_right.png";
import quizIcon from "../../assets/quiz_check.png";

const RightCTA = () => {
  const { setCurrentStudentPage } = useNavigationStore();

  return (
    <SimpleGrid
      columns={2}
      gap={{ base: 3, sm: 4 }}
      w="full"
      my={4}
    >
      {/* 1. Take Quiz Box */}
      <Flex
        bg="#288AE4"
        direction="column"
        justify="space-between"
        p={{ base: 3.5, sm: 4, md: 5 }}
        borderRadius="2xl"
        cursor="pointer"
        transition="all 0.2s"
        minH={{ base: "155px", sm: "170px", md: "185px" }}
        boxShadow="0 2px 6px rgba(40, 138, 228, 0.2)"
        _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(40, 138, 228, 0.3)" }}
        onClick={() => setCurrentStudentPage("quiz")}
      >
        {/* Top Header */}
        <Flex justify="space-between" align="center" w="full">
          <Text
            fontSize={{ base: "13px", sm: "14px", md: "15px" }}
            fontWeight="700"
            color="white"
            lineHeight="shorter"
          >
            Take quiz
          </Text>
          <Flex
            borderRadius="full"
            boxSize={{ base: "22px", sm: "24px" }}
            bg="white"
            align="center"
            justify="center"
            flexShrink={0}
            boxShadow="0 1px 2px rgba(0,0,0,0.08)"
          >
            <Image
              src={quizIcon}
              alt="Quiz icon"
              boxSize={{ base: "12px", sm: "13px" }}
              objectFit="contain"
            />
          </Flex>
        </Flex>

        {/* Central Circular Badge with dark blue ring */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          w={{ base: "66px", sm: "74px", md: "80px" }}
          h={{ base: "66px", sm: "74px", md: "80px" }}
          borderRadius="full"
          border={{ base: "3.5px solid", md: "4px solid" }}
          borderColor="#185BA9"
          bg="transparent"
          mx="auto"
          my={{ base: 1.5, sm: 2 }}
          textAlign="center"
        >
          <Text
            fontSize={{ base: "15px", sm: "17px", md: "19px" }}
            fontWeight="800"
            color="white"
            lineHeight="1"
          >
            0%
          </Text>
          <Text
            fontSize={{ base: "8.5px", sm: "9px", md: "9.5px" }}
            fontWeight="500"
            color="white"
            opacity={0.92}
            lineHeight="1.1"
            mt="2px"
            letterSpacing="tight"
          >
            no quiz yet
          </Text>
        </Flex>

        {/* Bottom Description Text */}
        <Text
          fontSize={{ base: "9.5px", sm: "10.5px", md: "11px" }}
          color="white"
          opacity={0.92}
          lineHeight="1.3"
        >
          Access your results and evaluate your performance instantly.
        </Text>
      </Flex>

      {/* 2. Get a Tutor Box */}
      <Flex
        bg="#FFF8EE"
        border="1px solid"
        borderColor="#FED7AA"
        direction="column"
        justify="space-between"
        p={{ base: 3.5, sm: 4, md: 5 }}
        borderRadius="2xl"
        cursor="pointer"
        transition="all 0.2s"
        minH={{ base: "155px", sm: "170px", md: "185px" }}
        boxShadow="0 1px 4px rgba(254, 215, 170, 0.2)"
        _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(234, 88, 12, 0.12)" }}
        onClick={() => setCurrentStudentPage("learn")}
      >
        {/* Top Header */}
        <Flex justify="space-between" align="center" w="full">
          <Text
            fontSize={{ base: "13px", sm: "14px", md: "15px" }}
            fontWeight="700"
            color="#1E293B"
            lineHeight="shorter"
          >
            Get a Tutor
          </Text>
          <Flex
            borderRadius="full"
            boxSize={{ base: "22px", sm: "24px" }}
            bg="white"
            align="center"
            justify="center"
            flexShrink={0}
            boxShadow="0 1px 3px rgba(0,0,0,0.06)"
          >
            <Image
              src={tutorIcon}
              alt="Tutor icon"
              boxSize={{ base: "12px", sm: "13px" }}
              objectFit="contain"
            />
          </Flex>
        </Flex>

        {/* Central Tutor Graphic */}
        <Flex justify="center" align="center" my={{ base: 1.5, sm: 2 }}>
          <Image
            src={tutorImg}
            height={{ base: "48px", sm: "54px", md: "58px" }}
            width="auto"
            maxW="70px"
            objectFit="contain"
            alt="Tutor"
          />
        </Flex>

        {/* Bottom Description Text */}
        <Text
          fontSize={{ base: "9.5px", sm: "10.5px", md: "11px" }}
          color="#475569"
          lineHeight="1.3"
        >
          Connect with a qualified tutor and start learning immediately.
        </Text>
      </Flex>
    </SimpleGrid>
  );
};

export default RightCTA;
