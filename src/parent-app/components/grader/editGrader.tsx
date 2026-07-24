import { useState, useRef } from "react";
import {
  Input,
  Button,
  Box,
  Image,
  VStack,
  Field,
  Grid,
  GridItem,
  Flex,
} from "@chakra-ui/react";
import { useStudentsData } from "../../context/studentsDataContext";
import { supabase } from "@/lib/supabaseClient";
import UpdateGraderSuccessPopover from "./updateGraderSuccessPopover";

type Props = {
  student: any;
  onClose: () => void;
};

const EditGrader = ({ student, onClose }: Props) => {
  const { getGraderDetails } = useStudentsData();

  const [formData, setFormData] = useState({
    firstname: student.firstname || "",
    lastname: student.lastname || "",
    class: student.class || "",
    email: student.email || "",
    school: student.school || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showBox, setShowBox] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (): Promise<string | null> => {
      if (!selectedFile) return null;
  
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `students/${fileName}`;
  
      const { error } = await supabase.storage
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
  
    const handleEdit = async () => {
      setIsLoading(true); // Start loading
  
      let imageUrl = student.profile_image;
  
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload();
        if (!uploadedUrl) {
          console.error("Image upload failed");
          return;
        }
        imageUrl = uploadedUrl;
      }
  
      const { error } = await supabase
        .from("students")
        .update({ ...formData, profile_image: imageUrl })
        .eq("id", student.id)
        .select();
  
      if (error) {
        console.error("Update error:", error.message);
      } else {
        console.log("Student updated successfully");
        setIsLoading(false); // Stop loading on success
        setShowBox(true);
        getGraderDetails();
        // onClose();
      }
    };

  return (
    <>
      <VStack gap={6} mb={{ base: "100px", md: 10 }} w="full">
        {/* Header Actions */}
        <Flex w="95%" justify="flex-start">
          <Button 
            size="sm" 
            variant="subtle" 
            bg="red.50" 
            color="red.600"
            px={6}
            borderRadius="full"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Flex>

        {/* Image Preview Section */}
        <Box position="relative" display="flex" flexDirection="column" alignItems="center">
          <Box 
            borderRadius="full" 
            p={1} 
            border="2px solid" 
            borderColor="blue.100"
          >
            <Image
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : student.profile_image
              }
              alt="Profile"
              boxSize={{ base: "90px", md: "100px" }}
              borderRadius="full"
              objectFit="cover"
            />
          </Box>
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
            mt={3}
            onClick={() => inputRef.current?.click()}
            colorScheme="blue"
            variant="ghost"
            textDecoration="underline"
          >
            Change Photo
          </Button>
        </Box>

        {/* Responsive Form Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={4}
          w="95%"
        >
          {Object.entries(formData).map(([key, val], index, arr) => (
            <GridItem
              key={key}
              colSpan={index === arr.length - 1 ? { base: 1, md: 2 } : 1}
            >
              <Box w="100%">
                <Field.Root>
                  <Field.Label fontSize="xs" fontWeight="bold" textTransform="capitalize" mb={1} color="gray.600">
                    {key.replace("_", " ")}
                  </Field.Label>
                  <Input
                    name={key}
                    value={val}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Enter ${key}`}
                    fontSize="sm" // Better readability on mobile
                    h="48px"      // Mobile-friendly tap height
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                    _focus={{ borderColor: "blue.400", bg: "white" }}
                  />
                </Field.Root>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Sticky-ready Action Button */}
        <Box w="95%" pt={4}>
          <Button
            loading={isLoading}
            loadingText="Updating..."
            type="submit"
            fontWeight="bold"
            w="full"
            h="55px" // Prominent touch target
            bg="blue.500"
            color="white"
            borderRadius="2xl"
            boxShadow="0 4px 12px rgba(66, 153, 225, 0.3)"
            _active={{ transform: "scale(0.98)" }}
            onClick={handleEdit}
          >
            Update Student Details
          </Button>
        </Box>
      </VStack>

      {showBox && (
        <UpdateGraderSuccessPopover />
      )}
    </>
  );
};

export default EditGrader;