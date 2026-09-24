import {
  Input,
  Box,
  Flex,
  Image,
  VStack,
  HStack,
  Field,
  Grid,
  GridItem,
  Button,
  Heading,
  Text,
  Icon,
  Badge,
  Textarea,
  NativeSelect,
} from "@chakra-ui/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { supabase } from "@/lib/supabaseClient";
import { FaCircleCheck } from "react-icons/fa6";
import {
  FiLock,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiX,
  FiBookOpen,
} from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { classChangeService } from "@/services/classChangeService";
import type { ClassChangeRequest } from "@/services/classChangeService";

// Class is excluded from direct profile editing (protected academic field)
const pageData = ["firstname", "lastname", "email", "school"];

const AVAILABLE_CLASSES = [
  { value: "JSS 1", label: "Junior Secondary School 1 (JSS 1)" },
  { value: "JSS 2", label: "Junior Secondary School 2 (JSS 2)" },
  { value: "JSS 3", label: "Junior Secondary School 3 (JSS 3)" },
  { value: "SSS 1", label: "Senior Secondary School 1 (SSS 1)" },
  { value: "SSS 2", label: "Senior Secondary School 2 (SSS 2)" },
  { value: "SSS 3", label: "Senior Secondary School 3 (SSS 3)" },
];

interface FormData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  school: string;
}

