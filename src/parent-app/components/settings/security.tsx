import { Box, Heading, Field, Flex, Button } from "@chakra-ui/react"
import { GiPadlock } from "react-icons/gi";
import { PasswordInput } from "../../../components/ui/password-input"


const Security = () => {
  return (
    <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
      <Heading
        as="h3"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={3}
        mt={3}
        mb={16}
        mx={2}
      >
        {/* <LuArrowLeft /> */}
        Password
      </Heading>

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-around"
        align="center"
        gap={6}
        w={{ base: "100%", md: "80%", lg: "65%" }}
        m="auto"
      >
        <Field.Root>
          <Field.Label>Old Password</Field.Label>
          <PasswordInput bg="textFieldColor" outline="none" border="none" />
        </Field.Root>

        <Field.Root>
          <Field.Label>New Password</Field.Label>
          <PasswordInput bg="textFieldColor" outline="none" border="none" />
        </Field.Root>
      </Flex>

      <Flex justify="center" align="center" my={10}>
        <Button variant="ghost" color="primaryColor" fontWeight={700} p={3}>
          {" "}
          <GiPadlock />
          Change Password
        </Button>
      </Flex>
    </Box>
  );
}

export default Security