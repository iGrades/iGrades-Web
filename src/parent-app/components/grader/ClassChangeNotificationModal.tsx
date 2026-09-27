import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  Icon,
  Grid,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiX,
  FiUser,
  FiShield,
  FiCalendar,
  FiUserCheck,
} from "react-icons/fi";
import { classChangeService, type ClassChangeRequest } from "@/services/classChangeService";
import { ClassChangeHistorySection } from "./ClassChangeHistorySection";

export interface ClassChangeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // The current decision request to display
  request?: ClassChangeRequest | null;
  // Alternatively, the studentId to load history and latest decision
  studentId?: string;
  childName?: string;
  onRequestNewClassChange?: () => void;
}

export const ClassChangeNotificationModal = ({
  isOpen,
  onClose,
  request: initialRequest,
  studentId: initialStudentId,
  childName: initialChildName,
  onRequestNewClassChange,
}: ClassChangeNotificationModalProps) => {
  const [currentRequest, setCurrentRequest] = useState<ClassChangeRequest | null>(
    initialRequest || null
  );
  const [historyRequests, setHistoryRequests] = useState<ClassChangeRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Determine active student ID
  const effectiveStudentId =
    initialRequest?.student_id || initialStudentId || "";

  useEffect(() => {
    if (initialRequest) {
      setCurrentRequest(initialRequest);
    }
  }, [initialRequest]);

  // Load requests for this student whenever the modal opens or student ID changes
  useEffect(() => {
    if (!isOpen || !effectiveStudentId) return;

    let isMounted = true;
    setLoadingHistory(true);

    classChangeService
      .getStudentRequests(effectiveStudentId)
      .then((reqs) => {
        if (!isMounted) return;
        setHistoryRequests(reqs);

        // If no explicit current request was passed, pick the latest reviewed or pending request
        if (!initialRequest && reqs.length > 0) {
          const reviewed = reqs.find((r) => r.status === "approved" || r.status === "rejected");
          setCurrentRequest(reviewed || reqs[0]);
        }
      })
      .catch((err) => {
        console.warn("Could not load class change history:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, effectiveStudentId, initialRequest]);

  if (!isOpen) return null;

  const displayChildName =
    currentRequest?.student_name ||
    initialChildName ||
    "Your Child";

  const isApproved = currentRequest?.status === "approved";
  const isRejected = currentRequest?.status === "rejected";
  const isPending = currentRequest?.status === "pending";

  const decisionDate = currentRequest?.reviewed_at
    ? new Date(currentRequest.reviewed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : currentRequest?.submitted_at
    ? new Date(currentRequest.submitted_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pending Evaluation";

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
      p={{ base: 3, sm: 4, md: 6 }}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        w="full"
        maxW={{ base: "100%", sm: "540px", md: "640px" }}
        maxH="92vh"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
      >
        {/* ─── MODAL HEADER ─── */}
        <Flex
          justify="space-between"
          align="center"
          px={{ base: 4, sm: 6 }}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
          bg="gray.50/80"
        >
          <HStack gap={3}>
            <Box
              p={2.5}
              borderRadius="xl"
              bg={
                isApproved
                  ? "green.100"
                  : isRejected
                  ? "red.100"
                  : "blue.100"
              }
              color={
                isApproved
                  ? "green.700"
                  : isRejected
                  ? "red.700"
                  : "blue.700"
              }
            >
              <Icon
                as={
                  isApproved
                    ? FiCheckCircle
                    : isRejected
                    ? FiAlertCircle
                    : FiClock
                }
                boxSize={5}
              />
            </Box>
            <Box>
              <Heading fontSize={{ base: "sm", sm: "md" }} fontWeight="800" color="gray.900">
                Class Change Notification
              </Heading>
              <Text fontSize="11px" color="gray.500" fontWeight="500">
                Official Academic Placement Decision • {displayChildName}
              </Text>
            </Box>
          </HStack>

          <Button
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ color: "gray.700", bg: "gray.200/60" }}
            borderRadius="full"
            p={1.5}
            onClick={onClose}
            aria-label="Close popup"
          >
            <Icon as={FiX} boxSize={4} />
          </Button>
        </Flex>

        {/* ─── SCROLLABLE CONTENT BODY ─── */}
        <Box
          p={{ base: 4, sm: 6 }}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          gap={5}
        >
          {/* 1. CURRENT DECISION BANNER */}
          {currentRequest ? (
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor={
                isApproved
                  ? "green.200"
                  : isRejected
                  ? "red.200"
                  : "amber.300"
              }
              bg={
                isApproved
                  ? "green.50/70"
                  : isRejected
                  ? "red.50/60"
                  : "amber.50/70"
              }
              p={{ base: 3.5, sm: 4 }}
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                flexDirection={{ base: "column", sm: "row" }}
                gap={2}
                mb={2}
              >
                <HStack gap={2}>
                  <Icon
                    as={
                      isApproved
                        ? FiCheckCircle
                        : isRejected
                        ? FiAlertCircle
                        : FiClock
                    }
                    color={
                      isApproved
                        ? "green.600"
                        : isRejected
                        ? "red.600"
                        : "amber.700"
                    }
                    boxSize={4}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="800"
                    color={
                      isApproved
                        ? "green.900"
                        : isRejected
                        ? "red.900"
                        : "amber.900"
                    }
                  >
                    {isApproved
                      ? "Class Change Approved"
                      : isRejected
                      ? "Class Change Request Not Approved"
                      : "Class Change Request Pending Review"}
                  </Text>
                </HStack>

                <Badge
                  colorPalette={
                    isApproved ? "green" : isRejected ? "red" : "amber"
                  }
                  variant="solid"
                  size="sm"
                  borderRadius="full"
                  px={2.5}
                  textTransform="uppercase"
                  fontSize="10px"
                  fontWeight="700"
                >
                  {currentRequest.status}
                </Badge>
              </Flex>

              <Text
                fontSize="xs"
                color={
                  isApproved
                    ? "green.800"
                    : isRejected
                    ? "red.800"
                    : "amber.800"
                }
                lineHeight="1.5"
              >
                {isApproved
                  ? `${displayChildName}'s class change has been officially approved. Learning modules, curriculum, and subject drills are now synchronized to ${currentRequest.new_class || currentRequest.requested_class_name}.`
                  : isRejected
                  ? `The academic administration has reviewed the request for ${displayChildName} to transfer from ${currentRequest.old_class} to ${currentRequest.requested_class_name}. At this time, the request was not approved.`
                  : `Your request to transfer ${displayChildName} to ${currentRequest.requested_class_name} is actively awaiting administrative review.`}
              </Text>
            </Box>
          ) : null}

          {/* 2. CURRENT DECISION KEY DETAILS GRID */}
          {currentRequest && (
            <Box
              bg="gray.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              p={{ base: 3.5, sm: 4 }}
            >
              <Text
                fontSize="11px"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={3}
              >
                Decision Details
              </Text>

              <Grid
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                gap={{ base: 3, sm: 4 }}
              >
                {/* Child Name */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Child's Name
                  </Text>
                  <HStack gap={1.5} mt={0.5}>
                    <Icon as={FiUser} color="blue.500" boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                      {displayChildName}
                    </Text>
                  </HStack>
                </Box>

                {/* Status */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Status
                  </Text>
                  <HStack gap={1.5} mt={0.5}>
                    <Badge
                      colorPalette={isApproved ? "green" : isRejected ? "red" : "amber"}
                      variant="subtle"
                      size="sm"
                      fontWeight="700"
                    >
                      {currentRequest.status.toUpperCase()}
                    </Badge>
                  </HStack>
                </Box>

                {/* Previous Class */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Previous Class
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color="gray.800" mt={0.5}>
                    {currentRequest.old_class || currentRequest.current_class_name || "Unassigned"}
                  </Text>
                </Box>

                {/* Requested / New Class */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    {isApproved ? "New Enrolled Class" : "Requested Class"}
                  </Text>
                  <HStack gap={1.5} mt={0.5}>
                    <Badge colorPalette="blue" variant="solid" size="sm" fontWeight="700">
                      {currentRequest.new_class || currentRequest.requested_class_name}
                    </Badge>
                  </HStack>
                </Box>

                {/* Decision Date */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Decision Date
                  </Text>
                  <HStack gap={1.5} mt={0.5}>
                    <Icon as={FiCalendar} color="gray.400" boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="600" color="gray.700">
                      {decisionDate}
                    </Text>
                  </HStack>
                </Box>

                {/* Admin / Reviewer */}
                <Box>
                  <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Admin / Reviewer
                  </Text>
                  <HStack gap={1.5} mt={0.5}>
                    <Icon as={FiUserCheck} color="gray.400" boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="600" color="gray.700">
                      {currentRequest.reviewed_by || "Academic Administration"}
                    </Text>
                  </HStack>
                </Box>
              </Grid>

              {/* Request Reason */}
              <Box mt={3.5} pt={3} borderTop="1px dashed" borderColor="gray.200">
                <Text fontSize="10px" color="gray.500" fontWeight="600" textTransform="uppercase" mb={1}>
                  Submitted Reason
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.700"
                  fontStyle="italic"
                  bg="white"
                  p={2.5}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  "{currentRequest.reason}"
                </Text>
              </Box>

              {/* Rejection Reason when applicable */}
              {isRejected && (
                <Box
                  mt={3}
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="lg"
                  p={3}
                >
                  <Flex align="center" gap={1.5} mb={1}>
                    <Icon as={FiAlertCircle} color="red.600" boxSize={3.5} />
                    <Text fontSize="11px" fontWeight="800" color="red.800" textTransform="uppercase">
                      Rejection Reason / Administrator Explanation
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="red.900" fontWeight="600" lineHeight="1.4">
                    {currentRequest.admin_note ||
                      "Prerequisite academic examinations, subject eligibility, or term requirements were not satisfied for this class placement."}
                  </Text>
                  <Text fontSize="10px" color="red.700" mt={1}>
                    {displayChildName}'s current class placement remains <strong>{currentRequest.old_class}</strong>.
                  </Text>
                </Box>
              )}

              {/* Approval Remarks when available */}
              {isApproved && currentRequest.admin_note && (
                <Box
                  mt={3}
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  borderRadius="lg"
                  p={3}
                >
                  <Flex align="center" gap={1.5} mb={1}>
                    <Icon as={FiCheckCircle} color="green.600" boxSize={3.5} />
                    <Text fontSize="11px" fontWeight="800" color="green.800" textTransform="uppercase">
                      Administrator Remarks
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="green.900" fontWeight="600">
                    {currentRequest.admin_note}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* 3. CLASS CHANGE HISTORY SECTION */}
          <ClassChangeHistorySection
            requests={historyRequests}
            childName={displayChildName}
            currentRequestId={currentRequest?.id}
            loading={loadingHistory}
          />
        </Box>

        {/* ─── MODAL FOOTER ─── */}
        <Flex
          justify="space-between"
          align="center"
          px={{ base: 4, sm: 6 }}
          py={3.5}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="gray.50/80"
          gap={2}
        >
          <HStack gap={1.5}>
            <Icon as={FiShield} color="gray.400" boxSize={3.5} />
            <Text fontSize="11px" color="gray.500">
              Read-only official academic placement records
            </Text>
          </HStack>

          <HStack gap={2}>
            {onRequestNewClassChange && !isPending && (
              <Button
                size="sm"
                variant="outline"
                colorPalette="blue"
                fontWeight="700"
                onClick={() => {
                  onClose();
                  onRequestNewClassChange();
                }}
              >
                Request Another Change
              </Button>
            )}

            <Button
              size="sm"
              colorPalette="gray"
              variant="solid"
              fontWeight="700"
              onClick={onClose}
            >
              Close
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
