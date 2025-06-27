import { useState } from "react";
import { getParentId } from "../utils/getParentId";
import { supabase } from "../../lib/supabaseClient";
import {
  Input,
  Button,
  Box,
  Heading,
  Text,
  Image,
  Grid,
  Field,
  Flex,
  createListCollection,
  Select,
  Portal,
} from "@chakra-ui/react";
import manikin from "../../assets/manikin.png";
import addPix from "../../assets/addPix.png";

interface AddGraderProps {
  basePageWidth: number;
  mdPageWidth: number;
  lgPageWidth: number;
  radius: string;
}

function AddGrader({ basePageWidth, mdPageWidth, lgPageWidth, radius }: AddGraderProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    date_of_birth: "",
    gender: "",
    class: "",
    basic_language: "",
    school: "",
    profile_image: "",
  });
  const [status, setStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const selectCollections = {
    genders: createListCollection({
      items: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
    }),

    languages: createListCollection({
      items: [
        { label: "English", value: "english" },
        { label: "Zulu", value: "zulu" },
        { label: "Afrikaans", value: "afrikaans" },
      ],
    }),

    classes: createListCollection({
      items: [
        { label: "Creche / Day Care", value: "creche" },
        { label: "Kindergarten 1", value: "kg_1" },
        { label: "Kindergarten 2", value: "kg_2" },
        { label: "Primary 1", value: "primary1" },
        { label: "Primary 2", value: "primary2" },
        { label: "Primary 3", value: "primary3" },
        { label: "Primary 4", value: "primary4" },
        { label: "Primary 5", value: "primary5" },
        { label: "Junior Secondary School 1", value: "jss1" },
        { label: "Junior Secondary School 2", value: "jss2" },
        { label: "Junior Secondary School 3", value: "jss3" },
        { label: "Senior Secondary School 1", value: "sss1" },
        { label: "Senior Secondary School 2", value: "sss2" },
        { label: "Senior Secondary School 3", value: "sss3" },
      ],
    }),
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `students/${fileName}`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Uploading image...");

    const parentId = await getParentId();
    if (!parentId) {
      setStatus("Parent not found or not authenticated.");
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setStatus("Image upload failed.");
      return;
    }

    setStatus("Adding student...");

    const { error } = await supabase.from("students").insert({
      ...formData,
      profile_image: imageUrl,
      parent_id: parentId,
    });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Student added successfully!");
    }
  };

  return (
    <Box
      as="section"
      bg="white"
      boxShadow="lg"
      p={{ base: "5", md: "10" }}
      m="auto"
      w={{
        base: `${basePageWidth}%`,
        md: `${mdPageWidth}%`,
        lg: `${lgPageWidth}%`,
      }}
      rounded={radius}
      mb={{ base: "24", lg: "10" }}
    >
      <Box w={{ base: "3/4", md: "1/2" }} m="auto" textAlign="center">
        <Heading
          as="h1"
          fontSize="3xl"
          color="backgroundColor2"
          fontWeight={700}
          mt={{base: '14', md: '5'}}
        >
          Student Credentials
        </Heading>
        <Text fontSize="sm" my={1} color="on_containerColor" fontWeight={400}>
          Please fill the field provided correctly
        </Text>
      </Box>

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
              <Image src={manikin} alt="add profile photo" boxSize="40px" />
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

      <form onSubmit={handleSubmit}>
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="6"
          my="10"
        >
          {["firstname", "lastname", "email", "school", "date_of_birth"].map(
            (index, field) => (
              <Field.Root key={field}>
                <Field.Label color="on_backgroundColor" fontSize="xs">
                  {index
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Field.Label>
                <Input
                  name={index}
                  placeholder={index
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  onChange={handleChange}
                  required
                  type={
                    index === "email"
                      ? "email"
                      : index === "date_of_birth"
                      ? "date"
                      : "text"
                  }
                  border="none"
                  bg="textFieldColor"
                  fontSize="xs"
                />
              </Field.Root>
            )
          )}

          {/* gender select */}
          <Select.Root
            collection={selectCollections.genders}
            size="md"
            onValueChange={(e) =>
              setFormData({ ...formData, gender: e.value[0] })
            }
          >
            <label htmlFor="gender" style={{ fontSize: "0.75rem" }}>
              Gender
            </label>
            <Select.HiddenSelect name="gender" />
            <Select.Control>
              <Select.Trigger
                border="none"
                outline="none"
                bg="textFieldColor"
                cursor="pointer"
              >
                <Select.ValueText placeholder="Select gender" fontSize="xs" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {selectCollections.genders.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* languages select */}
          <Select.Root
            collection={selectCollections.languages}
            size="md"
            onValueChange={(e) =>
              setFormData({ ...formData, basic_language: e.value[0] })
            }
          >
            <label htmlFor="language" style={{ fontSize: "0.75rem" }}>
              Basic Language
            </label>
            <Select.HiddenSelect name="language" />
            <Select.Control>
              <Select.Trigger
                border="none"
                outline="none"
                bg="textFieldColor"
                cursor="pointer"
              >
                <Select.ValueText
                  placeholder="Select Basic Language"
                  fontSize="xs"
                />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {selectCollections.languages.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* classes select */}
          <Select.Root
            collection={selectCollections.classes}
            size="md"
            onValueChange={(e) =>
              setFormData({ ...formData, class: e.value[0] })
            }
          >
            <label htmlFor="class" style={{ fontSize: "0.75rem" }}>
              Class
            </label>
            <Select.HiddenSelect name="class" />
            <Select.Control>
              <Select.Trigger
                border="none"
                outline="none"
                bg="textFieldColor"
                cursor="pointer"
              >
                <Select.ValueText placeholder="Select Class" fontSize="xs" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {selectCollections.classes.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Grid>
        <Flex justify="center" align="center" w="full">
          <Button
            type="submit"
            w={{ base: "100%", md: "80%", lg: "80%" }}
            m="auto"
            rounded="xl"
            bg="primaryColor"
          >
            Add Child
          </Button>
        </Flex>
        <Text mt={2}>{status}</Text>
      </form>
    </Box>
  );
}

export default AddGrader;
