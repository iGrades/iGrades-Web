import { Box, Icon, Text, Flex, IconButton } from "@chakra-ui/react";
import { AiTwotoneSetting } from "react-icons/ai";
import { PiStudentDuotone } from "react-icons/pi";
import { TbHomeFilled } from "react-icons/tb";
import { useNavigationStore } from "../../store/usenavigationStore";
import type { IconType } from "react-icons";
import type { ParentPage } from "../../store/usenavigationStore";

const Sidebar = () => {
  const { currentParentPage, setCurrentParentPage } = useNavigationStore();

  const parentsAsideElem: {
    icon: IconType;
    label: string;
    value: ParentPage;
  }[] = [
    { icon: TbHomeFilled, label: "Home", value: "home" },
    { icon: PiStudentDuotone, label: "Students", value: "student" },
    { icon: AiTwotoneSetting, label: "Settings", value: "settings" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        display={{ base: "none", lg: "block" }}
        width="full"
        h="87vh"
        overflow="hidden"
        bg="white"
        px={4}
        py={10}
        boxShadow="md"
        left={0}
        position="sticky"
        top="1px"
        zIndex="1000"
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
        bottom={0}
        left="0"
        right="0"
        bg="white"
        pb={{ base: "env(safe-area-inset-bottom)", md: 2 }} 
        pt={2}
        px={{ base: 2, md: 6 }}
        boxShadow="0 -4px 12px rgba(0,0,0,0.05)" 
        borderTop="1px solid"
        borderColor="gray.100"
        zIndex={1100}
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