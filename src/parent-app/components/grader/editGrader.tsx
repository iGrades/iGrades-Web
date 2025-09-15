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
      <VStack gap={4} mb={10}>
        <Button w="30%" variant="subtle" bg="red.50" onClick={onClose}>
          Cancel
        </Button>
        {/* Image Preview */}
        <Box position="relative">
          <Image
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : student.profile_image
            }
            alt="Profile"
            boxSize="80px"
            borderRadius="full"
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
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="4"
          w="95%"
        >
          {/* Input Fields */}
          {Object.entries(formData).map(([key, val], index, arr) => (
            <GridItem
              key={key}
              colSpan={index === arr.length - 1 ? { base: 1, md: 2 } : 1}
              w="100%"
            >
              <Box key={key} w="100%">
                <Field.Root>
                  <Field.Label fontSize="xs" textTransform="capitalize" my={2}>
                    {key.replace("_", " ")}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={key}
                  value={val}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={`Enter ${key}`}
                  fontSize="xs"
                  bg="gray.50"
                  outline="none"
                  border="none"
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

      {showBox && (
        <UpdateGraderSuccessPopover setShowBox={setShowBox} onClose={onClose} />
      )}
    </>
  );
};

export default EditGrader;
