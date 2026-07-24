import { Box, Icon, Text, Flex, IconButton } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { TbHomeFilled } from "react-icons/tb";
import { IoNewspaper } from "react-icons/io5";
import { TbBrandYoutubeFilled } from "react-icons/tb";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { StudentPage } from "../../store/usenavigationStore";


const Sidebar = () => {
  const { currentStudentPage, setCurrentStudentPage } = useNavigationStore();
  const { t } = useTranslation();

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: StudentPage;
  }[] = [
    { icon: TbHomeFilled, label: t("nav_home"), value: "home" },
    { icon: IoNewspaper, label: t("nav_quiz"), value: "quiz" },
    { icon: TbBrandYoutubeFilled, label: t("nav_learn"), value: "learn" },
    { icon: AiTwotoneSetting, label: t("nav_settings"), value: "settings" },
  ];
  return (
    <>
      <Box
        as="aside"
        display={{ base: "none", lg: "block" }}
        width="full"
        h="full"
        overflow="hidden"
        bg="white"
        px={4}
        py={10}
        shadow={"xs"}
        left={0}
        position="sticky"
        top="4px"
        // zIndex="1000"
      >

      
        
        {parentsAsideElem.map((item, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            mb={4}
            p={3}
            borderRadius="lg"
            cursor="pointer"
            color={
              currentStudentPage === item.value
                ? "primaryColor"
                : "fieldTextColor"
            }
            bg={currentStudentPage === item.value ? "#206CE11A" : "transparent"}
          
            fontWeight={"400"}
            onClick={() => setCurrentStudentPage(item.value)}
          >
            <Icon as={item.icon} size="sm" />
            <Text mx={2} fontSize={"sm"} fontWeight={500}>
              {item.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* medium and smaller screens floating nav */}
      <Box
        as="aside"
        display={{ base: "block", lg: "none" }}
        position="fixed"
        bottom={{ base: 0, md: 2 }}
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        borderRadius={{ base: 'none', md: "2xl" }}
        boxShadow={{base: 'none', md: 'xl'}}
        px={{ base: 0, md: 1 }}
        py={{ base: 0, md: 1 }}
        mt={40}
        maxW="lg"
        width={{ base: "100%", md: "90%" }}
        zIndex={1000}
      >
        <Flex justify="space-between" align="center">
          {parentsAsideElem.map(({ icon, label, value }) => (
            <Flex
              key={label}
              direction="column"
              align="center"
              flex="1"
              p={1}
              fontWeight={"normal"}
              onClick={() => setCurrentStudentPage(value)}
            >
              <IconButton
                aria-label={label}
                variant="ghost"
                size="lg"
                fontSize="xl"
                color={
                  currentStudentPage === value ? "blue.700" : "fieldTextColor"
                }
                bg={currentStudentPage === value ? "blue.50" : "transparent"}
                borderRadius="xl"
              >
                <Icon as={icon} />
              </IconButton>
              <Text fontSize="xs">{label}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;
