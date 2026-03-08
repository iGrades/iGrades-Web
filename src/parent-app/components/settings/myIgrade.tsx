import { SkeletonText } from "@chakra-ui/react";
import { useState } from "react";
import { Flex, Box, Image, Heading, Text, Grid, Alert } from "@chakra-ui/react";
import { useUser } from "../../context/parentDataContext";
import {
  MdPerson,
  MdOutlineKeyboardArrowRight,
  MdDelete,
} from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { FaLink } from "react-icons/fa6";
import { LuArrowLeft } from "react-icons/lu";
import manikin from "../../../assets/manikin.png";
import EditParent from "../parent/editParent";
import Children from "./children";
import DeleteUserPopover from "../parent/deleteUserPopover";

type ProfileState =
  | "igrade"
  | "Profile"
  | "Children"
  | "Quiz Report"
  | "Refer a Friend";

const SETTINGS_ITEMS = [
  { head: "Profile", icon: MdPerson, iconColor: "#206CE1" },
  { head: "Quiz Report", icon: GiNotebook, iconColor: "#00A8E6" },
  { head: "Children", icon: HiUserGroup, iconColor: "#2DD4A5" },
  { head: "Refer a Friend", icon: FaLink, iconColor: "#AE3DD6" },
];

const MyIgrade = () => {
  const { parent, loading } = useUser();
  const [profileState, setProfileState] = useState<ProfileState>("igrade");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleBack = () => setProfileState("igrade");

  const renderView = () => {
    switch (profileState) {
      case "Profile":
        return <EditParent />;
      case "Children":
        return <Children />;
      case "Quiz Report":
      case "Refer a Friend":
        return <Text p={10} textAlign="center">Coming soon</Text>;
      case "igrade":
      default:
        return renderMainView();
    }
  };

  const renderMainView = () => (
    <>
      <Flex
        direction="column"
        justify="space-between"
        gap={{ base: 4, md: 6 }}
        alignItems="center"
        w={{ base: "100%", lg: "80%" }}
        m="auto"
      >
        {/* Profile header section */}
        <Flex
          my={{ base: 4, md: 8 }}
          align="center"
          justify="center"
          gap={{ base: 4, md: 6 }}
          w="full"
          px={4}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            bg="textFieldColor"
            overflow="hidden"
            w={{ base: "65px", md: "80px" }}
            h={{ base: "65px", md: "80px" }}
            borderRadius="2xl"
            boxShadow="sm"
          >
            {parent[0]?.profile_image ? (
              <Image
                src={parent[0].profile_image}
                alt="profile"
                fit="cover"
                w="full"
                h="full"
              />
            ) : (
              <Image src={manikin} alt="default" boxSize="40px" />
            )}
          </Box>
          <Box flex="1" maxW="200px">
            <Heading as="h1" fontSize={{ base: "md", md: "lg" }} truncate>
              {parent[0]?.firstname} {parent[0]?.lastname}
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              iGrade Parent
            </Text>
          </Box>
        </Flex>

        {/* Settings grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={4}
          w="full"
          px={{ base: 2, md: 4 }}
        >
          {SETTINGS_ITEMS.map((item, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              bg="textFieldColor"
              w="full"
              p={{ base: 5, md: 6 }}
              rounded="xl"
              cursor="pointer"
              transition="all 0.2s"
              _active={{ bg: "gray.100", transform: "scale(0.98)" }}
              onClick={() => setProfileState(item.head as ProfileState)}
            >
              <Box display="flex" alignItems="center" gap="3">
                <item.icon
                  style={{ color: item.iconColor, fontSize: "1.4rem" }}
                />
                <Text fontSize="sm" fontWeight={600}>
                  {item.head}
                </Text>
              </Box>
              <MdOutlineKeyboardArrowRight color="gray.400" />
            </Flex>
          ))}
        </Grid>

        {/* Delete account option */}
        <Flex
          justify="center"
          align="center"
          gap="3"
          bg="#E43F401A"
          w={{ base: "95%", md: "90%" }}
          mt={4}
          mb={8}
          p={5}
          rounded="xl"
          cursor="pointer"
          _active={{ bg: "#E43F4033" }}
          onClick={() => setShowDeleteConfirm(true)}
        >
          <MdDelete style={{ color: "red", fontSize: "1.4rem" }} />
          <Text fontSize="sm" fontWeight={600} color="red.600">
            Delete Account
          </Text>
        </Flex>
      </Flex>

      {showDeleteConfirm && (
        <DeleteUserPopover
          alert={alert}
          setAlert={setAlert}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      )}
    </>
  );

  return (
    <Box
      as="section"
      bg="white"
      boxShadow={{ base: "none", md: "md" }}
      rounded={{ base: "none", md: "2xl" }}
      w="full"
      h="auto"
      mb={{ base: "100px", lg: "10" }}
      p={{ base: 4, md: 6 }}
    >
      {/* Header with back button */}
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mb={6}
        cursor="pointer"
        fontSize="lg"
      >
        {profileState !== "igrade" && (
          <Box p={1} onClick={handleBack} cursor="pointer">
            <LuArrowLeft />
          </Box>
        )}
        {profileState === "igrade" ? "Settings" : profileState}
      </Heading>

      {/* Alert messages */}
      {alert && (
        <Alert.Root status={alert.type} variant="subtle" mb={6} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Content fontSize="xs">
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Main content */}
      {loading ? (
        <SkeletonText noOfLines={5} gap="4" />
      ) : parent.length > 0 ? (
        renderView()
      ) : (
        <Text textAlign="center" py={10}>Account data not found</Text>
      )}
    </Box>
  );
};

export default MyIgrade;