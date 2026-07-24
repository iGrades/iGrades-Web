import { Box, Icon, Text, Flex, IconButton } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PiStudentDuotone } from "react-icons/pi";
import { TbHomeFilled } from "react-icons/tb";
import { useNavigationStore } from "../../store/usenavigationStore";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { ParentPage } from "../../store/usenavigationStore";

const Sidebar = () => {
  const { currentParentPage, setCurrentParentPage } = useNavigationStore();
  const { t } = useTranslation();

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: ParentPage;
  }[] = [
    { icon: TbHomeFilled, label: t("nav_home"), value: "home" },
    { icon: PiStudentDuotone, label: t("nav_students"), value: "student" },
    { icon: AiTwotoneSetting, label: t("nav_settings"), value: "settings" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
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
              currentParentPage === item.value
                ? "primaryColor"
                : "fieldTextColor"
            }
            bg={currentParentPage === item.value ? "#206CE11A" : "transparent"}
            _hover={{ bg: "#206CE10D" }} 
            transition="all 0.2s"
            onClick={() => setCurrentParentPage(item.value)}
          >
            <Icon as={item.icon} boxSize="20px" />
            <Text mx={3} fontSize={"sm"} fontWeight={500}>
              {item.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Mobile/Tablet Bottom Navigation */}
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
        <Flex 
          justify="space-around" 
          align="center" 
          maxW="md" 
          mx="auto"
        >
          {parentsAsideElem.map(({ icon, label, value }) => {
            const isActive = currentParentPage === value;
            return (
              <Flex
                key={label}
                direction="column"
                align="center"
                justify="center"
                flex="1"
                cursor="pointer"
                py={1}
                onClick={() => setCurrentParentPage(value)}
              >
                <IconButton
                  aria-label={label}
                  variant="ghost"
                  size="md" 
                  fontSize="22px"
                  color={isActive ? "blue.700" : "fieldTextColor"}
                  bg={isActive ? "blue.50" : "transparent"}
                  borderRadius="xl"
                  mb={1}
                  _active={{ bg: "blue.100" }}
                >
                  <Icon as={icon} />
                </IconButton>
                <Text 
                  fontSize="10px" 
                  fontWeight={isActive ? "bold" : "medium"}
                  color={isActive ? "blue.700" : "fieldTextColor"}
                >
                  {label}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;