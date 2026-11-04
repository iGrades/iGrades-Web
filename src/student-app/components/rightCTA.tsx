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
            fontSize={{ base: "14px", sm: "16px", md: "17px" }}
            fontWeight="800"
            color="white"
            lineHeight="shorter"
          >
            Take quiz
          </Text>
          <Flex
            borderRadius="full"
            boxSize={{ base: "26px", sm: "28px" }}
            bg="white"
            align="center"
            justify="center"
            flexShrink={0}
            boxShadow="0 1px 3px rgba(0,0,0,0.1)"
          >
            <Image
              src={quizIcon}
              alt="Quiz icon"
              boxSize={{ base: "14px", sm: "15px" }}
              objectFit="contain"
            />
          </Flex>
        </Flex>

        {/* Central Circular Badge with dark blue ring */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          w={{ base: "70px", sm: "78px", md: "84px" }}
          h={{ base: "70px", sm: "78px", md: "84px" }}
          borderRadius="full"
          border={{ base: "3.5px solid", md: "4px solid" }}
          borderColor="#185BA9"
          bg="transparent"
          mx="auto"
          my={{ base: 1.5, sm: 2 }}
          textAlign="center"
        >
          <Text
            fontSize={{ base: "17px", sm: "20px", md: "22px" }}
            fontWeight="800"
            color="white"
            lineHeight="1"
          >
            0%
          </Text>
          <Text
            fontSize={{ base: "10px", sm: "10.5px" }}
            fontWeight="600"
            color="white"
            opacity={0.95}
            lineHeight="1.1"
            mt="2px"
            letterSpacing="tight"
          >
            no quiz yet
          </Text>
        </Flex>

        {/* Bottom Description Text */}
        <Text
          fontSize={{ base: "11px", sm: "12px", md: "12.5px" }}
          color="white"
          opacity={0.95}
          lineHeight="1.35"
        >
          Access your results and evaluate your performance instantly.
        </Text>
      </Flex>

      {/* 2. Get a Tutor Box */}
      <Flex
        bg={{ base: "#FFF8EE", _dark: "rgba(234, 88, 12, 0.12)" }}
        border="1px solid"
        borderColor={{ base: "#FED7AA", _dark: "rgba(234, 88, 12, 0.3)" }}
        direction="column"
        justify="space-between"
        p={{ base: 3.5, sm: 4, md: 5 }}
        borderRadius="2xl"
        cursor="pointer"
        transition="all 0.2s"
        minH={{ base: "155px", sm: "170px", md: "185px" }}
        boxShadow={{ base: "0 1px 4px rgba(254, 215, 170, 0.2)", _dark: "0 2px 8px rgba(0, 0, 0, 0.3)" }}
        _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)" }}
        onClick={() => setCurrentStudentPage("learn")}
      >
        {/* Top Header */}
        <Flex justify="space-between" align="center" w="full">
          <Text
            fontSize={{ base: "14px", sm: "16px", md: "17px" }}
            fontWeight="800"
            color={{ base: "#1E293B", _dark: "#F8FAFC" }}
            lineHeight="shorter"
          >
            Get a Tutor
          </Text>
          <Flex
            borderRadius="full"
            boxSize={{ base: "26px", sm: "28px" }}
            bg={{ base: "white", _dark: "#1A1A1A" }}
            border={{ base: "none", _dark: "1px solid #262626" }}
            align="center"
            justify="center"
            flexShrink={0}
            boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          >
            <Image
              src={tutorIcon}
              alt="Tutor icon"
              boxSize={{ base: "14px", sm: "15px" }}
              objectFit="contain"
            />
          </Flex>
        </Flex>

        {/* Central Tutor Graphic */}
        <Flex justify="center" align="center" my={{ base: 1.5, sm: 2 }}>
          <Image
            src={tutorImg}
            height={{ base: "52px", sm: "58px", md: "64px" }}
            width="auto"
            maxW="80px"
            objectFit="contain"
            alt="Tutor"
          />
        </Flex>

        {/* Bottom Description Text */}
        <Text
          fontSize={{ base: "11px", sm: "12px", md: "12.5px" }}
          color={{ base: "#475569", _dark: "#CBD5E1" }}
          lineHeight="1.35"
        >
          Connect with a qualified tutor and start learning immediately.
        </Text>
      </Flex>
    </SimpleGrid>
  );
};

export default RightCTA;
