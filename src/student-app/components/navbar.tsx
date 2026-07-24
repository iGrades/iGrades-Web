import { useState } from "react";
import { Flex, Image, Box, Icon, Heading, Text, Menu } from "@chakra-ui/react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useTranslation } from "react-i18next";
import { IoNotifications } from "react-icons/io5";
import logo from "../../assets/logo.png";
import AvatarComp from "../../components/avatar";

const Navbar = () => {
  const { authdStudent } = useAuthdStudentData();
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState<string[]>([i18n.language]);
  const { setIsPopOver } = useAuthdStudentData();

  const languages = createListCollection({
    items: [
      { label: t("langEn"), value: "en" },
      { label: t("langHa"), value: "ha" },
      { label: t("langYo"), value: "yo" },
      { label: t("langIg"), value: "ig" },
      { label: t("langAk"), value: "ak" },
      { label: t("langFf"), value: "ff" },
      { label: t("langWo"), value: "wo" },
      { label: t("langFr"), value: "fr" },
      { label: t("langPt"), value: "pt" },
    ],
  });

  // get student
  const currentStudent = authdStudent ? authdStudent : null;

  return (
    <>
      <Flex
        as="nav"
        justify="flex-start"
        alignItems="center"
        bg={"textFieldColor"}
        // boxShadow="xs"
        position="sticky"
        top="0"
        zIndex="1000"
        h={{ base: "70px", md: "80px" }} 
      >
        {/* logo image */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent='flex-start'
          bg="white"
          shadow={"xs"}
          p={{ base: 1, md: 5, lg: 10 }}
          w={{ base: "70px", md: "15%", lg: "16.8%" }} 
          h={{ base: "79px", md:"80px", lg: "86px" }} 
          // mr="1px"
        >
          <Image
          src={logo}
          alt="Logo"
          w={{ base: "40px", md: "100%", lg: "70%" }}
          fit="contain"
          />
        </Box>

        <Flex
          bg="white"
          w="full"
          justify="space-between"
          alignItems="center"
          p={{ base: 4, lg: 4.5 }}
          ml={0}
           shadow={"xs"}
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

          <Flex
            alignItems="center"
            justifyContent="flex-end"
            mr={{ base: 0, md: 10, lg: 6 }}
            gap={{ base: 2, md: 4 }}
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

            {/* select button */}
            <Select.Root
              collection={languages}
              width={{ base: "100px", md: "110px", lg: "130px" }}
              value={value}
              onValueChange={(e) => {
                setValue(e.value);
                if (e.value[0]) {
                  i18n.changeLanguage(e.value[0]);
                  localStorage.setItem("appLanguage", e.value[0]);
                }
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder={t("langEn")} />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {languages.items.map((language) => (
                      <Select.Item item={language} key={language.value}>
                        {language.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

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
              <Menu.Trigger rounded="full" cursor="pointer" asChild>
                <Box>
                  <AvatarComp
                    username={`${currentStudent?.firstname ?? ""} ${
                      currentStudent?.lastname ?? ""
                    }`.trim()}
                    profileImage={currentStudent?.profile_image}
                  />
                </Box>
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
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default Navbar;
