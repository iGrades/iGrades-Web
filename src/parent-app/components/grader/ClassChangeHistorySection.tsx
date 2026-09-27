import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import {
  FiArrowRight,
  FiList,
  FiInfo,
} from "react-icons/fi";
import type { ClassChangeRequest } from "@/services/classChangeService";

export interface ClassChangeHistorySectionProps {
  requests: ClassChangeRequest[];
  childName?: string;
  currentRequestId?: string;
  loading?: boolean;
}

export const ClassChangeHistorySection = ({
  requests,
  childName = "Child",
  currentRequestId,
  loading = false,
}: ClassChangeHistorySectionProps) => {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedHistory = [...requests].sort((a, b) => {
    const timeA = new Date(a.submitted_at).getTime();
    const timeB = new Date(b.submitted_at).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  return (
    <Box w="full" mt={2}>
      <Flex
        justify="space-between"
        align="center"
        mb={2.5}
        pb={2}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <HStack gap={2}>
          <Box p={1} bg="purple.50" color="purple.600" borderRadius="md">
            <Icon as={FiList} boxSize={3.5} />
          </Box>
          <Heading
            fontSize="xs"
            fontWeight="800"
            color="gray.800"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Class Change History
          </Heading>
          <Badge colorPalette="gray" size="xs" borderRadius="full">
            {sortedHistory.length} {sortedHistory.length === 1 ? "record" : "records"}
          </Badge>
        </HStack>

        <Button
          size="2xs"
          variant="ghost"
          color="gray.500"
          fontSize="10px"
          fontWeight="600"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
        >
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </Button>
      </Flex>

      <Text fontSize="11px" color="gray.500" mb={3}>
        Chronological record of official academic class change requests for {childName} (read-only):
      </Text>

      {loading ? (
        <Box py={5} textAlign="center">
          <Text fontSize="xs" color="gray.400">Loading history records...</Text>
        </Box>
      ) : sortedHistory.length === 0 ? (
        <Box
          py={6}
          textAlign="center"
          bg="gray.50"
          borderRadius="xl"
          border="1px dashed"
          borderColor="gray.200"
        >
          <Icon as={FiInfo} color="gray.400" boxSize={5} mb={1} />
          <Text fontSize="xs" color="gray.500">
            No prior class change requests recorded for this child.
          </Text>
        </Box>
      ) : (
        <VStack gap={2.5} align="stretch">
          {sortedHistory.map((item, idx) => {
            const itemApproved = item.status === "approved";
            const itemRejected = item.status === "rejected";
            const isCurrentItem = currentRequestId === item.id;

            const itemDate = item.reviewed_at
              ? new Date(item.reviewed_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : new Date(item.submitted_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

            return (
              <Box
                key={item.id || idx}
                p={{ base: 3, sm: 3.5 }}
                borderRadius="xl"
                bg={
                  isCurrentItem
                    ? itemApproved
                      ? "green.50/40"
                      : itemRejected
                      ? "red.50/40"
                      : "blue.50/40"
                    : "gray.50/80"
                }
                border="1px solid"
                borderColor={
                  isCurrentItem
                    ? itemApproved
                      ? "green.300"
                      : itemRejected
                      ? "red.300"
                      : "blue.300"
                    : "gray.200"
                }
                transition="all 0.15s ease"
              >
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  flexDirection={{ base: "column", sm: "row" }}
                  gap={1.5}
                  mb={1.5}
                >
                  <HStack gap={2} flexWrap="wrap">
                    <Badge
                      colorPalette={
                        itemApproved
                          ? "green"
                          : itemRejected
                          ? "red"
                          : "amber"
                      }
                      variant="solid"
                      size="sm"
                      borderRadius="md"
                      fontSize="10px"
                      fontWeight="700"
                    >
                      {item.status.toUpperCase()}
                    </Badge>

                    <HStack gap={1} fontSize="xs" fontWeight="700" color="gray.800">
                      <Text color="gray.600">{item.old_class || item.current_class_name}</Text>
                      <Icon as={FiArrowRight} color="gray.400" boxSize={3} />
                      <Text color={itemApproved ? "green.700" : "blue.700"}>
                        {item.new_class || item.requested_class_name}
                      </Text>
                    </HStack>

                    {isCurrentItem && (
                      <Badge
                        colorPalette="purple"
                        size="sm"
                        variant="subtle"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="0.03em"
                        textTransform="uppercase"
                        bg="purple.100"
                        color="purple.800"
                        border="1px solid"
                        borderColor="purple.300"
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        boxShadow="0 1px 2px rgba(147, 51, 234, 0.08)"
                      >
                        <Box as="span" w="5px" h="5px" borderRadius="full" bg="purple.600" />
                        Current Decision
                      </Badge>
                    )}
                  </HStack>

                  <Text fontSize="11px" color="gray.500" fontWeight="500">
                    {itemDate}
                  </Text>
                </Flex>

                {/* Request Reason */}
                <Text fontSize="11px" color="gray.600" mb={1} lineHeight="1.4">
                  <strong style={{ color: "#4A5568" }}>Reason:</strong> "{item.reason}"
                </Text>

                {/* Rejection Reason when applicable */}
                {itemRejected && item.admin_note && (
                  <Box
                    mt={2}
                    p={2.5}
                    borderRadius="lg"
                    bg="red.50"
                  >
                    <Text fontSize="11px" color="red.800" lineHeight="1.5">
                      <strong style={{ fontWeight: 700, color: "#991b1b" }}>Rejection Reason:</strong>{" "}
                      {item.admin_note}
                    </Text>
                  </Box>
                )}

                {/* Approval Note when applicable */}
                {itemApproved && item.admin_note && (
                  <Box
                    mt={2}
                    p={2.5}
                    borderRadius="lg"
                    bg="green.50"
                  >
                    <Text fontSize="11px" color="green.800" lineHeight="1.5">
                      <strong style={{ fontWeight: 700, color: "#166534" }}>Remark:</strong>{" "}
                      {item.admin_note}
                    </Text>
                  </Box>
                )}

                {/* Reviewer signature */}
                {item.reviewed_by && (
                  <Text fontSize="10px" color="gray.400" mt={1}>
                    Reviewed by {item.reviewed_by}
                  </Text>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
