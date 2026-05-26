import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "./hooks/useAdminAuth";
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Stack,
} from "@chakra-ui/react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdmin, isLoading, error } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success } = await loginAdmin(email, password);
    if (success) navigate("/admin/dashboard");
  };

  return (
    <Flex
      minH="100vh"
      bg="backgrondColor2"
      align="center"
      justify="center"
      px={4}
    >
      <Box
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        rounded="xl"
        p={10}
        w="full"
        maxW="420px"
        shadow="2xl"
      >
        <Box
          display="inline-block"
          border="1px solid"
          borderColor="primaryColor"
          color="primaryColor"
          fontSize="10px"
          fontFamily="mono"
          letterSpacing="widest"
          px={3}
          py={1}
          rounded="full"
          mb={5}
        >
          ADMIN ACCESS
        </Box>

        <Heading fontSize="2xl" fontWeight="semibold" color="white" mb={1}>
          Control Panel
        </Heading>
        <Text fontSize="xs" color="fieldTextColor" mb={8}>
          Restricted to authorised personnel only.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            <Box>
              <Text
                fontSize="xs"
                fontFamily="mono"
                letterSpacing="wider"
                color="fieldTextColor"
                mb={2}
                textTransform="uppercase"
              >
                Email Address
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                color="white"
                rounded="lg"
                _placeholder={{ color: "fieldTextColor" }}
                _focus={{ borderColor: "primaryColor", boxShadow: "none" }}
                size="lg"
              />
            </Box>

            <Box>
              <Text
                fontSize="xs"
                fontFamily="mono"
                letterSpacing="wider"
                color="fieldTextColor"
                mb={2}
                textTransform="uppercase"
              >
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                color="white"
                rounded="lg"
                _placeholder={{ color: "fieldTextColor" }}
                _focus={{ borderColor: "primaryColor", boxShadow: "none" }}
                size="lg"
              />
            </Box>

            {error && (
              <Text fontSize="sm" color="errorColor">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              bg="primaryColor"
              color="on_primaryColor"
              size="lg"
              rounded="xl"
              loading={isLoading}
              loadingText="Verifying..."
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
              transition="all 0.2s"
              mt={2}
            >
              Access Dashboard
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
};

export default AdminLogin;