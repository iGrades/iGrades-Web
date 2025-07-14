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
import { useUser } from "../../context/parentDataContext";
import { supabase } from "@/lib/supabaseClient";
import UpdateParentSuccessPopover from "./updateParentSuccessPopover";

const EditParent = () => {
  const { parent, getParentData } = useUser();

  // get the parent object or an empty object (if none exists)
  const parentData = parent?.[0] || {};

  const [formData, setFormData] = useState({
    firstname: parentData.firstname || "",
    lastname: parentData.lastname || "",
    email: parentData.email || "",
    phone: parentData.phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showBox, setShowBox] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `parents/${fileName}`;

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
    if (!parentData.id) {
      // Check if parent exists
      console.error("No parent ID found");
      return;
    }

    setIsLoading(true); // Start loading

    let imageUrl = parentData.profile_image; // Use parentData instead of parent

    if (selectedFile) {
      const uploadedUrl = await handleImageUpload();
      if (!uploadedUrl) {
        console.error("Image upload failed");
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("parents")
      .update({ ...formData, profile_image: imageUrl })
      .eq("id", parentData.id) // Use parentData.id
      .select();

    if (error) {
      console.error("Update error:", error.message);
    } else {
      console.log("User updated successfully");
      setShowBox(true);
      setIsLoading(false);
    }
  };

  return (
    <>
      <VStack gap={4} mb={10} px={40}>
        {/* Image Preview */}
        <Box position="relative">
          <Image
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : parentData.profile_image
            }
            alt="Profile"
            boxSize="100px"
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
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="4"
          my={4}
          w="95%"
        >
          {/* Input Fields */}
          {Object.entries(formData).map(([key, val]) => (
            <GridItem key={key} w="100%">
              <Box key={key} w="100%">
                <Field.Root>
                  <Field.Label
                    fontSize="xs"
                    textTransform="capitalize"
                    color="backgroundColor2"
                    my={2}
                  >
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
                  color="gray.500"
                  outline="none"
                  border="none"
                />
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Action Buttons */}
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
          borderRadius="3xl"
          onClick={handleEdit}
        >
          Update
        </Button>
      </VStack>

      {showBox && (
        <UpdateParentSuccessPopover
          setShowBox={setShowBox}
          onClose={getParentData}
        />
      )}
    </>
  );
};

export default EditParent;
