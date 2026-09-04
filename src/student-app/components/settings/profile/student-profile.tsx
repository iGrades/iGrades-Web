import {
  Input,
  Box,
  Image,
  VStack,
  Field,
  Grid,
  GridItem,
  Button,
  Heading,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { supabase } from "@/lib/supabaseClient";
import { FaCircleCheck } from "react-icons/fa6";
import { toaster } from "@/components/ui/toaster";

const pageData = ["firstname", "lastname", "email", "class"]; 

interface FormData {
  id: string;
  firstname: string;
  lastname: string;
  class: string;
  email: string;
  school: string;
}

const StudentProfile = () => {
  const { authdStudent, setAuthdStudent } = useAuthdStudentData();

  const [formData, setFormData] = useState<FormData>({
    id: authdStudent?.id || "",
    firstname: authdStudent?.firstname || "",
    lastname: authdStudent?.lastname || "",
    class: authdStudent?.class || "",
    email: authdStudent?.email || "",
    school: authdStudent?.school || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          toaster.create({
            title: "Photo Upload Failed",
            description: uploadError.message || "Failed to upload profile photo.",
            type: "error",
          });
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

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Update failed:", err.message || err);
      toaster.create({
        title: "Profile Update Failed",
        description: err.message || "Could not save your profile changes. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get display labels
  const getDisplayLabel = (key: string): string => {
    const labels: Record<string, string> = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email",
      class: "Class",
      school: "School",
    };
    return labels[key] || key;
  };

  return (
    <>
      <VStack
        gap={4}
        mb={20}
        shadow={{ base: "none", md: "sm" }}
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
          <Box position="relative" alignItems="center" display="flex" flexDirection="column">
            <Image
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : authdStudent?.profile_image || ""
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
        </Box>
        
        
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="1"
          w="95%"
          
        >
          {/* Input Fields */}
          {pageData.map((dataKey, index) => (
            <GridItem key={index} w="100%">
              <Box key={index} w={{ base: "100%", md: "90%" }} m="auto">
                <Field.Root>
                  <Field.Label fontSize="xs" textTransform="capitalize" my={2} mx={1}>
                    {getDisplayLabel(dataKey)}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={dataKey}
                  value={formData[dataKey as keyof FormData] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [dataKey]: e.target.value,
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
          w={{ base: "95%", md: "90%" }}
          my={5}
          p={6}
          bg="blue.500"
          color="white"
          borderRadius="xl"
          onClick={handleEdit}
        >
          Update Profile
        </Button>
      </VStack>

      {/* Success Modal */}
      {showSuccessModal && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={5000}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={{ base: 4, md: 8 }}
        >
          <Box
            position="relative"
            width={{ base: "100%", sm: "85%", md: "60%", lg: "35%" }}
            maxH="90vh"
            bg="white"
            borderRadius="3xl"
            boxShadow="2xl"
            p={{ base: 6, md: 10 }}
            textAlign="center"
          >
            <VStack gap={4}>
              <Icon
                bg="green.50"
                boxSize={{ base: "60px", md: "70px" }}
                color="green.500"
                rounded="full"
                p={3}
              >
                <FaCircleCheck size="100%" />
              </Icon>

              <Heading
                as="h1"
                fontSize={{ base: "xl", md: "2xl" }}
                color="backgroundColor2"
              >
                Profile Updated!
              </Heading>

              <Text
                fontSize={{ base: "sm", md: "xs" }}
                color="gray.600"
                maxW="90%"
                lineHeight="tall"
              >
                Your student profile details and photo have been successfully saved.
              </Text>

              <Box w="full" pt={4}>
                <Button
                  bg="primaryColor"
                  color="white"
                  borderRadius="3xl"
                  h="55px"
                  w="full"
                  fontSize="sm"
                  fontWeight="bold"
                  _active={{ transform: "scale(0.97)" }}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Done
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </>
  );
};

export default StudentProfile;