const StudentProfile = () => {
  const { authdStudent, setAuthdStudent } = useAuthdStudentData();

  const [formData, setFormData] = useState<FormData>({
    id: authdStudent?.id || "",
    firstname: authdStudent?.firstname || "",
    lastname: authdStudent?.lastname || "",
    email: authdStudent?.email || "",
    school: authdStudent?.school || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Class Change Requests state
  const [requests, setRequests] = useState<ClassChangeRequest[]>([]);
  const [_loadingRequests, setLoadingRequests] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedClass, setRequestedClass] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestFormError, setRequestFormError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!authdStudent?.id) return;
    setLoadingRequests(true);
    const list = await classChangeService.getStudentRequests(authdStudent.id);
    setRequests(list);
    setLoadingRequests(false);
  }, [authdStudent?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Sync form data when authdStudent updates
  useEffect(() => {
    if (authdStudent) {
      setFormData({
        id: authdStudent.id || "",
        firstname: authdStudent.firstname || "",
        lastname: authdStudent.lastname || "",
        email: authdStudent.email || "",
        school: authdStudent.school || "",
      });
    }
  }, [authdStudent]);

  const pendingRequest = requests.find((r) => r.status === "pending");
  const lastReviewedRequest = requests.find(
    (r) => r.status === "approved" || r.status === "rejected"
  );

  const handleEdit = async () => {
    setIsLoading(true);

    try {
      let imageUrl = authdStudent?.profile_image;

      // Upload and overwrite if a new file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${authdStudent?.id}.${fileExt}`;
        const filePath = `students/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toaster.create({
            title: "Photo Upload Failed",
            description: uploadError.message || "Failed to upload profile photo.",
            type: "error",
          });
          setIsLoading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update student record via RPC (Class is locked to authdStudent's existing class)
      const { data, error } = await supabase.rpc("update_student_profile", {
        p_id: formData.id,
        p_firstname: formData.firstname,
        p_lastname: formData.lastname,
        p_class: authdStudent?.class || "", // Protected: cannot be overridden by form
        p_email: formData.email,
        p_profile_image: imageUrl,
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No data returned from profile update");
      }

      // Update local context immediately
      setAuthdStudent((prev) => ({
        ...prev,
        ...data[0],
      }));

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Update failed:", err.message || err);
      toaster.create({
        title: "Profile Update Failed",
        description: err.message || "Could not save your profile changes. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRequestModal = () => {
    // Pick the first class that is not the student's current class
    const firstOther = AVAILABLE_CLASSES.find((c) => c.value !== authdStudent?.class);
    setRequestedClass(firstOther ? firstOther.value : "SSS 1");
    setRequestReason("");
    setRequestFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitClassChange = async () => {
    setRequestFormError(null);

    if (!requestedClass) {
      setRequestFormError("Please select the class you wish to change to.");
      return;
    }
    if (requestedClass === authdStudent?.class) {
      setRequestFormError("Requested class must be different from your current class.");
      return;
    }
    if (!requestReason || !requestReason.trim()) {
      setRequestFormError("Please explain why you are requesting this class change.");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const studentName = `${authdStudent?.firstname || ""} ${authdStudent?.lastname || ""}`.trim();
      const newReq = await classChangeService.submitRequest({
        student_id: authdStudent?.id || "",
        student_name: studentName,
        student_email: authdStudent?.email || "",
        current_class_name: authdStudent?.class || "Unassigned",
        requested_class_name: requestedClass,
        reason: requestReason.trim(),
      });

      toaster.create({
        title: "Class Change Request Submitted",
        description: "Your request has been forwarded to academic administrators for review.",
        type: "success",
        duration: 4000,
      });

      setRequests((prev) => [newReq, ...prev]);
      setIsModalOpen(false);
      setRequestReason("");
    } catch (err: any) {
      setRequestFormError(err.message || "Failed to submit request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const getDisplayLabel = (key: string): string => {
    const labels: Record<string, string> = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email",
      school: "School Name",
    };
    return labels[key] || key;
  };

  return (
    <>
      <VStack
        gap={6}
        mb={20}
        shadow={{ base: "none", md: "sm" }}
        p={{ base: 4, md: 8 }}
        rounded="xl"
        w="full"
        bg="white"
      >
        {/* Photo Section */}
        <Box
          position="relative"
          w={{ base: "100%", md: "3/4" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={{ base: 1, md: 4 }}
        >
          <Box position="relative" alignItems="center" display="flex" flexDirection="column">
            <Image
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : authdStudent?.profile_image || ""
              }
              alt="Profile"
              boxSize="90px"
              borderRadius="2xl"
              objectFit="cover"
              border="2px solid"
              borderColor="gray.100"
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
              colorPalette="blue"
              variant="outline"
              borderRadius="full"
              px={3}
            >
              Change Photo
            </Button>
          </Box>
        </Box>

        {/* ─── PROTECTED CLASS MANAGEMENT CARD ─── */}
        <Box
          w={{ base: "100%", md: "95%" }}
          border="1px solid"
          borderColor="blue.100"
          bg="blue.50/30"
          borderRadius="xl"
          p={{ base: 4, md: 5 }}
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            gap={3}
            mb={3}
          >
            <HStack gap={2}>
              <Icon as={FiBookOpen} color="blue.600" boxSize={4} />
              <Heading fontSize="sm" fontWeight="700" color="gray.800">
                Enrolled Class & Academic Level
              </Heading>
            </HStack>
            <Badge
              bg="gray.100"
              color="gray.600"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="10px"
              fontWeight="600"
              border="1px solid"
              borderColor="gray.200"
            >
              <Icon as={FiLock} mr={1} boxSize={2.5} />
              Protected Academic Field
            </Badge>
          </Flex>

          <Text fontSize="xs" color="gray.500" mb={4} lineHeight="1.5">
            Your class assignment controls your official syllabus curriculum, quiz topics, and WAEC/JAMB exam tracks. Students cannot directly modify their class. Changing class requires formal administrative approval.
          </Text>

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
            bg="white"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box>
              <Text fontSize="11px" fontWeight="600" color="gray.400" textTransform="uppercase">
                Current Assigned Class
              </Text>
              <HStack gap={2} mt={1}>
                <Heading fontSize="lg" fontWeight="800" color="blue.600">
                  {authdStudent?.class || "Unassigned"}
                </Heading>
                <Badge colorPalette="blue" size="sm" borderRadius="md">
                  Active
                </Badge>
              </HStack>
            </Box>

            {/* Class Change Action / Status Indicator */}
            {pendingRequest ? (
              <Badge
                bg="amber.50"
                color="amber.800"
                border="1px solid"
                borderColor="amber.300"
                borderRadius="lg"
                px={3}
                py={2}
                fontSize="11px"
                fontWeight="700"
              >
                <Icon as={FiClock} mr={1.5} color="amber.600" />
                Change Request Pending Review
              </Badge>
            ) : (
              <Button
                size="sm"
                colorPalette="blue"
                variant="solid"
                borderRadius="lg"
                onClick={handleOpenRequestModal}
                fontSize="xs"
                fontWeight="700"
                px={4}
              >
                <Icon as={FiSend} mr={1.5} />
                Request Class Change
              </Button>
            )}
          </Flex>

          {/* Pending Request Details Banner */}
          {pendingRequest && (
            <Box
              mt={3}
              bg="amber.50/80"
              border="1px solid"
              borderColor="amber.200"
              borderRadius="lg"
              p={4}
            >
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={2} mb={2}>
                <HStack gap={2}>
                  <Icon as={FiClock} color="amber.700" boxSize={4} />
                  <Text fontSize="xs" fontWeight="700" color="amber.900">
                    Class Change Request: Pending Admin Review
                  </Text>
                </HStack>
                <Text fontSize="10px" color="amber.700">
                  Submitted: {new Date(pendingRequest.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </Flex>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} my={2}>
                <Box bg="white" p={2.5} borderRadius="md" border="1px solid" borderColor="amber.200">
                  <Text fontSize="10px" color="gray.500" fontWeight="600">Current Class</Text>
                  <Text fontSize="xs" fontWeight="700" color="gray.800">{pendingRequest.old_class}</Text>
                </Box>
                <Box bg="white" p={2.5} borderRadius="md" border="1px solid" borderColor="amber.200">
                  <Text fontSize="10px" color="gray.500" fontWeight="600">Requested Class</Text>
                  <Text fontSize="xs" fontWeight="700" color="blue.700">{pendingRequest.requested_class_name}</Text>
                </Box>
              </Grid>

              <Box bg="white" p={2.5} borderRadius="md" border="1px solid" borderColor="amber.200" mt={2}>
                <Text fontSize="10px" color="gray.500" fontWeight="600">
                  {pendingRequest.initiated_by_type === "parent" ? "Reason Submitted by Parent:" : "Your Submitted Reason:"}
                </Text>
                <Text fontSize="xs" color="gray.700" fontStyle="italic" mt={0.5}>
                  "{pendingRequest.reason}"
                </Text>
                {pendingRequest.initiated_by_type === "parent" && (
                  <Badge bg="purple.50" color="purple.700" size="xs" mt={1}>
                    Submitted by Parent ({pendingRequest.parent_name || "Parent Account"})
                  </Badge>
                )}
              </Box>

              <Text fontSize="11px" color="amber.800" mt={3} lineHeight="1.4">
                * Your assigned class remains <strong>{pendingRequest.old_class}</strong> until an administrator reviews and approves this request. You cannot submit multiple requests while one is pending.
              </Text>
            </Box>
          )}

          {/* Previous Request Result (if resolved and not pending) */}
          {!pendingRequest && lastReviewedRequest && (
            <Box
              mt={3}
              bg={lastReviewedRequest.status === "approved" ? "green.50/80" : "gray.50"}
              border="1px solid"
              borderColor={lastReviewedRequest.status === "approved" ? "green.200" : "gray.200"}
              borderRadius="lg"
              p={3}
            >
              <Flex align="center" gap={2}>
                <Icon
                  as={lastReviewedRequest.status === "approved" ? FiCheckCircle : FiAlertCircle}
                  color={lastReviewedRequest.status === "approved" ? "green.600" : "gray.500"}
                  boxSize={4}
                />
                <Text fontSize="xs" fontWeight="700" color={lastReviewedRequest.status === "approved" ? "green.800" : "gray.700"}>
                  {lastReviewedRequest.status === "approved"
                    ? `Request Approved: Switched to ${lastReviewedRequest.new_class || lastReviewedRequest.requested_class_name}`
                    : `Previous Request (${lastReviewedRequest.requested_class_name}): Not Approved`}
                </Text>
              </Flex>
              {lastReviewedRequest.admin_note && (
                <Text fontSize="11px" color="gray.600" mt={1} pl={6}>
                  Admin note: "{lastReviewedRequest.admin_note}"
                </Text>
              )}
            </Box>
          )}
        </Box>

        {/* ─── EDITABLE PROFILE FIELDS ─── */}
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap={3}
          w={{ base: "100%", md: "95%" }}
        >
          {pageData.map((dataKey, index) => (
            <GridItem key={index} w="100%">
              <Box w="100%">
                <Field.Root>
                  <Field.Label fontSize="xs" textTransform="capitalize" my={2} mx={1}>
                    {getDisplayLabel(dataKey)}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={dataKey}
                  value={formData[dataKey as keyof FormData] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [dataKey]: e.target.value,
                    })
                  }
                  fontSize="xs"
                  p={6}
                  bg="textFieldColor"
                  outline="none"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  _placeholder={{ color: "greyOthers" }}
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
          type="button"
          fontWeight="semibold"
          w={{ base: "100%", md: "95%" }}
          my={3}
          p={6}
          bg="blue.500"
          color="white"
          borderRadius="xl"
          onClick={handleEdit}
        >
          Update Profile Information
        </Button>
      </VStack>

      {/* ─── REQUEST CLASS CHANGE MODAL ─── */}
      {isModalOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(15, 23, 42, 0.7)"
          zIndex={6000}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={{ base: 4, md: 6 }}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            p={{ base: 5, md: 7 }}
            maxW="540px"
            w="full"
            position="relative"
          >
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="gray.100">
              <HStack gap={2}>
                <Icon as={FiSend} color="blue.600" boxSize={5} />
                <Heading fontSize="md" fontWeight="800" color="gray.900">
                  Request Class Change
                </Heading>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "gray.700" }}
                onClick={() => setIsModalOpen(false)}
              >
                <Icon as={FiX} boxSize={4} />
              </Button>
            </Flex>

            <Text fontSize="xs" color="gray.500" mb={4} lineHeight="1.5">
              Submit a formal request to transfer your enrolled class. Your request will be reviewed by an administrator. Upon approval, your syllabus and course curriculum will automatically update.
            </Text>

            {requestFormError && (
              <Box bg="red.50" border="1px solid" borderColor="red.200" color="red.700" p={3} borderRadius="lg" mb={4} fontSize="xs">
                {requestFormError}
              </Box>
            )}

            <VStack gap={4} align="stretch">
              <Grid templateColumns="1fr 1fr" gap={3}>
                <Box>
                  <Text fontSize="11px" fontWeight="600" color="gray.500" mb={1}>
                    Current Class
                  </Text>
                  <Input
                    readOnly
                    value={authdStudent?.class || "Unassigned"}
                    bg="gray.100"
                    color="gray.700"
                    fontWeight="700"
                    fontSize="xs"
                    h="40px"
                    borderRadius="md"
                  />
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="600" color="gray.700" mb={1}>
                    Requested Class *
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={requestedClass}
                      onChange={(e) => setRequestedClass(e.target.value)}
                      fontSize="xs"
                      h="40px"
                      borderRadius="md"
                      borderColor="blue.300"
                      bg="white"
                    >
                      {AVAILABLE_CLASSES.map((cls) => (
                        <option key={cls.value} value={cls.value} disabled={cls.value === authdStudent?.class}>
                          {cls.label} {cls.value === authdStudent?.class ? "(Current)" : ""}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              </Grid>

              <Box>
                <Text fontSize="11px" fontWeight="600" color="gray.700" mb={1}>
                  Reason for Change *
                </Text>
                <Textarea
                  placeholder="Please explain why you are requesting this class change."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  fontSize="xs"
                  rows={4}
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                  resize="vertical"
                />
                <Text fontSize="10px" color="gray.400" mt={1}>
                  State clearly why you need this transfer (e.g. academic advancement, school promotion, or syllabus realignments).
                </Text>
              </Box>

              <Flex justify="flex-end" gap={3} pt={2} borderTop="1px solid" borderColor="gray.100">
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => setIsModalOpen(false)}
                  fontSize="xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  colorPalette="blue"
                  borderRadius="lg"
                  loading={isSubmittingRequest}
                  onClick={handleSubmitClassChange}
                  fontSize="xs"
                  fontWeight="700"
                  px={5}
                >
                  Submit Request
                </Button>
              </Flex>
            </VStack>
          </Box>
        </Box>
      )}

      {/* ─── SUCCESS MODAL ─── */}
      {showSuccessModal && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={5000}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={{ base: 4, md: 8 }}
        >
          <Box
            position="relative"
            width={{ base: "100%", sm: "85%", md: "60%", lg: "35%" }}
            maxH="90vh"
            bg="white"
            borderRadius="3xl"
            boxShadow="2xl"
            p={{ base: 6, md: 10 }}
            textAlign="center"
          >
            <VStack gap={4}>
              <Icon
                bg="green.50"
                boxSize={{ base: "60px", md: "70px" }}
                color="green.500"
                rounded="full"
                p={3}
              >
                <FaCircleCheck size="100%" />
              </Icon>

              <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} color="gray.900">
                Profile Updated!
              </Heading>

              <Text fontSize={{ base: "sm", md: "xs" }} color="gray.600" maxW="90%" lineHeight="tall">
                Your student profile details and photo have been successfully saved.
              </Text>

              <Box w="full" pt={4}>
                <Button
                  bg="blue.600"
                  color="white"
                  borderRadius="3xl"
                  h="50px"
                  w="full"
                  fontSize="sm"
                  fontWeight="bold"
                  _active={{ transform: "scale(0.97)" }}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Done
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </>
  );
};

export default StudentProfile;
