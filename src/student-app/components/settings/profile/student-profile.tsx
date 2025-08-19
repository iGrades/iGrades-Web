import {
  Input,
  Alert,
  Box,
  Image,
  VStack,
  Field,
  Grid,
  GridItem,
  Button
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { supabase } from "@/lib/supabaseClient";
import { IoIosAlert } from "react-icons/io";

const pageData = ["First Name", "Last Name", "Email", "Class"];

const StudentProfile = () => {
  const { authdStudent, setAuthdStudent } = useAuthdStudentData();

  const [formData, setFormData] = useState({
    id: authdStudent?.id || "",
    firstname: authdStudent?.firstname || "",
    lastname: authdStudent?.lastname || "",
    class: authdStudent?.class || "",
    email: authdStudent?.email || "",
    school: authdStudent?.school || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);


// const handleImageUpload = async (): Promise<string | null> => {
//   if (!selectedFile) return null;

//   const fileExt = selectedFile.name.split(".").pop();
//   const fileName = `${authdStudent?.id}.${fileExt}`; // use student table ID
//   const filePath = `students/${fileName}`;

//   const { error } = await supabase.storage
//     .from("profile-photos")
//     .upload(filePath, selectedFile, { upsert: true }); // always overwrite

//   if (error) {
//     console.error("Upload error:", error);
//     return null;
//   }

//   const {
//     data: { publicUrl },
//   } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

//   return publicUrl;
// };


const handleEdit = async () => {
  setIsLoading(true);

  try {
    let imageUrl = authdStudent?.profile_image;

    // Upload and overwrite if a new file is selected
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${authdStudent?.id}.${fileExt}`; // always same name for this student
      const filePath = `students/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, selectedFile, { upsert: true }); // overwrite

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setIsLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    // Update student record via RPC
    const { data, error } = await supabase.rpc("update_student_profile", {
      p_id: formData.id,
      p_firstname: formData.firstname,
      p_lastname: formData.lastname,
      p_class: formData.class,
      p_email: formData.email,
      p_profile_image: imageUrl,
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("No data returned (possible RLS issue)");
    }

    // Update local context immediately
    setAuthdStudent((prev) => ({
      ...prev,
      ...data[0],
    }));

    console.log("Student updated successfully:", data[0]);
  } catch (err: any) {
    console.error("Update failed:", err.message || err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <VStack
        gap={4}
        mb={20}
        shadow={{ base: "none", md: "md" }}
        p={{ base: 1, md: 10, lg: 20 }}
        rounded="md"
        w="full"
        bg="white"
      >
        {/* Image Preview */}
        <Box
          position="relative"
          w={{ base: "100%", md: "3/4" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={{ base: 1, md: 6 }}
        >
          <Box position="relative">
            <Image
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : authdStudent?.profile_image
              }
              alt="Profile"
              boxSize="80px"
              borderRadius="xl"
              objectFit="cover"
            />
            <Input
              type="file"
              accept="image/*"
              hidden
              ref={inputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            <Button
              size="xs"
              mt={2}
              onClick={() => inputRef.current?.click()}
              colorScheme="blue"
              variant="outline"
            >
              Change Photo
            </Button>
          </Box>
          <Alert.Root status="warning" variant="subtle" color="#474256" mt={5}>
            <Alert.Indicator color="orange.400">
              <IoIosAlert />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title fontSize="11px" fontWeight={700}>
                Kindly note
              </Alert.Title>
              <Alert.Description fontSize="11px" fontWeight={400}>
                Student profiile creation is managed and maintained by thier
                parent or guardian account. Kindly go to your parent account to
                make changes to your profile
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="1"
          w="95%"
        >
          {/* Input Fields */}
          {pageData.map((data, index) => (
            <GridItem key={index} w="100%">
              <Box key={index} w={{ base: "100%", md: "70%" }} m="auto">
                <Field.Root>
                  <Field.Label fontSize="xs" textTransform="capitalize" my={2}>
                    {data}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={data}
                  value={formData[data.toLowerCase().replace(" ", "")] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [data.toLowerCase().replace(" ", "")]: e.target.value,
                    })
                  }
                  fontSize="xs"
                  p={6}
                  bg="textFieldColor"
                  outline="none"
                  border="none"
                  _placeholder={{ color: "greyOthers" }}
                />
              </Box>
            </GridItem>
          ))}
        </Grid>
        {/* Action Button */}
        <Button
          loading={isLoading}
          loadingText="Updating..."
          spinnerPlacement="start"
          type="submit"
          fontWeight="semibold"
          w={{ base: "95%", lg: "95%" }}
          p={6}
          bg="blue.500"
          color="white"
          borderRadius="xl"
          onClick={handleEdit}
        >
          Update
        </Button>
      </VStack>
    </>
  );
};

export default StudentProfile;
