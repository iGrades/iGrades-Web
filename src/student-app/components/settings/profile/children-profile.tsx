import {
  Input,
  Alert,
  Box,
  Image,
  VStack,
  Field,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { IoIosAlert } from "react-icons/io";

const pageData = [
  "First Name",
  "Last Name",
  "School",
  "Class",
  "Email",
  "Phone Number",
];

const ChildrenProfile = () => {
  const { authdStudent } = useAuthdStudentData();

  return (
    <>
      <VStack
        gap={4}
        mb={20}
        shadow={{ base: "none", md: "md" }}
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
          p={{base:1, md: 6}}
        >
          <Image
            src={authdStudent?.profile_image}
            alt="Profile"
            boxSize="100px"
            borderRadius="xl"
            objectFit="cover"
          />
          <Alert.Root status="warning" variant="subtle" color="#474256" mt={5}>
            <Alert.Indicator color="orange.400">
            <IoIosAlert />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title fontSize="11px" fontWeight={700}>
                Kindly note
              </Alert.Title>
              <Alert.Description fontSize="11px" fontWeight={400}>
                Student profiile creation is managed and maintained by thier
                parent or guardian account. Kindly go to your parent account to
                make changes to your profile
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
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
                    {data}
                  </Field.Label>
                </Field.Root>
                <Input
                  name={data}
                  placeholder={
                    authdStudent
                      ? authdStudent[data.toLowerCase().replace(" ", "")]
                      : ""
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
