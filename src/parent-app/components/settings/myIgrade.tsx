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
// import DeleteUserPopover from "../deleteUserPopover";
import DeleteUserPopover from "../parent/deleteUserPopover";

// Define the possible profile view states
type ProfileState =
  | "igrade"
  | "Profile"
  | "Children"
  | "Quiz Report"
  | "Refer a Friend";

// Settings menu items with their icons and colors
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

  // Handle navigation back to main view
  const handleBack = () => setProfileState("igrade");

  // This function renders the appropriate view based on profileState
  const renderView = () => {
    switch (profileState) {
      case "Profile":
        return <EditParent />;
      case "Children":
        return <Children />;
      case "Quiz Report":
      case "Refer a Friend":
        return <Text>Coming soon</Text>; // Placeholder for future views
      case "igrade":
      default:
        return renderMainView();
    }
  };


  // Render the main dashboard view
  const renderMainView = () => (
    <>
      <Flex
        direction="column"
        justify="space-between"
        gap={6}
        alignItems="center"
        w={{ base: "100%", lg: "80%" }}
        m="auto"
      >
        {/* Profile header section */}
        <Flex
          my={5}
          align="center"
          justify="center"
          gap={{ md: 6}}
          w="90%"
        >
          <Box
            w={"40%"}
            textAlign="center"
            display="flex"
            justifyContent={{base:'center', md: 'flex-end'}}
            alignItems="center"
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              bg="textFieldColor"
              overflow="hidden"
              w="85px"
              h="85px"
              borderRadius="2xl"
              boxShadow="xs"
            >
              {parent[0].profile_image ? (
                <Image
                  src={parent[0].profile_image}
                  alt="profile preview"
                  fit="cover"
                  w="full"
                  h="full"
                  borderRadius="2xl"
                />
              ) : (
                <Image src={manikin} alt="add profile photo" boxSize="40px" />
              )}
            </Box>
          </Box>
          <Box w="40%">
            <Heading as="h1" my={2}>
              {parent[0].firstname} {parent[0].lastname}
            </Heading>
            <Text
              fontSize="xs"
              bg="textFieldColor"
              p={1}
              rounded="2xl"
              textAlign="center"
              w={{base: '100%', md:'50%'}}
            >
              iGrade Parent
            </Text>
          </Box>
        </Flex>

        {/* Settings grid */}
        <Grid
          templateColumns={{ base: "repeat(1, 2fr)", md: "repeat(2, 2fr)" }}
          gap={6}
          w="full"
          p={4}
          my={2}
        >
          {SETTINGS_ITEMS.map((item, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              gap="2"
              bg="textFieldColor"
              w={{ base: "100%", md: "90%" }}
              m="auto"
              p={6}
              rounded="lg"
              // shadow="xs"
              cursor="pointer"
              onClick={() => setProfileState(item.head as ProfileState)}
            >
              <Box display="flex" alignItems="center" gap="3">
                <item.icon
                  style={{ color: item.iconColor, fontSize: "1.3rem" }}
                />
                <Text fontSize="sm" fontWeight={500}>
                  {item.head}
                </Text>
              </Box>
              <MdOutlineKeyboardArrowRight />
            </Flex>
          ))}
        </Grid>

        {/* Delete account option */}
        <Flex
          justify="center"
          align="center"
          gap="3"
          bg="#E43F401A"
          w="92%"
          mt={2}
          mb={5}
          p={6}
          rounded="lg"
          shadow="xs"
          cursor="pointer"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <MdDelete style={{ color: "red", fontSize: "1.4rem" }} />
          <Text fontSize="sm" fontWeight={500}>
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
      rounded={{ base: "none", md: "md" }}
      w="full"
      h="auto"
      mb={{ base: "20", lg: "10" }}
      p={{ base: "0", md: "3", lg: "6" }}
    >
      {/* Header with back button */}
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={5}
        mx={2}
        cursor="pointer"
      >
        {profileState !== "igrade" && <LuArrowLeft onClick={handleBack} />}
        {profileState === "igrade" ? "Settings" : profileState}
      </Heading>

      {/* Alert messages */}
      {alert && (
        <Alert.Root status={alert.type} variant="subtle" mt={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {alert.type === "error" ? "Error!" : "Success!"}
            </Alert.Title>
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Main content */}
      {loading ? (
        <SkeletonText noOfLines={3} gap="4" />
      ) : parent.length > 0 ? (
        renderView()
      ) : (
        <Text>You don't have data as a parent</Text>
      )}
    </Box>
  );
};

export default MyIgrade;
