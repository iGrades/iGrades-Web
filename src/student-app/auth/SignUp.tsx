import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePassKey } from "@/parent-app/context/passkeyContext";
import {
  Input,
  Button,
  Box,
  Text,
  Grid,
  Field,
  Flex,
  createListCollection,
  Select,
  Portal,
  Alert,
  PinInput,
} from "@chakra-ui/react";
import { groupBy } from "es-toolkit";
import { useNavigate } from "react-router-dom";
import { useAuthdStudentData } from "../context/studentDataContext";

function StudentSignUp() {
   const {  setAuthdStudent } = useAuthdStudentData();
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    date_of_birth: "",
    gender: "",
    class: "",
    basic_language: "",
    profile_image: "",
    subscription: "Basic",
    is_child: false,
    passcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passkey, setPassKey] = useState<string[]>([]);
  const [alert, setAlert] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const { encrypt } = usePassKey();
  const encKey = import.meta.env.VITE_ENC_KEY;

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
        item.category ?? "Uncategorized"
    )
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // function handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null); // Reset alert before submission

    try {
      const { error } = await supabase.rpc("register_student", {
        p_email: formData.email,
        p_firstname: formData.firstname,
        p_lastname: formData.lastname,
        p_date_of_birth: formData.date_of_birth,
        p_gender: formData.gender,
        p_class: formData.class,
        p_basic_language: formData.basic_language,
        p_subscription: formData.subscription,
        p_is_child: formData.is_child,
        p_passcode: encrypt(passkey.join(""), encKey),
      });

      if (error) {
        console.error("Full error details:", error);
        // user friendly error messages
        let friendlyMessage = "An unexpected error occurred.";

        if (error.message.includes("unique constraint")) {
          friendlyMessage = "This email is already registered.";
        } else if (error.message.includes("permission denied")) {
          friendlyMessage = "You don't have permission to register a student.";
        } else if (error.message.includes("null value in column")) {
          friendlyMessage = "A required field is missing.";
        }
        setIsLoading(false);
        throw new Error(friendlyMessage);
      }
      setIsLoading(false);
      setAlert({
        status: "success",
        message: "Student created successfully!",
      });

      // automatically login the user after registration
      const {data, error: loginError} = await supabase.rpc("get_student_by_credentials", {
        p_email: formData.email,
        p_enc_passcode: encrypt(passkey.join(""), encKey)
      })

      if (loginError || !data || data.length === 0) {
        console.error("Login error:", loginError);
        setAlert({ status: "error", message: "Login failed after registration." });
        return;
      }

      const student = data[0];
      setAuthdStudent(student);

       setAlert({
         status: "success",
         message: `Welcome ${student.firstname}! Your Profile has been created successfully.`,
       });

      setTimeout(() => navigate("/course-selection"), 2000);

      // Reset form
      setFormData({
        email: "",
        firstname: "",
        lastname: "",
        date_of_birth: "",
        gender: "",
        class: "",
        basic_language: "",
        profile_image: "",
        subscription: "Basic",
        is_child: false,
        passcode: "",
      });
      setPassKey([]);
    } catch (error: any) {
      setAlert({
        status: "error",
        message: error.message || "Something went wrong.",
      });
    }
  };

  return (
    <>
      <Box
        as="section"
        bg="white"
        px={{ base: "5", md: "5" }}
        m="auto"
        w="full"
        mb={{ base: "24", lg: "10" }}
      >
        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            gap="6"
            my="10"
          >
            {["firstname", "lastname", "email", "date_of_birth"].map(
              (index, field) => (
                <Field.Root key={field}>
                  <Field.Label
                    color="gray.600"
                    fontSize="xs"
                    fontWeight="medium"
                    my={1}
                  >
                    {index
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Field.Label>
                  <Input
                    name={index}
                    placeholder={index
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    _placeholder={{ fontSize: "xs" }}
                    onChange={handleChange}
                    required
                    type={
                      index === "email"
                        ? "email"
                        : index === "date_of_birth"
                        ? "date"
                        : "text"
                    }
                    bg="textFieldColor"
                    fontSize="xs"
                    border="1px solid #ccc"
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
              <label
                htmlFor="gender"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "400",
                  color: "#474256",
                  marginTop: "8px",
                }}
              >
                Gender
              </label>
              <Select.HiddenSelect name="gender" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="textFieldColor"
                  cursor="pointer"
                  fontSize="xs"
                  border="1px solid #ccc"
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
              <label
                htmlFor="language"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "400",
                  color: "#474256",
                  marginTop: "8px",
                }}
              >
                Basic Language
              </label>
              <Select.HiddenSelect name="language" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="textFieldColor"
                  cursor="pointer"
                  fontSize="xs"
                  border="1px solid #ccc"
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


            {/* Class select */}
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
                  <Select.ValueText placeholder="Select Class" fontSize="xs" />
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
            <Box>
              <label
                htmlFor="class"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "400",
                  color: "#474256",
                  marginTop: "8px",
                }}
              >
                Passkey
              </label>

              <Flex justify="center" align="end" my={2}>
                <PinInput.Root
                  size="md"
                  value={passkey}
                  onValueChange={(e) => setPassKey(e.value)}
                >
                  <PinInput.HiddenInput />
                  <PinInput.Control>
                    <PinInput.Input index={0} bg="gray.50" />
                    <PinInput.Input index={1} bg="gray.50" />
                    <PinInput.Input index={2} bg="gray.50" />
                    <PinInput.Input index={3} bg="gray.50" />
                    <PinInput.Input index={4} bg="gray.50" />
                    <PinInput.Input index={5} bg="gray.50" />
                  </PinInput.Control>
                </PinInput.Root>
              </Flex>
            </Box>
          </Grid>
          {/* alert */}
          {alert && (
            <Alert.Root
              status={alert.status}
              borderRadius="md"
              my={4}
              fontSize="sm"
            >
              <Alert.Indicator />
              <Alert.Title mr={2}>
                {alert.status === "error" ? "Error" : "Success"}:
              </Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          )}

          <Flex justify="center" align="center" w="full">
            <Button
              loading={isLoading}
              loadingText="Creating your account..."
              spinnerPlacement="start"
              type="submit"
              fontWeight="semibold"
              w={{ base: "100%", lg: "100%" }}
              p={6}
              bg="blue.500"
              color="white"
              borderRadius="3xl"
            >
              Create an Account
            </Button>
          </Flex>
          <Text mt={2}>{status}</Text>
        </form>
      </Box>
    </>
  );
}

export default StudentSignUp;
