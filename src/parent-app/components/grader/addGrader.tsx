

import { useState } from "react";
import { getParentId } from "../../utils/getParentId";
import { supabase } from "../../../lib/supabaseClient";
import { useStudentsData } from "../../context/studentsDataContext";
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
  Alert,
} from "@chakra-ui/react";
import { groupBy } from "es-toolkit";
import manikin from "@/assets/manikin.png";
import addPix from "@/assets/addPix.png";
import AddGraderSuccessPopover from "./addGraderSuccessPopover";
import SeniorCourses from "../courses/seniorCourses";
import JuniorCourses from "../courses/juniorCourses";

type AddGraderProps = {
  basePageWidth: number;
  mdPageWidth: number;
  lgPageWidth: number;
  radius: string;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddGrader({
  basePageWidth,
  mdPageWidth,
  lgPageWidth,
  radius,
  setShowBox,
}: AddGraderProps) {
  const { getGraderDetails } = useStudentsData();

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
    registered_courses: [],
    subscription: "Basic",
    is_child: true,
    passcode: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

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
        {
          label: "Junior Secondary School 1",
          value: "JSS 1",
          category: "Junior School",
        },
        {
          label: "Junior Secondary School 2",
          value: "JSS 2",
          category: "Junior School",
        },
        {
          label: "Junior Secondary School 3",
          value: "JSS 3",
          category: "Junior School",
        },
        {
          label: "Senior Secondary School 1",
          value: "SSS 1",
          category: "Senior School",
        },
        {
          label: "Senior Secondary School 2",
          value: "SSS 2",
          category: "Senior School",
        },
        {
          label: "Senior Secondary School 3",
          value: "SSS 3",
          category: "Senior School",
        },
      ],
    }),
  };

  // group classes list for mapping
  const classesCategories = Object.entries(
    groupBy(
      selectCollections.classes.items,
      (item: { label: string; value: string; category?: string }) =>
        item.category ?? "Uncategorized",
    ),
  );

  // Check if student is a senior (SSS) or junior (JSS)
  const isSeniorStudent = formData.class?.startsWith("SSS");
  const isJuniorStudent = formData.class?.startsWith("JSS");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // function handles image upload
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

  // function handles courses selection
  const handleCourseSelection = (courses: string[]) => {
    setSelectedCourses(courses);
  };

  // Function handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate course selection
    if (selectedCourses.length === 0 && (isSeniorStudent || isJuniorStudent)) {
      setAlert({
        status: "error",
        message: "Please select at least one course",
      });
      return;
    }

    setAlert({ status: "success", message: "Uploading image..." });

    const parentId = await getParentId();
    if (!parentId) {
      setAlert({
        status: "error",
        message: "Parent not found or not authenticated.",
      });
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setAlert({
        status: "error",
        message: "Image upload failed. Adding an image is required",
      });
      return;
    }

    setAlert({ status: "success", message: "Adding student..." });

    const { error } = await supabase.from("students").insert({
      ...formData,
      profile_image: imageUrl,
      parent_id: parentId,
      registered_courses: selectedCourses, // Add selected courses here
    });

    if (error) {
      setAlert({ status: "error", message: "Error: " + error.message });
    } else {
      setAlert({ status: "success", message: "Student created successfully!" });
      setFormData({
        email: "",
        firstname: "",
        lastname: "",
        date_of_birth: "",
        gender: "",
        class: "",
        basic_language: "",
        school: "",
        profile_image: "",
        registered_courses: [],
        subscription: "Basic",
        is_child: true,
        passcode: "",
      });
      setSelectedFile(null);
      setSelectedCourses([]); // Reset course selection

      setShowModal(true);
      setTimeout(() => {
        getGraderDetails();
      }, 2000); // Refresh grader details after 2 seconds
    }

    // Optional: Auto-dismiss alert after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  return (
    <>
      <Box
        as="section"
        bg="white"
        boxShadow="lg"
        p={{ base: "4", md: "10" }}
        m="auto"
        w={{
          base: `${basePageWidth}%`,
          md: `${mdPageWidth}%`,
          lg: `${lgPageWidth}%`,
        }}
        rounded={radius}
        mb={{ base: "120px", lg: "10" }}
        mt={{ base: 4, md: 0 }}
      >
        {/* Header Section */}
        <Box
          w={{ base: "full", md: "3/4", lg: "1/2" }}
          m="auto"
          textAlign="center"
        >
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "3xl" }}
            color="backgroundColor2"
            fontWeight={700}
            mt={{ base: "4", md: "15" }}
          >
            Student Credentials
          </Heading>
          <Text
            fontSize="sm"
            my={1}
            color="on_containerColor"
            fontWeight={400}
            px={4}
          >
            Please fill the field provided correctly
          </Text>
        </Box>

        {/* Profile Image Section */}
        <Box w="full" m="auto" textAlign="center">
          <Box position="relative" display="inline-block" mx="auto" mt={6}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              bg="textFieldColor"
              overflow="hidden"
              w={{ base: "80px", md: "90px" }}
              h={{ base: "80px", md: "90px" }}
              borderRadius="2xl"
            >
              {selectedFile ? (
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="profile preview"
                  fit="cover"
                  w="full"
                  h="full"
                />
              ) : (
                <Image src={manikin} alt="add profile photo" boxSize="35px" />
              )}
            </Box>

            <label>
              <Image
                src={addPix}
                alt="add button"
                boxSize="28px"
                position="absolute"
                bottom="0"
                right="0"
                transform="translate(25%, 25%)"
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

        {/* Form Grid */}
        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            // Tighter gap for mobile to keep the form compact
            gap={{ base: "4", md: "6" }}
            my={{ base: "6", md: "10" }}
          >
            {["firstname", "lastname", "email", "school", "date_of_birth"].map(
              (name, field) => (
                <Field.Root key={field}>
                  <Field.Label color="on_backgroundColor" fontSize="xs" mb={1}>
                    {name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Field.Label>
                  <Input
                    name={name}
                    placeholder={name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    onChange={handleChange}
                    required
                    type={
                      name === "email"
                        ? "email"
                        : name === "date_of_birth"
                          ? "date"
                          : "text"
                    }
                    border="none"
                    bg="textFieldColor"
                    fontSize="sm"
                    h="45px"
                  />
                </Field.Root>
              ),
            )}

            {/* Gender Select Wrapper */}
            <Box>
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
                    <Select.ValueText
                      placeholder="Select gender"
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
            </Box>

            {/* Language Select Wrapper */}
            <Box>
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
            </Box>

            {/* Class Select Wrapper */}
            <Box gridColumn={{ md: "span 2" }}>
              {" "}
              <Select.Root
                collection={selectCollections.classes}
                size="md"
                onValueChange={(e) =>
                  setFormData({ ...formData, class: e.value[0] })
                }
              >
                <label
                  htmlFor="class"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "400",
                    color: "#474256",
                    marginTop: "8px",
                  }}
                >
                  Class
                </label>
                <Select.HiddenSelect name="class" />
                <Select.Control>
                  <Select.Trigger
                    outline="none"
                    cursor="pointer"
                    bg="textFieldColor"
                    fontSize="xs"
                    border="1px solid #ccc"
                  >
                    <Select.ValueText
                      placeholder="Select Class"
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
                      {classesCategories.map(([category, items]) => (
                        <Select.ItemGroup key={category}>
                          <Select.ItemGroupLabel fontWeight={600}>
                            {category}
                          </Select.ItemGroupLabel>
                          {items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.ItemGroup>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
          </Grid>

          {/* Responsive Course Containers */}
          <Box mb={6} overflow="hidden">
            {isSeniorStudent && (
              <SeniorCourses onSelectionChange={handleCourseSelection} />
            )}
            {isJuniorStudent && (
              <JuniorCourses onSelectionChange={handleCourseSelection} />
            )}
          </Box>

          {/* Alerts */}
          {alert && (
            <Alert.Root
              status={alert.status}
              borderRadius="md"
              my={4}
              fontSize={{ base: "11px", md: "12px" }}
            >
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  {alert.status === "error" ? "Error" : "Success"}
                </Alert.Title>
                <Alert.Description>{alert.message}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Flex justify="center" align="center" w="full" mt={6}>
            <Button
              type="submit"
              w={{ base: "full", md: "80%" }}
              h="50px" 
              rounded="xl"
              bg="primaryColor"
              fontSize="md"
            >
              Add Child
            </Button>
          </Flex>
        </form>
      </Box>

      
      {showModal && (
        <AddGraderSuccessPopover
          setShowBox={setShowBox}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
}

export default AddGrader;
