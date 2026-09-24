import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Textarea,
  Input,
  Badge,
  Grid,
  NativeSelect,
} from "@chakra-ui/react";
import {
  FiSend,
  FiX,
  FiClock,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { classChangeService } from "@/services/classChangeService";
import type { ClassChangeRequest } from "@/services/classChangeService";
import { useUser } from "@/parent-app/context/parentDataContext";

const AVAILABLE_CLASSES = [
  { value: "JSS 1", label: "Junior Secondary School 1 (JSS 1)" },
  { value: "JSS 2", label: "Junior Secondary School 2 (JSS 2)" },
  { value: "JSS 3", label: "Junior Secondary School 3 (JSS 3)" },
  { value: "SSS 1", label: "Senior Secondary School 1 (SSS 1)" },
  { value: "SSS 2", label: "Senior Secondary School 2 (SSS 2)" },
  { value: "SSS 3", label: "Senior Secondary School 3 (SSS 3)" },
];

export interface ParentChildStudent {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  school?: string;
  class?: string;
  parent_id?: string | null;
  [key: string]: any;
}

interface ParentClassChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ParentChildStudent[];
  selectedStudentId?: string;
  onSuccess?: () => void;
}

export const ParentClassChangeModal = ({
  isOpen,
  onClose,
  childrenList,
  selectedStudentId,
  onSuccess,
}: ParentClassChangeModalProps) => {
  const { user, parent } = useUser();
  const parentProfile = parent?.[0];

  const [activeChildId, setActiveChildId] = useState<string>(
    selectedStudentId || childrenList?.[0]?.id || ""
  );

  const selectedChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];

  const [requestedClass, setRequestedClass] = useState<string>("JSS 2");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pending request check for currently selected child
  const [existingRequests, setExistingRequests] = useState<ClassChangeRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (selectedStudentId) {
      setActiveChildId(selectedStudentId);
    } else if (childrenList.length > 0 && !activeChildId) {
      setActiveChildId(childrenList[0].id);
    }
  }, [selectedStudentId, childrenList]);

  // Load existing requests when activeChildId changes
  useEffect(() => {
    if (!activeChildId || !isOpen) return;

    let isMounted = true;
    setLoadingRequests(true);

    classChangeService
      .getStudentRequests(activeChildId)
      .then((reqs) => {
        if (isMounted) {
          setExistingRequests(reqs);
        }
      })
      .catch((err) => console.warn("Could not load child requests:", err))
      .finally(() => {
        if (isMounted) setLoadingRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChildId, isOpen]);

  // Default target class to something different from the child's current class
  useEffect(() => {
    if (selectedChild?.class) {
      const current = selectedChild.class.trim();
      const firstDifferent = AVAILABLE_CLASSES.find((c) => c.value !== current);
      if (firstDifferent) {
        setRequestedClass(firstDifferent.value);
      }
    }
  }, [selectedChild?.id, selectedChild?.class]);

  if (!isOpen) return null;

  const pendingRequest = existingRequests.find((r) => r.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedChild) {
      setFormError("Please select a child.");
      return;
    }

    if (!requestedClass || requestedClass === selectedChild.class) {
      setFormError("Requested class must be different from the child's current class.");
      return;
    }

    if (!reason.trim()) {
      setFormError("Please provide a reason for the class change request.");
      return;
    }

    if (reason.trim().length < 10) {
      setFormError("Please provide a more detailed reason (at least 10 characters).");
      return;
    }

    const parentId = parentProfile?.id || user?.id;
    if (!parentId) {
      setFormError("Could not resolve authenticated parent identity. Please reload the page.");
      return;
    }

    const parentFullName = parentProfile
      ? `${parentProfile.firstname || ""} ${parentProfile.lastname || ""}`.trim()
      : user?.user_metadata?.full_name || "Parent";

    const parentEmail = parentProfile?.email || user?.email || "";

    setIsSubmitting(true);
    try {
      await classChangeService.submitRequest({
        student_id: selectedChild.id,
        student_name: `${selectedChild.firstname || ""} ${selectedChild.lastname || ""}`.trim(),
        student_email: selectedChild.email || "",
        current_class_name: selectedChild.class || "Unassigned",
        requested_class_name: requestedClass,
        reason: reason.trim(),
        initiated_by_type: "parent",
        initiated_by_user_id: parentId,
        parent_id: parentId,
        parent_name: parentFullName,
        parent_email: parentEmail,
      });

      toaster.create({
        title: "Class Change Request Submitted",
        description: `Your request for ${selectedChild.firstname} to transfer to ${requestedClass} has been submitted for administrative review.`,
        type: "success",
        duration: 5000,
      });

      setReason("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to submit class change request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.700"
      backdropFilter="blur(4px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        p={{ base: 5, md: 7 }}
        maxW="560px"
        w="full"
        position="relative"
        maxH="90vh"
        overflowY="auto"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="gray.100">
          <HStack gap={2.5}>
            <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
              <Icon as={FiSend} boxSize={5} />
            </Box>
            <Box>
              <Heading fontSize="md" fontWeight="800" color="gray.900">
                Request Child Class Change
              </Heading>
              <Text fontSize="11px" color="gray.500">
                Official Administrative Class Transfer Request
              </Text>
            </Box>
          </HStack>
          <Button
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ color: "gray.700" }}
            onClick={onClose}
          >
            <Icon as={FiX} boxSize={4} />
          </Button>
        </Flex>

        {/* Informative Guidance */}
        <Flex gap={2.5} p={3} bg="blue.50/60" border="1px solid" borderColor="blue.100" borderRadius="xl" mb={4}>
          <Icon as={FiShield} color="blue.600" boxSize={4} mt={0.5} flexShrink={0} />
          <Text fontSize="12px" color="blue.900" lineHeight="1.5">
            Class assignments are protected academic records. Submitting this form requests an administrator to transfer your child's syllabus, course content, and learning metrics.
          </Text>
        </Flex>

        {formError && (
          <Flex gap={2} bg="red.50" border="1px solid" borderColor="red.200" color="red.700" p={3} borderRadius="lg" mb={4} fontSize="xs" align="center">
            <Icon as={FiAlertCircle} boxSize={4} flexShrink={0} />
            <Text>{formError}</Text>
          </Flex>
        )}

        {/* Existing Pending Request Notice */}
        {pendingRequest ? (
          <Box bg="amber.50" border="1px solid" borderColor="amber.300" borderRadius="xl" p={4} mb={4}>
            <HStack gap={2} mb={2}>
              <Icon as={FiClock} color="amber.700" boxSize={4} />
              <Text fontSize="13px" fontWeight="700" color="amber.900">
                Class Change Request — Pending Admin Review
              </Text>
            </HStack>
            <Text fontSize="12px" color="amber.900" mb={3} lineHeight="1.5">
              An active class change request for <strong>{selectedChild?.firstname}</strong> is already awaiting administrative approval. Only one pending request is permitted at a time.
            </Text>

            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="amber.200" fontSize="12px">
              <Flex justify="space-between" mb={1.5}>
                <Text color="gray.500">Target Class:</Text>
                <Badge bg="blue.50" color="blue.700" fontWeight="700">
                  {pendingRequest.requested_class_name}
                </Badge>
              </Flex>
              <Flex justify="space-between" mb={1.5}>
                <Text color="gray.500">Initiator:</Text>
                <Text fontWeight="600" color="gray.800">
                  {pendingRequest.initiated_by_type === "parent" ? "Requested by You (Parent)" : "Requested by Student"}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={1.5}>
                <Text color="gray.500">Submitted On:</Text>
                <Text color="gray.800">
                  {new Date(pendingRequest.submitted_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </Flex>
              <Box mt={2} pt={2} borderTop="1px dashed" borderColor="amber.200">
                <Text color="gray.500" fontSize="11px" mb={0.5}>Reason Stated:</Text>
                <Text color="gray.700" fontStyle="italic">"{pendingRequest.reason}"</Text>
              </Box>
            </Box>

            <Flex justify="flex-end" mt={4}>
              <Button size="sm" variant="outline" colorPalette="gray" onClick={onClose}>
                Close
              </Button>
            </Flex>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {/* Child Selector */}
              {childrenList.length > 1 ? (
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.700" mb={1}>
                    Select Child *
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={activeChildId}
                      onChange={(e) => setActiveChildId(e.target.value)}
                      fontSize="xs"
                      h="40px"
                      borderRadius="md"
                      borderColor="gray.300"
                      bg="white"
                    >
                      {childrenList.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.firstname} {child.lastname} — Current: {child.class || "Unassigned"} ({child.school || "School"})
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              ) : selectedChild ? (
                <Box p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                  <Text fontSize="11px" fontWeight="600" color="gray.500">
                    Child
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="gray.900">
                    {selectedChild.firstname} {selectedChild.lastname}
                  </Text>
                  <Text fontSize="11px" color="gray.500">
                    {selectedChild.school || "School Not Set"} • {selectedChild.email || "No email"}
                  </Text>
                </Box>
              ) : null}

              {/* Class Comparison Grid */}
              <Grid templateColumns="1fr 1fr" gap={3}>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1}>
                    Current Class
                  </Text>
                  <Input
                    readOnly
                    value={selectedChild?.class || "Unassigned"}
                    bg="gray.100"
                    color="gray.700"
                    fontWeight="700"
                    fontSize="xs"
                    h="40px"
                    borderRadius="md"
                  />
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.700" mb={1}>
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
                        <option
                          key={cls.value}
                          value={cls.value}
                          disabled={cls.value === selectedChild?.class}
                        >
                          {cls.label} {cls.value === selectedChild?.class ? "(Current)" : ""}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              </Grid>

              {/* Reason Input */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="gray.700" mb={1}>
                  Reason for Request *
                </Text>
                <Textarea
                  placeholder="Explain why you are requesting a class change for your child (e.g. academic promotion, curriculum alignment, school advancement)."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fontSize="xs"
                  rows={4}
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "blue.500" }}
                  resize="vertical"
                />
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="10px" color="gray.400">
                    A clear reason helps the administration process your request promptly.
                  </Text>
                  <Text fontSize="10px" color={reason.length < 10 ? "amber.600" : "green.600"} fontWeight="600">
                    {reason.length} / 10 min chars
                  </Text>
                </Flex>
              </Box>

              {/* Actions */}
              <Flex justify="flex-end" gap={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  colorPalette="blue"
                  fontWeight="700"
                  loading={isSubmitting || loadingRequests}
                  disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
                >
                  <Icon as={FiCheckCircle} mr={1} boxSize={4} />
                  Submit Request for Admin Review
                </Button>
              </Flex>
            </VStack>
          </form>
        )}
      </Box>
    </Box>
  );
};
