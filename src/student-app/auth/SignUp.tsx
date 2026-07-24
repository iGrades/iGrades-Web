import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePassKey } from "@/parent-app/context/passkeyContext";
import {
  Input,
  Button,
  Box,
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

import { NIGERIA_STATES_DATA } from "@/lib/nigeriaGeoData";

function StudentSignUp() {
  const { setAuthdStudent } = useAuthdStudentData();
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
    state: "",
    lga: "",
    city: "",
    street_address: "",
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
        { label: "English", value: "en" },
        { label: "Hausa", value: "ha" },
        { label: "Yoruba", value: "yo" },
        { label: "Igbo", value: "ig" },
        { label: "Akan", value: "ak" },
        { label: "Fulani/Fula", value: "ff" },
        { label: "Wolof", value: "wo" },
        { label: "French", value: "fr" },
        { label: "Portuguese", value: "pt" },
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

  const classesCategories = Object.entries(
    groupBy(
      selectCollections.classes.items,
      (item: { label: string; value: string; category?: string }) =>
        item.category ?? "Uncategorized"
    )
  );

  const statesCollection = createListCollection({
    items: Object.keys(NIGERIA_STATES_DATA).map((s) => ({ label: s, value: s })),
  });

  const lgasCollection = createListCollection({
    items: formData.state
      ? NIGERIA_STATES_DATA[formData.state as keyof typeof NIGERIA_STATES_DATA].lgas.map((l) => ({ label: l, value: l }))
      : [],
  });

  const citiesCollection = createListCollection({
    items: formData.state
      ? NIGERIA_STATES_DATA[formData.state as keyof typeof NIGERIA_STATES_DATA].cities.map((c) => ({ label: c, value: c }))
      : [],
  });



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

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
        p_state: formData.state,
        p_lga: formData.lga,
        p_city: formData.city,
        p_street_address: formData.street_address,
      });

      if (error) {
        console.error("Full error details:", error);
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

      let student: any = null;

      try {
        const { data, error: loginError } = await supabase.rpc("get_student_by_credentials", {
          p_email: formData.email,
          p_enc_passcode: encrypt(passkey.join(""), encKey),
        });

        if (!loginError && data) {
          if (Array.isArray(data) && data.length > 0) {
            student = data[0];
          } else if (!Array.isArray(data) && typeof data === "object" && (data as any)?.id) {
            student = data;
          }
        }
      } catch (err) {
        console.warn("RPC post-signup login warning:", err);
      }

      if (!student) {
        const { data: directData, error: directError } = await supabase
          .from("students")
          .select("*")
          .eq("email", formData.email)
          .eq("passcode", encrypt(passkey.join(""), encKey));

        if (!directError && directData && Array.isArray(directData) && directData.length > 0) {
          student = directData[0];
        }
      }

      if (!student) {
        setAlert({ status: "error", message: "Registration succeeded, please sign in." });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      setAuthdStudent(student);

      setAlert({
        status: "success",
        message: `Welcome ${student.firstname || "Student"}! Your Profile has been created successfully.`,
      });

      setTimeout(() => navigate("/course-selection"), 2000);

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
        state: "",
        lga: "",
        city: "",
        street_address: "",
      });
      setPassKey([]);
    } catch (error: unknown) {
      setAlert({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <>
      <Box as="section" bg="white" w="full" m="auto">
        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            gap="4"
            my="4"
          >
            {["firstname", "lastname", "email", "date_of_birth"].map(
              (index, field) => (
                <Field.Root key={field}>
                  <Field.Label
                    color="#334155"
                    fontSize="sm"
                    fontWeight="600"
                    mb={1.5}
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
                    onChange={handleChange}
                    required
                    type={
                      index === "email"
                        ? "email"
                        : index === "date_of_birth"
                        ? "date"
                        : "text"
                    }
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    h="11"
                    fontSize="sm"
                    px={4}
                    _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                    _placeholder={{ color: "gray.400" }}
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
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Gender
              </label>
              <Select.HiddenSelect name="gender" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="white"
                  cursor="pointer"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText placeholder="Select gender" fontSize="sm" />
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
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Basic Language
              </label>
              <Select.HiddenSelect name="language" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="white"
                  cursor="pointer"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText
                    placeholder="Select Basic Language"
                    fontSize="sm"
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
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Class
              </label>
              <Select.HiddenSelect name="class" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  cursor="pointer"
                  bg="white"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText placeholder="Select Class" fontSize="sm" />
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
                        <Select.ItemGroupLabel fontWeight={700} color="primaryColor">
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

            {/* State select */}
            <Select.Root
              collection={statesCollection}
              size="md"
              onValueChange={(e) =>
                setFormData({
                  ...formData,
                  state: e.value[0],
                  lga: "",
                  city: "",
                  street_address: "",
                })
              }
            >
              <label
                htmlFor="state"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                State
              </label>
              <Select.HiddenSelect name="state" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="white"
                  cursor="pointer"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText placeholder="Select State" fontSize="sm" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {statesCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {/* LGA select */}
            <Select.Root
              collection={lgasCollection}
              disabled={!formData.state}
              size="md"
              onValueChange={(e) =>
                setFormData({ ...formData, lga: e.value[0] })
              }
            >
              <label
                htmlFor="lga"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                LGA
              </label>
              <Select.HiddenSelect name="lga" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="white"
                  cursor="pointer"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText
                    placeholder={
                      formData.state ? "Select LGA" : "Select State first"
                    }
                    fontSize="sm"
                  />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {lgasCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {/* City select */}
            <Select.Root
              collection={citiesCollection}
              disabled={!formData.state}
              size="md"
              onValueChange={(e) =>
                setFormData({ ...formData, city: e.value[0] })
              }
            >
              <label
                htmlFor="city"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                City
              </label>
              <Select.HiddenSelect name="city" />
              <Select.Control>
                <Select.Trigger
                  outline="none"
                  bg="white"
                  cursor="pointer"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  h="11"
                  px={4}
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                >
                  <Select.ValueText
                    placeholder={
                      formData.state ? "Select City" : "Select State first"
                    }
                    fontSize="sm"
                  />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {citiesCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {/* Street Address input */}
            <Box>
              <label
                htmlFor="street_address"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Street Address
              </label>
              <Input
                name="street_address"
                value={formData.street_address}
                placeholder="Enter Street Address"
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                required
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                h="11"
                fontSize="sm"
                px={4}
                _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                _placeholder={{ color: "gray.400" }}
              />
            </Box>

            <Box>
              <label
                htmlFor="passcode"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Passkey
              </label>

              <Flex justify="center" align="end" h="11" mb="2px">
                <PinInput.Root
                  size="md"
                  value={passkey}
                  onValueChange={(e) => setPassKey(e.value)}
                >
                  <PinInput.HiddenInput />
                  <PinInput.Control style={{ gap: "8px" }}>
                    <PinInput.Input index={0} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                    <PinInput.Input index={1} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                    <PinInput.Input index={2} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                    <PinInput.Input index={3} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                    <PinInput.Input index={4} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                    <PinInput.Input index={5} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" fontWeight="700" h="11" w="11" _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }} />
                  </PinInput.Control>
                </PinInput.Root>
              </Flex>
            </Box>
          </Grid>

          {/* alert */}
          {alert && (
            <Alert.Root
              status={alert.status}
              borderRadius="xl"
              my={4}
              fontSize="sm"
            >
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title fontSize="sm" fontWeight="700">
                  {alert.status === "error" ? "Error" : "Success"}:
                </Alert.Title>
                <Alert.Description fontSize="xs">{alert.message}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Flex justify="center" align="center" w="full" mt={6}>
            <Button
              loading={isLoading}
              loadingText="Creating your account..."
              spinnerPlacement="start"
              type="submit"
              fontWeight="700"
              w="full"
              h="12"
              bg="primaryColor"
              color="white"
              borderRadius="xl"
              _hover={{ bg: "#1a5bbf" }}
              transition="all 0.2s"
              boxShadow="0 4px 12px rgba(32, 108, 225, 0.2)"
            >
              Create an Account
            </Button>
          </Flex>
        </form>
      </Box>
    </>
  );
}

export default StudentSignUp;
