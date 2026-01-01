import { Flex, Image, Box, Icon, Heading, Text, Menu } from "@chakra-ui/react";
import { Portal } from "@chakra-ui/react";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useTranslation } from "react-i18next";
import { IoNotifications } from "react-icons/io5";
import logo from "@/assets/logo.png";
import AvatarComp from "../../components/avatar";

const Navbar = () => {
  const { authdStudent } = useAuthdStudentData();
  const { t } = useTranslation();
  const { setIsPopOver } = useAuthdStudentData();
  // const [value, setValue] = useState<string[]>([]);

  // get student
  const currentStudent = authdStudent ? authdStudent : null;

  return (
    <>
      <Flex
        as="nav"
        // p={{ base: 2, md: 3, lg: 4 }}
        justify="flex-start"
        alignItems="center"
        bg={"textFieldColor"}
        boxShadow="xs"
        position="sticky"
        top="0"
        zIndex="1000"
      >
        {/* logo image */}
        <Box
          display="flex"
          alignItems="center"
          bg="white"
          px={{ base: 3, md: 4, lg: 5 }}
          py={{ base: 7, md: 7, lg: 6 }}
          w={{ base: "25%", md: "15%" }}
          mr="2px"
        >
          <Image
            src={logo}
            alt="Logo"
            w={{ md: "100%", lg: "70%" }}
            fit="cover"
          />
        </Box>

        <Flex
          bg="white"
          w="85%"
          justify="space-between"
          alignItems="center"
          p={{ base: 4, lg: 4.5 }}
        >
          {/* welcome text */}
          <Box>
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl", lg: "2xl" }}
              ml={1}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              fontWeight="bold"
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
            justifyContent="space-between"
            mr={{ base: 0, md: 10, lg: 6 }}
            gap={{base: 2, md: 4}}
            w={{base: "55%", md: "25%", lg:"15%"}}
            
          >
            <Box
              w={{ base: "70px", md: "75px", lg: "100px" }}
              p={{ base: 1, md: 2}}
              rounded="3xl"
              color="#525071"
              border={"1px solid #525071"}
              textAlign="center"
            >
              <Text fontSize={{base: 'xs', md: 'sm'}}>{currentStudent?.class}</Text>
            </Box>

            {/* notifiaction bell */}
            <Icon
              // display={{ base: "none", md: "block" }}
              size={{base: "md", md: "md"}}
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
                      onClick={
                        setIsPopOver ? () => setIsPopOver(true) : undefined
                      }
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
