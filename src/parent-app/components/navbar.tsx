import { Flex, Image, Box, Icon, Heading, Text, Menu } from "@chakra-ui/react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { useState, type SetStateAction, type Dispatch } from "react";
import { useUser } from "../context/parentDataContext";
import { useTranslation } from "react-i18next";
import { IoNotifications } from "react-icons/io5";
import { SkeletonText } from "@chakra-ui/react";
import logo from "@/assets/logo.png";
import AvatarComp from "../../components/avatar";

type Props = {
  showLogoutModal: boolean;
  setShowLogoutModal: Dispatch<SetStateAction<boolean>>;
};

const Navbar = ({showLogoutModal, setShowLogoutModal}: Props) => {
const { parent, loading } = useUser();
const { t } = useTranslation();
const [value, setValue] = useState<string[]>([]);


if (loading) {
  return <SkeletonText noOfLines={1} gap="4" />; 
}

// Get first parent or empty object
const currentParent = parent[0] || {};
  

  const languages = createListCollection({
    items: [
      { label: t("langEn"), value: "english" },
      { label: t("langZulu"), value: "zulu" },
      { label: t("langAfrik"), value: "afrikaans" },
    ],
  });

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
              {t("welcome")} {currentParent.firstname || "User"}, 🤗
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
            {/* select button */}
            <Select.Root
              display={{ base: "none", md: "block" }}
              collection={languages}
              width="100px"
              value={value}
              onValueChange={(e) => setValue(e.value)}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder={t("langEn")} />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
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
              size="md"
              color="greyOthers"
              cursor="pointer"
            >
              <IoNotifications />
            </Icon>

            <Menu.Root positioning={{ placement: "right-end" }}>
              <Menu.Trigger rounded="full" cursor="pointer">
                <AvatarComp
                  username={`${currentParent.firstname ?? ""} ${
                    currentParent.lastname ?? ""
                  }`.trim()}
                  profileImage={currentParent.profile_image}
                />
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="logout"
                      onClick={() => setShowLogoutModal(true)}
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
