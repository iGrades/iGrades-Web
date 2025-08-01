import { Flex, Image, Box, Icon, Heading, Text, Menu } from "@chakra-ui/react";
import { Portal } from "@chakra-ui/react";
// import { useState } from "react";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useTranslation } from "react-i18next";
import { IoNotifications } from "react-icons/io5";
import logo from "@/assets/logo.png";
import AvatarComp from "../../components/avatar";

const Navbar = () => {
  const { authdStudent } = useAuthdStudentData();
  const { t } = useTranslation();
  // const [value, setValue] = useState<string[]>([]);

  // Get first student or empty object
  const currentStudent = authdStudent ? authdStudent : null;

  return (
    <>
      <Flex
        as="nav"
        p={{ base: 2, md: 3, lg: 4 }}
        justify="flex-start"
        alignItems="center"
        bg="white"
        boxShadow="md"
        position="sticky"
        top="0"
        zIndex="1000"
      >
        {/* logo image */}
        <Box
          display="flex"
          alignItems="center"
          bg="white"
          w={{ base: "25%", md: "15%" }}
          mr={{ base: 4, md: 6, lg: 0 }}
        >
          <Image src={logo} alt="Logo" width="150px" fit="cover" />
        </Box>

        <Flex bg="white" w="85%" justify="space-between" alignItems="center">
          {/* welcome text */}
          <Box>
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl", lg: "2xl" }}
              ml={1}
              color="on_backgroundColor"
            >
              {t("welcome")} {currentStudent?.firstname || "User"}, 🤗
            </Heading>
            <Text ml={1} fontSize="xs" color="greyOthers">
              {t("welcome_complement")}
            </Text>
          </Box>

          <Box
            display="flex"
            // flexDirection={{ base: "column", md: "row" }}
            alignItems="center"
            mr={{ base: 2, md: 2, lg: 6 }}
            gap={4}
          >
            <Box
              w={{ base: "70px", md: "75px", lg: "100px" }}
              p={2}
              rounded="3xl"
              color="#525071"
              border={"1px solid #525071"}
              textAlign='center'
            >
              <Text fontSize={"sm"}>{currentStudent?.class}</Text>
            </Box>

            {/* notifiaction bell */}
            <Icon
              // display={{ base: "none", md: "block" }}
              size="md"
              color="greyOthers"
              cursor="pointer"
            >
              <IoNotifications />
            </Icon>

            <Menu.Root positioning={{ placement: "right-end" }}>
              <Menu.Trigger rounded="full" cursor="pointer">
                <AvatarComp
                  username={`${currentStudent?.firstname ?? ""} ${
                    currentStudent?.lastname ?? ""
                  }`.trim()}
                  profileImage={currentStudent?.profile_image}
                />
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="logout"
                      //   onClick={() => setShowLogoutModal(true)}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default Navbar;
