// src/components/settings/myIgrade.tsx
import { useEffect, useState } from "react";
import { Flex, Box, Image, Heading, Text, Grid, Input } from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "../../context/parentDataContext";
import { MdPerson } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { FaLink } from "react-icons/fa6";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import manikin from "../../../assets/manikin.png";
import addPix from "../../../assets/addPix.png";

const MyIgrade = () => {
  const { parent, loading } = useUser();
 const [selectedFile, setSelectedFile] = useState<File | null>(null);


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
        console.error("Upload error:", error);
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
          console.error("Database insert error:", error);
        }
      }
    };

    useEffect(() => {
      handleSaveProfileImage()
    }, [selectedFile])
    


  return (
    <Box
      as="section"
      bg="white"
      boxShadow="lg"
      rounded="lg"
      w="95%"
      m="auto"
      p={6}
    >
      {loading ? (
        <Text>Loading...</Text>
      ) : parent.length > 0 ? (
        <Flex
          direction="column"
          justify="space-around"
          alignItems="center"
          w="80%"
          m="auto"
        >
          <Flex my={5}>
            <Box w="1/2" m="auto" textAlign="center">
              <Box position="relative" display="inline-block" mx="auto" mt={16}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bg="textFieldColor"
                  overflow="hidden"
                  w="90px"
                  h="90px"
                  borderRadius="2xl"
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
            <Box>
              <Heading as="h1">
                {parent[0].firstname} {parent[0].lastname}
              </Heading>
              <Text>iGrade Parent</Text>
            </Box>
          </Flex>

          <Grid templateColumns="repeat(2, 2fr)" gap={6} w="full" p={4} my={2}>
            {settingsItems.map((item, index) => (
              <Flex
                key={index}
                justify="space-between"
                align="center"
                gap="2"
                bg="textFieldColor"
                w="90%"
                m="auto"
                p={6}
                rounded="xl"
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
            my={2}
            p={6}
            rounded={"xl"}
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
