

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
  NativeSelect,
  Alert,
} from "@chakra-ui/react";
import manikin from "@/assets/manikin.png";
import addPix from "@/assets/addPix.png";
import AddGraderSuccessPopover from "./addGraderSuccessPopover";
import SeniorCourses from "../courses/seniorCourses";
import JuniorCourses from "../courses/juniorCourses";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

type AddGraderProps = {
  basePageWidth: number;
  mdPageWidth: number;
  lgPageWidth: number;
  radius: string;
  showBox: boolean;
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

  const {
    effectivePlan,
    verifyAddChild,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useParentSubscriptionEntitlement();

  // Function handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check multiple children subscription limits
    const checkResult = verifyAddChild();
    if (!checkResult.allowed) {
      promptUpgrade(
        "Additional Child Connection",
        checkResult.requiredPlan,
        checkResult.reason
      );
      return;
    }

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
            <Field.Root>
              <Field.Label color="on_backgroundColor" fontSize="xs" mb={1}>
                Gender
              </Field.Label>
              <NativeSelect.Root size="md">
                <NativeSelect.Field
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  border="none"
                  bg="textFieldColor"
                  fontSize="sm"
                  h="45px"
                  cursor="pointer"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            {/* Language Select Wrapper */}
            <Field.Root>
              <Field.Label color="on_backgroundColor" fontSize="xs" mb={1}>
                Basic Language
              </Field.Label>
              <NativeSelect.Root size="md">
                <NativeSelect.Field
                  name="basic_language"
                  value={formData.basic_language}
                  onChange={handleChange}
                  required
                  border="none"
                  bg="textFieldColor"
                  fontSize="sm"
                  h="45px"
                  cursor="pointer"
                >
                  <option value="" disabled>Select Basic Language</option>
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                  <option value="ak">Akan</option>
                  <option value="ff">Fulani/Fula</option>
                  <option value="wo">Wolof</option>
                  <option value="fr">French</option>
                  <option value="pt">Portuguese</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            {/* Class Select Wrapper */}
            <Box gridColumn={{ md: "span 2" }}>
              <Field.Root>
                <Field.Label color="on_backgroundColor" fontSize="xs" mb={1}>
                  Class
                </Field.Label>
                <NativeSelect.Root size="md">
                  <NativeSelect.Field
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    border="none"
                    bg="textFieldColor"
                    fontSize="sm"
                    h="45px"
                    cursor="pointer"
                  >
                    <option value="" disabled>Select Class</option>
                    <optgroup label="Junior Secondary School">
                      <option value="JSS 1">Junior Secondary School 1 (JSS 1)</option>
                      <option value="JSS 2">Junior Secondary School 2 (JSS 2)</option>
                      <option value="JSS 3">Junior Secondary School 3 (JSS 3)</option>
                    </optgroup>
                    <optgroup label="Senior Secondary School">
                      <option value="SSS 1">Senior Secondary School 1 (SSS 1)</option>
                      <option value="SSS 2">Senior Secondary School 2 (SSS 2)</option>
                      <option value="SSS 3">Senior Secondary School 3 (SSS 3)</option>
                    </optgroup>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
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

      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
        portalType="parent"
      />
    </>
  );
}

export default AddGrader;
