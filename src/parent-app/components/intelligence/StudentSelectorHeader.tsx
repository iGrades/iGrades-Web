import { Box, Flex, HStack, Text, Badge, Icon, Menu, Portal } from "@chakra-ui/react";
import AvatarComp from "@/components/avatar";
import { FiChevronDown, FiCheck, FiPlus, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useUser } from "@/parent-app/context/parentDataContext";
import { normalizePlan } from "@/services/subscriptionEntitlements";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  students: any[];
  selectedStudent: any;
  onSelectStudent: (student: any) => void;
  intelligence?: StudentIntelligence | null;
  onAddChildClick: () => void;
};

export const StudentSelectorHeader = ({
  students,
  selectedStudent,
  onSelectStudent,
  onAddChildClick,
}: Props) => {
  const { t } = useTranslation();
  const { parent } = useUser();

  const currentParent = parent?.[0] || null;
  const parentName = currentParent?.firstname || "Parent";

  const { effectivePlan: selectedPlan } = normalizePlan(
    selectedStudent?.subscription,
    selectedStudent?.subscription_status
  );

  const planBadgeColor =
    selectedPlan === "premium"
      ? "purple"
      : selectedPlan === "standard"
      ? "blue"
      : "gray";

  const planName =
    selectedPlan === "premium"
      ? "Premium"
      : selectedPlan === "standard"
      ? "Standard"
      : "Basic";

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="0 2px 14px rgba(32, 108, 225, 0.05)"
      border="1px solid"
      borderColor="gray.100"
      mb={5}
      overflow="hidden"
      position="relative"
    >
      {/* Top Subtle Accent Strip */}
      <Box h="3px" w="full" bgGradient="linear(to-r, #1E56B3, #206CE1, #38BDF8)" />

      <Box p={{ base: 3.5, sm: 4, md: 5 }}>
        {/* Header row: Eyebrow */}
        <Box mb={2.5}>
          <HStack gap={2}>
            <Text
              fontSize="xs"
              fontWeight="800"
              color="#1E56B3"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {t("Student Profile")}
            </Text>
            <Text fontSize="11px" color="gray.500" display={{ base: "none", sm: "inline" }}>
              • {t("Children under")} {parentName} ({students.length})
            </Text>
          </HStack>
        </Box>

        {/* ─── Premium Sophisticated Student Select Dropdown (Sole Element) ─── */}
        <Menu.Root positioning={{ placement: "bottom-start", sameWidth: true }}>
          <Menu.Trigger asChild>
            <Box
              as="button"
              type="button"
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bg="#F8FAFC"
              border="1.5px solid"
              borderColor="blue.100"
              _hover={{ borderColor: "blue.300", bg: "blue.50/25", shadow: "xs" }}
              _focus={{ ring: "2px solid", ringColor: "blue.400" }}
              borderRadius="xl"
              p={{ base: "8px 12px", sm: "10px 14px" }}
              cursor="pointer"
              transition="all 0.15s ease"
              aria-label="Select student under parent"
            >
              <HStack gap={{ base: 2.5, sm: 3 }} overflow="hidden" flex="1">
                {/* Photo by the left */}
                <Box flexShrink={0}>
                  <AvatarComp
                    username={`${selectedStudent?.firstname || ""} ${selectedStudent?.lastname || ""}`}
                    profileImage={selectedStudent?.profile_image}
                  />
                </Box>

                <Box textAlign="left" overflow="hidden" flex="1">
                  <HStack gap={2} align="center" wrap="nowrap">
                    <Text fontSize={{ base: "13px", sm: "14px" }} fontWeight="700" color="gray.800" truncate>
                      {selectedStudent
                        ? `${selectedStudent.firstname} ${selectedStudent.lastname || ""}`
                        : "Select Student"}
                    </Text>
                    {selectedStudent?.class && (
                      <Badge
                        colorPalette="blue"
                        variant="subtle"
                        size="xs"
                        borderRadius="md"
                        px={1.5}
                        fontSize="10px"
                        flexShrink={0}
                      >
                        {selectedStudent.class}
                      </Badge>
                    )}
                    <Badge
                      colorPalette={planBadgeColor}
                      variant="subtle"
                      size="xs"
                      borderRadius="md"
                      px={1.5}
                      fontSize="10px"
                      fontWeight="700"
                      flexShrink={0}
                    >
                      {planName} Plan
                    </Badge>
                  </HStack>
                  <Text fontSize="11px" color="gray.500" truncate mt={0.5}>
                    {students.length > 1
                      ? t("Tap to switch child profile")
                      : t("Registered child profile")}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={2} flexShrink={0} ml={2}>
                <Badge
                  colorPalette="gray"
                  variant="surface"
                  size="xs"
                  borderRadius="full"
                  px={2}
                  fontSize="10px"
                  display={{ base: "none", sm: "inline-flex" }}
                >
                  {students.length} {students.length === 1 ? "child" : "children"}
                </Badge>
                <Box color="gray.400" transition="transform 0.15s ease">
                  <FiChevronDown size={18} />
                </Box>
              </HStack>
            </Box>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner zIndex={1500}>
              <Menu.Content
                bg="white"
                shadow="2xl"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                minW={{ base: "290px", sm: "360px", md: "440px" }}
                maxH="340px"
                overflowY="auto"
                p={2}
              >
                {/* Menu Header */}
                <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100" mb={1}>
                  <Flex justify="space-between" align="center">
                    <HStack gap={1.5}>
                      <Icon as={FiUsers} color="#206CE1" boxSize={3.5} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.800">
                        {t("Children under")} {parentName}
                      </Text>
                    </HStack>
                    <Badge colorPalette="blue" variant="solid" size="xs" borderRadius="full" px={2} fontSize="9px">
                      {students.length} {students.length === 1 ? "Child" : "Children"}
                    </Badge>
                  </Flex>
                </Box>

                {/* Students List */}
                {students.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  const { effectivePlan: stPlan } = normalizePlan(
                    st.subscription,
                    st.subscription_status
                  );
                  const stPlanColor =
                    stPlan === "premium" ? "purple" : stPlan === "standard" ? "blue" : "gray";

                  return (
                    <Menu.Item
                      key={st.id}
                      value={st.id}
                      onClick={() => onSelectStudent(st)}
                      borderRadius="xl"
                      py={2.5}
                      px={3}
                      cursor="pointer"
                      bg={isSelected ? "blue.50/60" : "transparent"}
                      _hover={{ bg: isSelected ? "blue.50" : "gray.50" }}
                      transition="background 0.15s ease"
                    >
                      <HStack justify="space-between" w="full" gap={2}>
                        {/* Photo on left of name */}
                        <HStack gap={2.5} overflow="hidden">
                          <Box flexShrink={0}>
                            <AvatarComp
                              username={`${st.firstname || ""} ${st.lastname || ""}`}
                              profileImage={st.profile_image}
                            />
                          </Box>
                          <Box textAlign="left" overflow="hidden">
                            <Text fontSize="13px" fontWeight="700" color="gray.800" truncate>
                              {st.firstname} {st.lastname}
                            </Text>
                            <Text fontSize="11px" color="gray.500" truncate>
                              {st.class || "General"} {st.school ? `• ${st.school}` : ""}
                            </Text>
                          </Box>
                        </HStack>

                        {/* Plan & Selection indicator on right */}
                        <HStack gap={2} flexShrink={0}>
                          <Badge
                            colorPalette={stPlanColor}
                            variant="subtle"
                            size="xs"
                            borderRadius="md"
                            px={1.5}
                            fontSize="10px"
                            fontWeight="700"
                          >
                            {stPlan.toUpperCase()}
                          </Badge>
                          {isSelected && (
                            <Box color="#206CE1">
                              <FiCheck size={16} />
                            </Box>
                          )}
                        </HStack>
                      </HStack>
                    </Menu.Item>
                  );
                })}

                <Box my={1} borderBottom="1px solid" borderColor="gray.100" />

                {/* Add Child item at bottom of dropdown */}
                <Menu.Item
                  value="add-child"
                  onClick={onAddChildClick}
                  borderRadius="xl"
                  py={2}
                  px={3}
                  cursor="pointer"
                  color="blue.600"
                  _hover={{ bg: "blue.50" }}
                >
                  <HStack gap={2}>
                    <FiPlus size={16} />
                    <Text fontSize="xs" fontWeight="700">
                      {t("Connect Another Child")}
                    </Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Box>
    </Box>
  );
};

export default StudentSelectorHeader;
