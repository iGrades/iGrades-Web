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
  setShowLogoutModal: Dispatch<SetStateAction<boolean>>;
};

const Navbar = ({ setShowLogoutModal }: Props) => {
  const { parent, loading } = useUser();
  const { t } = useTranslation();
  const [value, setValue] = useState<string[]>([]);

  if (loading) {
    return <SkeletonText noOfLines={1} gap="4" p={4} />;
  }

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
        justify="flex-start"
        alignItems="center"
        bg={"textFieldColor"}
        boxShadow="xs"
        position="sticky"
        top="0"
        zIndex="1000"
        h={{ base: "70px", md: "80px" }} 
      >
        {/* logo image container */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="white"
          shadow={"md"}
          p={{ base: 4, md: 6 }}
          w={{ base: "70px", md: "15%", lg: "12%" }} 
          h="full"
          mr="1px"
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
          flex="1" 
          justify="space-between"
          alignItems="center"
          h="full"
          px={{ base: 3, md: 6 }}
        >
          {/* welcome text */}
          <Box minW="0"> 
            <Heading
              as="h1"
              size={{ base: "sm", md: "md" }}
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              fontWeight="bold"
              color="on_backgroundColor"
            >
              {t("welcome")} {currentParent.firstname || "User"}, 🤗
            </Heading>
            <Text 
              fontSize={{ base: "10px", md: "xs" }} 
              color="greyOthers"
              display={{ base: "none", sm: "block" }} 
            >
              {t("welcome_complement")}
            </Text>
          </Box>

          <Flex
            alignItems="center"
            gap={{ base: 3, md: 6 }}
            ml={2}
          >
            {/* select button - Hidden on mobile */}
            <Select.Root
              display={{ base: "none", md: "block" }}
              collection={languages}
              width={{ md: "110px", lg: "130px" }}
              value={value}
              onValueChange={(e) => setValue(e.value)}
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

            {/* notification bell */}
            <Icon
              size="md"
              color="greyOthers"
              cursor="pointer"
              _active={{ transform: "scale(0.95)" }}
            >
              <IoNotifications size="20px" />
            </Icon>

            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger rounded="full" cursor="pointer" asChild>
                <Box>
                  <AvatarComp
                    username={`${currentParent.firstname ?? ""} ${
                      currentParent.lastname ?? ""
                    }`.trim()}
                    profileImage={currentParent.profile_image}
                  />
                </Box>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="logout"
                      onClick={() => setShowLogoutModal(true)}
                      color="red.500"
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