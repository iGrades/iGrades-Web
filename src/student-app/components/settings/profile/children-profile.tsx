import {
  Input,
  Alert,
  Box,
  Image,
  VStack,
  Field,
  Grid,
  GridItem,
  Text,
  Badge,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { IoIosAlert } from "react-icons/io";
import { FiClock } from "react-icons/fi";
import { classChangeService, type ClassChangeRequest } from "@/services/classChangeService";

const pageData = [
  { label: "First Name", key: "firstname" },
  { label: "Last Name", key: "lastname" },
  { label: "School", key: "school" },
  { label: "Class", key: "class" },
  { label: "Email", key: "email" },
  { label: "Phone Number", key: "phone_number" },
];

const ChildrenProfile = () => {
  const { authdStudent } = useAuthdStudentData();
  const [requests, setRequests] = useState<ClassChangeRequest[]>([]);

  useEffect(() => {
    if (!authdStudent?.id) return;
    classChangeService.getStudentRequests(authdStudent.id).then((res) => {
      setRequests(res);
    }).catch(() => {});
  }, [authdStudent?.id]);

  const pendingRequest = requests.find((r) => r.status === "pending");

  return (
    <>
      <VStack
        gap={4}
        mb={20}
        shadow={{ base: "none", md: "sm" }}
        p={{ base: 1, md: 10, lg: 20 }}
        rounded="md"
        w="full"
        bg="white"
      >
        {/* Image Preview */}
        <Box
          position="relative"
          w={{ base: "100%", md: "3/4" }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={{ base: 1, md: 6 }}
        >
          <Image
            src={authdStudent?.profile_image}
            alt="Profile"
            boxSize="100px"
            borderRadius="xl"
            objectFit="cover"
          />
          <Alert.Root status="info" variant="subtle" color="#474256" mt={5}>
            <Alert.Indicator color="blue.500">
              <IoIosAlert />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title fontSize="11px" fontWeight={700}>
                Parent-Managed Student Account
              </Alert.Title>
              <Alert.Description fontSize="11px" fontWeight={400}>
                This student profile is managed by your parent or guardian account. Profile details and official academic class change requests are submitted through your parent's dashboard and require administrator approval.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>

          {/* Pending Class Change Notice */}
          {pendingRequest && (
            <Box
              w="100%"
              mt={4}
              bg="amber.50"
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor="amber.300"
            >
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={2} mb={1.5}>
                <Flex align="center" gap={1.5}>
                  <Icon as={FiClock} color="amber.700" boxSize={4} />
                  <Text fontSize="xs" fontWeight="700" color="amber.900">
                    Class Change Request — Pending Admin Review
                  </Text>
                </Flex>
                <Badge colorPalette="amber" size="sm">
                  Under Review
                </Badge>
              </Flex>
              <Text fontSize="12px" color="amber.800" lineHeight="1.4">
                Your parent requested a class change from <strong>{pendingRequest.old_class}</strong> to <strong>{pendingRequest.requested_class_name}</strong>.
              </Text>
              <Text fontSize="11px" color="amber.700" fontStyle="italic" mt={1}>
                Reason: "{pendingRequest.reason}"
              </Text>
              <Text fontSize="10px" color="amber.600" mt={2}>
                * Your current class remains <strong>{pendingRequest.old_class}</strong> until administrator review is complete.
              </Text>
            </Box>
          )}
        </Box>
        
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap="1"
          w="95%"
        >
          {/* Input Fields */}
          {pageData.map((data, index) => (
            <GridItem key={index} w="100%">
              <Box key={index} w={{ base: "100%", md: "70%" }} m="auto">
                <Field.Root>
                  <Field.Label fontSize="xs" textTransform="capitalize" my={2}>
                    {data.label}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={data.key}
                  placeholder={
                    authdStudent ? (authdStudent as any)[data.key] ?? "" : ""
                  }
                  fontSize="xs"
                  p={6}
                  bg="textFieldColor"
                  outline="none"
                  border="none"
                  disabled
                  _placeholder={{ color: "greyOthers" }}
                />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </>
  );
};

export default ChildrenProfile;
