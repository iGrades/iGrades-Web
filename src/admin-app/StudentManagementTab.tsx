import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Stack,
  Badge,
  Grid,
  Table,
  Avatar,
  Icon,
  HStack,
  Tabs,
  Textarea,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowRight,
  FiShield,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { classChangeService } from "@/services/classChangeService";
import type { ClassChangeRequest } from "@/services/classChangeService";

export interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  class: string;
  subscription: string;
  subscription_status: string;
  last_payment_ref?: string;
  registered_courses: unknown[];
  created_at: string;
  is_child: boolean;
  parent_id: string | null;
}

interface StudentManagementTabProps {
  students: Student[];
  requests: ClassChangeRequest[];
  onRefresh: () => Promise<void>;
  currentAdmin: { id: string; name: string; email: string; role: string } | null;
  selectedRequestId?: string | null;
  onClearSelectedRequest?: () => void;
}

const fmt = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const StudentManagementTab = ({
  students,
  requests,
  onRefresh,
  currentAdmin,
  selectedRequestId,
  onClearSelectedRequest,
}: StudentManagementTabProps) => {
  const [sectionTab, setSectionTab] = useState<"requests" | "students">("requests");
  const [requestFilter, setRequestFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [reviewingRequest, setReviewingRequest] = useState<ClassChangeRequest | null>(() => {
    if (selectedRequestId) {
      return requests.find((r) => r.id === selectedRequestId) || null;
    }
    return null;
  });

  const [adminReason, setAdminReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  // Sync if selectedRequestId passed from notification
  if (selectedRequestId && (!reviewingRequest || reviewingRequest.id !== selectedRequestId)) {
    const target = requests.find((r) => r.id === selectedRequestId);
    if (target) {
      setReviewingRequest(target);
    }
  }

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesFilter = requestFilter === "all" || r.status === requestFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.student_name.toLowerCase().includes(q) ||
        r.student_email.toLowerCase().includes(q) ||
        r.requested_class_name.toLowerCase().includes(q) ||
        r.old_class.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [requests, requestFilter, search]);

  // Request status counts
  const pendingCount = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((r) => r.status === "approved").length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((r) => r.status === "rejected").length, [requests]);

  const handleReviewAction = async (action: "approve" | "reject") => {
    if (!reviewingRequest) return;

    if (action === "reject" && (!adminReason || !adminReason.trim())) {
      toaster.create({
        title: "Rejection Reason Required",
        description: "Please provide an explanation for rejecting this class change request.",
        type: "warning",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updated = await classChangeService.reviewRequest({
        requestId: reviewingRequest.id,
        admin_id: currentAdmin?.id || "admin",
        admin_name: currentAdmin?.name || "Administrator",
        admin_email: currentAdmin?.email || "admin@igrades.org",
        action,
        review_reason: adminReason.trim() || (action === "approve" ? "Approved by administrator" : "Not approved"),
      });

      toaster.create({
        title: action === "approve" ? "Class Change Approved!" : "Request Rejected",
        description:
          action === "approve"
            ? `${updated.student_name}'s class has been successfully changed to ${updated.requested_class_name}. Student notified via email.`
            : `Class change request for ${updated.student_name} rejected. Decision email dispatched.`,
        type: action === "approve" ? "success" : "info",
        duration: 4000,
      });

      setConfirmAction(null);
      setReviewingRequest(null);
      setAdminReason("");
      if (onClearSelectedRequest) onClearSelectedRequest();
      await onRefresh();
    } catch (err: any) {
      toaster.create({
        title: "Operation Failed",
        description: err.message || "Failed to process class change request.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Stack gap={6}>
      {/* Header */}
      <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
        <Box>
          <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">
            Student Management & Class Transfers
          </Heading>
          <Text fontSize="13px" color="gray.500" mt={1}>
            Review student class change requests, approve syllabus transfers, and inspect student records.
          </Text>
        </Box>

        <HStack gap={3}>
          {pendingCount > 0 && (
            <Badge
              bg="amber.50"
              color="amber.800"
              border="1px solid"
              borderColor="amber.300"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="12px"
              fontWeight="700"
              display="flex"
              alignItems="center"
              gap={1.5}
            >
              <Icon as={FiClock} color="amber.600" />
              {pendingCount} Pending Request{pendingCount > 1 ? "s" : ""}
            </Badge>
          )}

          <Button
            size="xs"
            variant="outline"
            borderColor="gray.200"
            color="gray.700"
            _hover={{ bg: "gray.50" }}
            borderRadius="lg"
            onClick={onRefresh}
            h="32px"
            px={3}
            fontSize="12px"
            fontWeight="600"
          >
            <Icon as={FiRefreshCw} boxSize={3.5} mr={1.5} />
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* KPI Cards */}
      <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="uppercase">Total Students</Text>
          <Heading fontSize="1.5rem" fontWeight="800" color="gray.900" mt={1}>{students.length}</Heading>
          <Text fontSize="11px" color="gray.500" mt={0.5}>Enrolled student accounts</Text>
        </Box>

        <Box
          bg={pendingCount > 0 ? "amber.50/50" : "white"}
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor={pendingCount > 0 ? "amber.200" : "gray.100"}
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="11px" fontWeight="700" color={pendingCount > 0 ? "amber.700" : "gray.400"} textTransform="uppercase">
              Pending Requests
            </Text>
            {pendingCount > 0 && (
              <Badge colorPalette="amber" size="sm" borderRadius="full">Requires Action</Badge>
            )}
          </Flex>
          <Heading fontSize="1.5rem" fontWeight="800" color={pendingCount > 0 ? "amber.800" : "gray.900"} mt={1}>
            {pendingCount}
          </Heading>
          <Text fontSize="11px" color={pendingCount > 0 ? "amber.600" : "gray.500"} mt={0.5}>
            Awaiting administrator review
          </Text>
        </Box>

        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Text fontSize="11px" fontWeight="700" color="green.600" textTransform="uppercase">Approved Transfers</Text>
          <Heading fontSize="1.5rem" fontWeight="800" color="green.700" mt={1}>{approvedCount}</Heading>
          <Text fontSize="11px" color="gray.500" mt={0.5}>Classes updated & confirmed</Text>
        </Box>

        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Text fontSize="11px" fontWeight="700" color="red.500" textTransform="uppercase">Rejected Requests</Text>
          <Heading fontSize="1.5rem" fontWeight="800" color="gray.700" mt={1}>{rejectedCount}</Heading>
          <Text fontSize="11px" color="gray.500" mt={0.5}>Maintained original class</Text>
        </Box>
      </Grid>

      {/* Tabs between Class Change Requests and All Students */}
      <Tabs.Root value={sectionTab} onValueChange={(e) => setSectionTab(e.value as any)}>
        <Tabs.List bg="gray.100" borderRadius="full" p={1} maxW="450px">
          <Tabs.Trigger
            value="requests"
            borderRadius="full"
            fontSize="13px"
            fontWeight="600"
            px={5}
            py={1.5}
            _selected={{ bg: "white", color: "blue.600", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            Class Change Requests ({requests.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="students"
            borderRadius="full"
            fontSize="13px"
            fontWeight="600"
            px={5}
            py={1.5}
            _selected={{ bg: "white", color: "blue.600", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            All Students Directory ({students.length})
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* ─── SECTION 1: CLASS CHANGE REQUESTS ─── */}
      {sectionTab === "requests" && (
        <Stack gap={4}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            {/* Filter pills */}
            <HStack gap={2}>
              {(
                [
                  { key: "pending", label: `Pending (${pendingCount})`, color: "amber" },
                  { key: "approved", label: `Approved (${approvedCount})`, color: "green" },
                  { key: "rejected", label: `Rejected (${rejectedCount})`, color: "red" },
                  { key: "all", label: `All Requests (${requests.length})`, color: "gray" },
                ] as const
              ).map((f) => (
                <Button
                  key={f.key}
                  size="xs"
                  borderRadius="full"
                  variant={requestFilter === f.key ? "solid" : "outline"}
                  colorPalette={f.color}
                  onClick={() => setRequestFilter(f.key)}
                  fontWeight="600"
                  px={3}
                >
                  {f.label}
                </Button>
              ))}
            </HStack>

            {/* Search */}
            <Box position="relative" maxW="280px" w="full">
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fontSize="12px"
                bg="white"
                borderRadius="lg"
                borderColor="gray.200"
                h="36px"
                px={3}
              />
            </Box>
          </Flex>

          {/* Table of Requests */}
          <Box borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.03)">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="gray.50">
                  {["Student", "Email", "Initiated By", "Current Class", "Requested Class", "Reason", "Submitted", "Status", "Actions"].map((h) => (
                    <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredRequests.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} textAlign="center" py={10}>
                      <Icon as={FiClock} boxSize={8} color="gray.300" mb={2} />
                      <Text fontSize="13px" fontWeight="600" color="gray.600">
                        No class change requests found
                      </Text>
                      <Text fontSize="11px" color="gray.400">
                        {requestFilter === "pending"
                          ? "There are currently no pending requests awaiting review."
                          : "No requests match the selected filter."}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredRequests.map((req) => (
                    <Table.Row
                      key={req.id}
                      bg={req.id === selectedRequestId ? "blue.50/40" : undefined}
                      _hover={{ bg: "blue.50/20" }}
                      transition="background 0.15s"
                    >
                      <Table.Cell py={3}>
                        <Flex align="center" gap={2.5}>
                          <Avatar.Root size="xs">
                            <Avatar.Fallback fontSize="11px" fontWeight="700" bg="blue.100" color="blue.700">
                              {req.student_name?.[0] || "S"}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <Text fontSize="13px" fontWeight="600" color="gray.900">
                            {req.student_name}
                          </Text>
                        </Flex>
                      </Table.Cell>

                      <Table.Cell fontSize="12px" color="gray.600">
                        {req.student_email || "N/A"}
                      </Table.Cell>

                      <Table.Cell>
                        {req.initiated_by_type === "parent" ? (
                          <Box>
                            <Badge bg="purple.50" color="purple.700" border="1px solid" borderColor="purple.200" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="700">
                              Requested by Parent
                            </Badge>
                            {req.parent_name && (
                              <Text fontSize="10px" color="gray.500" mt={0.5} truncate maxW="150px">
                                {req.parent_name}
                              </Text>
                            )}
                          </Box>
                        ) : (
                          <Badge bg="cyan.50" color="cyan.800" border="1px solid" borderColor="cyan.200" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="700">
                            Requested by Student
                          </Badge>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <Badge bg="gray.100" color="gray.700" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="700">
                          {req.old_class || req.current_class_name}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>
                        <HStack gap={1}>
                          <Icon as={FiArrowRight} color="blue.500" boxSize={3} />
                          <Badge bg="blue.50" color="blue.700" border="1px solid" borderColor="blue.200" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="800">
                            {req.requested_class_name}
                          </Badge>
                        </HStack>
                      </Table.Cell>

                      <Table.Cell maxW="240px">
                        <Text fontSize="12px" color="gray.700" truncate title={req.reason}>
                          "{req.reason}"
                        </Text>
                      </Table.Cell>

                      <Table.Cell fontSize="11px" color="gray.500">
                        {fmt(req.submitted_at)}
                      </Table.Cell>

                      <Table.Cell>
                        <Badge
                          bg={
                            req.status === "pending"
                              ? "amber.50"
                              : req.status === "approved"
                              ? "green.50"
                              : "red.50"
                          }
                          color={
                            req.status === "pending"
                              ? "amber.800"
                              : req.status === "approved"
                              ? "green.800"
                              : "red.800"
                          }
                          border="1px solid"
                          borderColor={
                            req.status === "pending"
                              ? "amber.300"
                              : req.status === "approved"
                              ? "green.300"
                              : "red.300"
                          }
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                          fontSize="10px"
                          fontWeight="700"
                        >
                          {req.status.toUpperCase()}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>
                        <Button
                          size="xs"
                          variant={req.status === "pending" ? "solid" : "outline"}
                          colorPalette={req.status === "pending" ? "blue" : "gray"}
                          borderRadius="md"
                          onClick={() => {
                            setReviewingRequest(req);
                            setAdminReason(req.admin_note || "");
                          }}
                          fontSize="11px"
                          fontWeight="600"
                          h="26px"
                          px={2.5}
                        >
                          {req.status === "pending" ? "Review Request" : "View Details"}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      )}

      {/* ─── SECTION 2: ALL STUDENTS DIRECTORY ─── */}
      {sectionTab === "students" && (
        <Box borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.03)">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["Student Name", "Email", "Assigned Class", "Plan", "Status", "Child Account", "Joined Date"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {students.map((st) => (
                <Table.Row key={st.id} _hover={{ bg: "blue.50/20" }}>
                  <Table.Cell py={3}>
                    <Flex align="center" gap={2.5}>
                      <Avatar.Root size="xs">
                        <Avatar.Fallback fontSize="11px" fontWeight="700" bg="blue.100" color="blue.700">
                          {st.firstname?.[0] || "S"}{st.lastname?.[0] || ""}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text fontSize="13px" fontWeight="600" color="gray.900">
                        {st.firstname} {st.lastname}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="gray.600">{st.email}</Table.Cell>
                  <Table.Cell>
                    <Badge bg="blue.50" color="blue.700" border="1px solid" borderColor="blue.200" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="700">
                      {st.class || "Unassigned"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="gray.700">{st.subscription || "basic"}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={st.subscription_status === "active" ? "green" : "red"} size="sm" borderRadius="full">
                      {st.subscription_status || "inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontSize="11px" color="gray.600">{st.is_child ? "Yes" : "No"}</Table.Cell>
                  <Table.Cell fontSize="11px" color="gray.500">{fmt(st.created_at)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* ─── REVIEW & DETAILS MODAL ─── */}
      {reviewingRequest && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(15, 23, 42, 0.75)"
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
            maxW="600px"
            w="full"
            maxH="90vh"
            overflowY="auto"
            position="relative"
          >
            {/* Modal Header */}
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="gray.100">
              <HStack gap={2}>
                <Icon as={FiShield} color="blue.600" boxSize={5} />
                <Heading fontSize="md" fontWeight="800" color="gray.900">
                  {reviewingRequest.status === "pending"
                    ? "Review Class Change Request"
                    : "Class Change Request Audit Record"}
                </Heading>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "gray.700" }}
                onClick={() => {
                  setReviewingRequest(null);
                  setConfirmAction(null);
                  if (onClearSelectedRequest) onClearSelectedRequest();
                }}
              >
                <Icon as={FiX} boxSize={4} />
              </Button>
            </Flex>

            {/* Student & Class Transfer Summary Card */}
            <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" mb={4}>
              <Flex justify="space-between" align="center" mb={3}>
                <Flex align="center" gap={3}>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback bg="blue.600" color="white" fontWeight="700">
                      {reviewingRequest.student_name?.[0] || "S"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Box>
                    <Text fontSize="14px" fontWeight="800" color="gray.900">
                      {reviewingRequest.student_name}
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                      {reviewingRequest.student_email}
                    </Text>
                  </Box>
                </Flex>
                <Badge
                  colorPalette={
                    reviewingRequest.status === "pending"
                      ? "amber"
                      : reviewingRequest.status === "approved"
                      ? "green"
                      : "red"
                  }
                  size="sm"
                  borderRadius="full"
                  px={2.5}
                >
                  {reviewingRequest.status.toUpperCase()}
                </Badge>
              </Flex>

              <Grid templateColumns="1fr auto 1fr" gap={2} align="center" bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Box textAlign="center">
                  <Text fontSize="10px" color="gray.400" fontWeight="700" textTransform="uppercase">Current Class</Text>
                  <Text fontSize="13px" fontWeight="800" color="gray.700" mt={0.5}>{reviewingRequest.old_class}</Text>
                </Box>
                <Icon as={FiArrowRight} color="blue.500" boxSize={4} mx="auto" />
                <Box textAlign="center">
                  <Text fontSize="10px" color="blue.600" fontWeight="700" textTransform="uppercase">Requested Class</Text>
                  <Text fontSize="13px" fontWeight="800" color="blue.700" mt={0.5}>{reviewingRequest.requested_class_name}</Text>
                </Box>
              </Grid>
            </Box>

              {/* Initiator & Parent Details Card */}
              <Box bg="purple.50/40" p={3.5} borderRadius="lg" border="1px solid" borderColor="purple.200" mb={4}>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <Text fontSize="11px" fontWeight="700" color="purple.800" textTransform="uppercase">
                    Request Initiator
                  </Text>
                  <Badge
                    bg={reviewingRequest.initiated_by_type === "parent" ? "purple.100" : "cyan.100"}
                    color={reviewingRequest.initiated_by_type === "parent" ? "purple.800" : "cyan.800"}
                    fontWeight="700"
                    size="sm"
                  >
                    {reviewingRequest.initiated_by_type === "parent" ? "Parent Request" : "Student Direct Request"}
                  </Badge>
                </Flex>
                {reviewingRequest.initiated_by_type === "parent" ? (
                  <Box fontSize="12px" color="gray.800">
                    <Flex justify="space-between" py={0.5}>
                      <span style={{ color: "#6b7280" }}>Parent Name:</span>
                      <strong>{reviewingRequest.parent_name || "Verified Parent"}</strong>
                    </Flex>
                    {reviewingRequest.parent_email && (
                      <Flex justify="space-between" py={0.5}>
                        <span style={{ color: "#6b7280" }}>Parent Email:</span>
                        <span>{reviewingRequest.parent_email}</span>
                      </Flex>
                    )}
                    <Flex justify="space-between" py={0.5}>
                      <span style={{ color: "#6b7280" }}>Parent ID:</span>
                      <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{reviewingRequest.initiated_by_user_id || reviewingRequest.parent_id || "N/A"}</span>
                    </Flex>
                  </Box>
                ) : (
                  <Box fontSize="12px" color="gray.800">
                    <Text fontSize="12px" color="gray.700">
                      Submitted directly by student <strong>{reviewingRequest.student_name}</strong>.
                    </Text>
                    {reviewingRequest.parent_name && (
                      <Flex justify="space-between" py={0.5} mt={1} pt={1} borderTop="1px dashed" borderColor="purple.200">
                        <span style={{ color: "#6b7280" }}>Linked Parent Account:</span>
                        <span>{reviewingRequest.parent_name} ({reviewingRequest.parent_email || "Email linked"})</span>
                      </Flex>
                    )}
                  </Box>
                )}
              </Box>

              {/* Stated Reason */}
              <Box mb={4}>
                <Text fontSize="11px" fontWeight="700" color="gray.500" textTransform="uppercase" mb={1}>
                  {reviewingRequest.initiated_by_type === "parent" ? "Parent's Stated Reason" : "Student's Stated Reason"}
                </Text>
                <Box bg="blue.50/40" p={3.5} borderRadius="lg" border="1px solid" borderColor="blue.100">
                  <Text fontSize="12px" color="gray.800" lineHeight="1.5">
                    "{reviewingRequest.reason}"
                  </Text>
                  <Text fontSize="10px" color="gray.400" mt={2}>
                    Submitted on {fmtDateTime(reviewingRequest.submitted_at)}
                  </Text>
                </Box>
              </Box>

            {/* If Request is already reviewed, show audit trail */}
            {reviewingRequest.status !== "pending" && (
              <Box bg="gray.50" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" mb={4}>
                <Text fontSize="11px" fontWeight="700" color="gray.600" textTransform="uppercase" mb={2}>
                  Administrative Decision Audit Record
                </Text>
                <Stack gap={1} fontSize="11px" color="gray.700">
                  <Flex justify="space-between">
                    <span style={{ color: "#64748b" }}>Decision:</span>
                    <strong>{reviewingRequest.status.toUpperCase()}</strong>
                  </Flex>
                  <Flex justify="space-between">
                    <span style={{ color: "#64748b" }}>Reviewed By:</span>
                    <strong>{reviewingRequest.reviewed_by || "Administrator"}</strong>
                  </Flex>
                  <Flex justify="space-between">
                    <span style={{ color: "#64748b" }}>Review Timestamp:</span>
                    <span>{reviewingRequest.reviewed_at ? fmtDateTime(reviewingRequest.reviewed_at) : "N/A"}</span>
                  </Flex>
                  {reviewingRequest.admin_note && (
                    <Box mt={1} pt={1} borderTop="1px dashed #cbd5e1">
                      <span style={{ color: "#64748b" }}>Decision Note:</span>
                      <Text fontStyle="italic" color="gray.800" mt={0.5}>"{reviewingRequest.admin_note}"</Text>
                    </Box>
                  )}
                  {reviewingRequest.new_class && (
                    <Flex justify="space-between" mt={1}>
                      <span style={{ color: "#64748b" }}>Resulting Class in DB:</span>
                      <strong style={{ color: "#16a34a" }}>{reviewingRequest.new_class}</strong>
                    </Flex>
                  )}
                </Stack>
              </Box>
            )}

            {/* If Pending, provide Admin Remark input and Clear Actions */}
            {reviewingRequest.status === "pending" && (
              <Stack gap={4}>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.700" mb={1}>
                    Administrator Decision Remark {confirmAction === "reject" ? "*" : "(Optional)"}
                  </Text>
                  <Textarea
                    placeholder={
                      confirmAction === "reject"
                        ? "State reason for rejection (required, student will see this remark)..."
                        : "Add an optional remark or confirmation note..."
                    }
                    value={adminReason}
                    onChange={(e) => setAdminReason(e.target.value)}
                    fontSize="12px"
                    rows={2}
                    borderRadius="md"
                    borderColor="gray.300"
                  />
                  <Text fontSize="10px" color="gray.400" mt={1}>
                    This note will be recorded in the audit trail and included in the student's notification email.
                  </Text>
                </Box>

                {/* Confirmation Prompt */}
                {confirmAction && (
                  <Box
                    p={3.5}
                    borderRadius="lg"
                    bg={confirmAction === "approve" ? "green.50" : "red.50"}
                    border="1px solid"
                    borderColor={confirmAction === "approve" ? "green.200" : "red.200"}
                  >
                    <Text fontSize="12px" fontWeight="700" color={confirmAction === "approve" ? "green.900" : "red.900"}>
                      {confirmAction === "approve"
                        ? `Confirm Class Transfer to ${reviewingRequest.requested_class_name}?`
                        : "Confirm Rejection of Class Transfer?"}
                    </Text>
                    <Text fontSize="11px" color={confirmAction === "approve" ? "green.700" : "red.700"} mt={1} lineHeight="1.4">
                      {confirmAction === "approve"
                        ? `The student's class will immediately update to ${reviewingRequest.requested_class_name} in the database. An approval email will be sent automatically.`
                        : "The student will remain in their current class. A notification email explaining the decision will be sent."}
                    </Text>

                    <HStack gap={3} mt={3}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setConfirmAction(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        colorPalette={confirmAction === "approve" ? "green" : "red"}
                        loading={isProcessing}
                        onClick={() => handleReviewAction(confirmAction)}
                        fontWeight="700"
                        px={4}
                      >
                        {confirmAction === "approve" ? "Yes, Approve & Update Class" : "Yes, Reject Request"}
                      </Button>
                    </HStack>
                  </Box>
                )}

                {/* Primary Action Buttons */}
                {!confirmAction && (
                  <Flex justify="flex-end" gap={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="red"
                      borderRadius="lg"
                      onClick={() => setConfirmAction("reject")}
                      fontSize="12px"
                      fontWeight="600"
                    >
                      <Icon as={FiXCircle} mr={1.5} />
                      Reject Request
                    </Button>
                    <Button
                      size="sm"
                      colorPalette="green"
                      borderRadius="lg"
                      onClick={() => setConfirmAction("approve")}
                      fontSize="12px"
                      fontWeight="700"
                      px={5}
                    >
                      <Icon as={FiCheckCircle} mr={1.5} />
                      Approve & Change Class
                    </Button>
                  </Flex>
                )}
              </Stack>
            )}

            {/* Close button for resolved requests */}
            {reviewingRequest.status !== "pending" && (
              <Flex justify="flex-end" pt={2} borderTop="1px solid" borderColor="gray.100">
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => {
                    setReviewingRequest(null);
                    if (onClearSelectedRequest) onClearSelectedRequest();
                  }}
                  fontSize="12px"
                >
                  Close Record
                </Button>
              </Flex>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default StudentManagementTab;
