// src/components/settings/myIgrade.tsx
import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Image,
  Heading,
  Text,
  Grid,
  Input,
  Alert,
} from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "../../context/parentDataContext";
import { MdPerson } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { FaLink } from "react-icons/fa6";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { LuArrowLeft } from "react-icons/lu";
import manikin from "../../../assets/manikin.png";
import addPix from "../../../assets/addPix.png";

const MyIgrade = () => {
  const { parent, loading } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const settingsItems = [
    { head: "Profile", icon: MdPerson, iconColor: "#206CE1" },
    { head: "Quiz Report", icon: GiNotebook, iconColor: "#00A8E6" },
    { head: "Children", icon: HiUserGroup, iconColor: "#2DD4A5" },
    { head: "Refer a Friend", icon: FaLink, iconColor: "#AE3DD6" },
  ];

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `parents/${fileName}`;

    const { data, error } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, selectedFile);

    if (error) {
      setAlert({ type: "error", message: error.message });
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

    return publicUrl;
  };

  // Function to handle saving the uploaded image to the database
  const handleSaveProfileImage = async () => {
    const imageUrl = await handleImageUpload();
    // if (!imageUrl) {
    //   setAlert({ status: "error", message: "Image upload failed." });
    //   return;
    // }
    if (imageUrl) {
      const { error } = await supabase.from("parents").insert({
        profile_image: imageUrl,
      });

      if (error) {
        setAlert({ type: "error", message: error.message });
        return;
      }
    }
  };

  useEffect(() => {
    handleSaveProfileImage();
  }, [selectedFile]);

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
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={5}
        mx={2}
      >
        <LuArrowLeft />
        Profile
      </Heading>
      {alert ? (
        <Alert.Root status={alert.type} variant="subtle" mt={6}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {alert.type === "error" ? "Error!" : "Success!"}
            </Alert.Title>
            <Alert.Description>{alert.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : loading ? (
        <Text>loading ...</Text>
      ) : parent.length > 0 ? (
        <Flex
          direction="column"
          justify="space-around"
          alignItems="center"
          w={{ base: "100%", lg: "80%" }}
          m="auto"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            my={5}
            align="center"
            justify="space-between"
            gap={6}
            w="30%"
          >
            <Box w={{ base: "100%", md: "50%" }} m="auto" textAlign="center">
              <Box position="relative" display="inline-block" mx="auto">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bg="textFieldColor"
                  overflow="hidden"
                  w="100px"
                  h="100px"
                  borderRadius="2xl"
                  boxShadow="xs"
                >
                  {selectedFile ? (
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="profile preview"
                      fit="cover"
                      w="full"
                      h="full"
                      borderRadius="2xl"
                    />
                  ) : (
                    <Image
                      src={manikin}
                      alt="add profile photo"
                      boxSize="40px"
                    />
                  )}
                </Box>

                <label>
                  <Image
                    src={addPix}
                    alt="add button"
                    boxSize="30px"
                    position="absolute"
                    bottom="0"
                    right="0"
                    transform="translate(30%, 30%)"
                    borderRadius="full"
                    bg="textFieldColor"
                    p="1"
                    cursor="pointer"
                    boxShadow="md"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                </label>
              </Box>
            </Box>
            <Box w={"100%"}>
              <Heading as="h1" my={2}>
                {parent[0].firstname} {parent[0].lastname}
              </Heading>
              <Text
                fontSize="xs"
                bg="textFieldColor"
                p={2}
                rounded="2xl"
                textAlign="center"
                shadow="xs"
              >
                iGrade Parent
              </Text>
            </Box>
          </Flex>

          <Grid
            templateColumns={{ base: "repeat(1, 2fr)", md: "repeat(2, 2fr)" }}
            gap={6}
            w="full"
            p={4}
            my={2}
          >
            {settingsItems.map((item, index) => (
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
                shadow="xs"
                cursor="pointer"
              >
                <Box
                  display="flex"
                  justifyItems="space-around"
                  alignItems="center"
                  gap="3"
                >
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
          >
            <MdDelete style={{ color: "red", fontSize: "1.4rem" }} />
            <Text fontSize="sm" fontWeight={500}>
              {" "}
              Delete Account
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Text>You don't have data as a parent</Text>
      )}
    </Box>
  );
};

export default MyIgrade;
