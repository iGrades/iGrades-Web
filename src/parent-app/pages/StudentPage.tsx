import { useState, useMemo } from "react";
import SearchBar from "../components/searchBar";
import { Flex, Box, Text, Heading, HStack, Badge, Button, Icon } from "@chakra-ui/react";
import AddGraderPopup from "../components/grader/addGraderPopover";
import { useStudentsData } from "../context/studentsDataContext";
import { useParentSubscriptionEntitlement } from "../hooks/useParentSubscriptionEntitlement";
import GraderTable from "../components/grader/graderTable";
import { PiStudentBold, PiUserPlusBold, PiShootingStarDuotone } from "react-icons/pi";

const StudentPage = () => {
  const [showBox, setShowBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { studentsData } = useStudentsData();
  const {
    maxAllowedChildren,
    currentChildrenCount,
    canAddMoreChildren,
    promptUpgrade,
    effectivePlan,
  } = useParentSubscriptionEntitlement();

  // Filter children based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentsData || [];
    const q = searchQuery.toLowerCase();
    return (studentsData || []).filter((s) => {
      const fullName = `${s.firstname || ""} ${s.lastname || ""}`.toLowerCase();
      const school = (s.school || "").toLowerCase();
      const sClass = (s.class || "").toLowerCase();
      return fullName.includes(q) || school.includes(q) || sClass.includes(q);
    });
  }, [studentsData, searchQuery]);

  const handleAddChildClick = () => {
    if (!canAddMoreChildren) {
      promptUpgrade(
        "Add More Children",
        effectivePlan === "basic" ? "standard" : "premium",
        `You have reached the maximum of ${maxAllowedChildren} ${maxAllowedChildren === 1 ? "child" : "children"} on your ${effectivePlan.toUpperCase()} plan. Upgrade to expand your parent portal family capacity.`
      );
      return;
    }
    setShowBox(true);
  };

  return (
    <Flex 
      direction="column" 
      w={{ base: "100%", md: "96%" }} 
      px={{ base: 4, md: 0 }} 
      m="auto"
      pb={{ base: "100px", lg: "40px" }} 
    >
      {/* ── ACADEMIC HERO & STATUS BANNER ── */}
      <Box
        mt={4}
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        position="relative"
        overflow="hidden"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          position="relative"
          zIndex={1}
        >
          <Box>
            <HStack gap={2.5} mb={1.5} flexWrap="wrap">
              <Box
                p={2}
                bg="blue.50"
                borderRadius="xl"
                color="primaryColor"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <PiStudentBold size={24} />
              </Box>
              <Heading size={{ base: "md", md: "lg" }} fontWeight="800" color="gray.900">
                Student Directory & Enrolled Children
              </Heading>
              <Badge
                bg="blue.50"
                color="primaryColor"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="11px"
                fontWeight="bold"
              >
                {currentChildrenCount} / {maxAllowedChildren} Connected
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" maxW="640px" lineHeight="1.6">
              Oversee and manage your connected students, monitor curriculum enrollment levels, academic classes, and adjust learning profile details.
            </Text>
          </Box>

          {/* Quick Add Child Action Button */}
          <Button
            bg="#206CE1"
            color="white"
            _hover={{ bg: "#1852B2" }}
            borderRadius="xl"
            fontWeight="bold"
            fontSize="xs"
            px={5}
            py={5}
            shadow="sm"
            onClick={handleAddChildClick}
          >
            <Icon as={canAddMoreChildren ? PiUserPlusBold : PiShootingStarDuotone} mr={1.5} fontSize="1.1rem" />
            {canAddMoreChildren ? "Add New Child" : "Expand Child Slots"}
          </Button>
        </Flex>

        {/* Capacity Info Pill */}
        {!canAddMoreChildren && (
          <HStack
            mt={4}
            p={3}
            bg="blue.50/50"
            border="1px solid"
            borderColor="blue.100"
            borderRadius="xl"
            fontSize="xs"
            color="gray.800"
            justify="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <HStack gap={2}>
              <Icon as={PiShootingStarDuotone} color="#206CE1" fontSize="1.15rem" />
              <Text fontSize="xs" color="gray.700">
                You have reached your <strong>{effectivePlan.toUpperCase()}</strong> plan limit ({maxAllowedChildren} {maxAllowedChildren === 1 ? "child" : "children"}).
              </Text>
            </HStack>
            <Text
              as="button"
              onClick={handleAddChildClick}
              color="#206CE1"
              textDecoration="underline"
              fontWeight="bold"
              fontSize="xs"
              cursor="pointer"
              _hover={{ color: "#1852B2" }}
            >
              Upgrade to connect more →
            </Text>
          </HStack>
        )}
      </Box>

      {/* ── TOOLBAR: SEARCH & ACTIONS ── */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={3}
        w="full"
        mt={6}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
      >
        <Box flex={1} maxW={{ sm: "380px" }}>
          <SearchBar
            placeholder="Search child by name, school, or class..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </Box>

        <HStack gap={2} justify={{ base: "space-between", sm: "flex-end" }}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Showing {filteredStudents.length} of {studentsData?.length || 0} students
          </Text>
        </HStack>
      </Flex>

      {/* ── POLISHED TABLE VIEW ── */}
      <Box mt={4}>
        <GraderTable studentsData={filteredStudents} onOpenAdd={() => handleAddChildClick()} />
        {showBox && (
          <AddGraderPopup
            showBox={showBox}
            setShowBox={setShowBox}
            onClose={() => setShowBox(false)}
          />
        )}
      </Box>
    </Flex>
  );
};

export default StudentPage;