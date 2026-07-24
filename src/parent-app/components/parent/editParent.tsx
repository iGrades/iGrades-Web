
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
  
      setIsLoading(true); 
  
      let imageUrl = parentData.profile_image; 
  
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
        .eq("id", parentData.id) 
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
      <VStack 
        gap={4} 
        mb={10} 
        px={{ base: 4, md: 10, lg: 20 }} 
        w="full"
      >
        {/* Image Preview */}
        <Box position="relative" textAlign="center">
          <Image
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : parentData.profile_image
            }
            alt="Profile"
            boxSize={{ base: "80px", md: "90px" }}
            borderRadius="xl"
            objectFit="cover"
            m="auto"
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
            mt={3}
            onClick={() => inputRef.current?.click()}
            colorScheme="blue"
            variant="ghost" 
            textDecoration="underline"
          >
            Change Photo
          </Button>
        </Box>
        
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={4}
          my={4}
          w="100%"
        >
          {/* Input Fields */}
          {Object.entries(formData).map(([key, val]) => (
            <GridItem key={key} w="100%">
              <Box w="100%">
                <Field.Root>
                  <Field.Label
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="capitalize"
                    color="backgroundColor2"
                    mb={1}
                  >
                    {key.replace("_", " ")}
                  </Field.Label>
                  <Input
                    name={key}
                    value={val}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Enter ${key}`}
                    fontSize="sm"
                    h="48px"      
                    bg="gray.50"
                    color="gray.700"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.100"
                    _focus={{ borderColor: "blue.400", bg: "white" }}
                  />
                </Field.Root>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Action Button */}
        <Box w="full" pt={4}>
          <Button
            loading={isLoading}
            loadingText="Updating..."
            type="submit"
            fontWeight="bold"
            w="full"
            h="55px" 
            bg="blue.500"
            color="white"
            borderRadius="3xl"
            boxShadow="0 4px 12px rgba(66, 153, 225, 0.2)"
            _active={{ transform: "scale(0.98)" }}
            onClick={handleEdit}
          >
            Update Profile
          </Button>
        </Box>
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