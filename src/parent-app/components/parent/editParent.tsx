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
  Icon,
} from "@chakra-ui/react";
import { useUser } from "../../context/parentDataContext";
import { supabase } from "@/lib/supabaseClient";
import UpdateParentSuccessPopover from "./updateParentSuccessPopover";
import { FiEdit2 } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

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
      console.error("No parent ID found");
      return;
    }

    setIsLoading(true);

    let imageUrl = parentData.profile_image;

    if (selectedFile) {
      const uploadedUrl = await handleImageUpload();
      if (!uploadedUrl) {
        console.error("Image upload failed");
        toaster.create({
          title: "Upload Failed",
          description: "Could not upload new photo. Please try again.",
          type: "error",
        });
        setIsLoading(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("parents")
      .update({ ...formData, profile_image: imageUrl })
      .eq("id", parentData.id)
      .select();

    setIsLoading(false);

    if (error) {
      console.error("Update error:", error.message);
      toaster.create({
        title: "Update Failed",
        description: error.message,
        type: "error",
      });
    } else {
      setShowBox(true);
      toaster.create({
        title: "Profile Updated",
        description: "Your parent profile details have been saved.",
        type: "success",
      });
    }
  };

  const getLabel = (key: string) => {
    switch (key) {
      case "firstname":
        return "First Name";
      case "lastname":
        return "Last Name";
      case "email":
        return "Email Address";
      case "phone":
        return "Phone Number";
      default:
        return key;
    }
  };

  return (
    <>
      <VStack
        gap={5}
        mb={16}
        p={{ base: 4, sm: 6 }}
        w="100%"
        border="none"
        outline="none"
        boxShadow="none"
        bg="white"
      >
        {/* Photo Section with Rounded Square and Pencil Badge */}
        <Box
          position="relative"
          w="full"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          py={2}
        >
          <Box
            position="relative"
            cursor="pointer"
            onClick={() => inputRef.current?.click()}
            role="button"
            aria-label="Change parent profile photo"
          >
            {selectedFile || parentData.profile_image ? (
              <Image
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : parentData.profile_image
                }
                alt="Profile"
                boxSize="96px"
                borderRadius="2xl"
                objectFit="cover"
                border="none"
                outline="none"
                boxShadow="none"
              />
            ) : (
              <Flex
                boxSize="96px"
                borderRadius="2xl"
                bg="#206CE1"
                color="white"
                align="center"
                justify="center"
                fontSize="32px"
                fontWeight="800"
              >
                {parentData?.firstname?.[0]?.toUpperCase() || "P"}
              </Flex>
            )}

            <Flex
              position="absolute"
              bottom="-4px"
              right="-4px"
              bg="#206CE1"
              color="white"
              boxSize="30px"
              borderRadius="xl"
              border="none"
              outline="none"
              boxShadow="none"
              align="center"
              justify="center"
              _hover={{ bg: "#1D75C7" }}
              transition="all 0.15s"
            >
              <Icon as={FiEdit2} boxSize="13px" />
            </Flex>
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
        </Box>

        {/* Input Fields Grid matching Student App */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={4}
          my={2}
          w="100%"
        >
          {Object.entries(formData).map(([key, val]) => (
            <GridItem key={key} w="100%">
              <Box w="100%">
                <Field.Root>
                  <Field.Label
                    fontSize="xs"
                    fontWeight="600"
                    color="#64748B"
                    mb={1.5}
                  >
                    {getLabel(key)}
                  </Field.Label>
                  <Input
                    name={key}
                    value={val}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Enter ${getLabel(key).toLowerCase()}`}
                    fontSize="xs"
                    p={5}
                    h="46px"
                    bg="#F4F7FB"
                    outline="none"
                    border="none"
                    boxShadow="none"
                    borderRadius="lg"
                    w="100%"
                    _placeholder={{ color: "gray.400" }}
                  />
                </Field.Root>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Action Button: 100% width, borderless, shadowless, matching student profile */}
        <Button
          loading={isLoading}
          loadingText="Updating..."
          type="button"
          fontWeight="semibold"
          w="100%"
          my={3}
          p={6}
          bg="#206CE1"
          color="white"
          borderRadius="xl"
          border="none"
          outline="none"
          boxShadow="none"
          _hover={{ bg: "#1956b5" }}
          _active={{ transform: "scale(0.99)" }}
          onClick={handleEdit}
        >
          Update Profile Information
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