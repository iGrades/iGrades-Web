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
  Image,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/landing-page/logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      bg="#0F172A"
      align="center"
      justify="center"
      px={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background glow accents */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="blue.600/10"
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="purple.600/10"
        filter="blur(120px)"
        pointerEvents="none"
      />

      <Box
        bg="slate.900/80"
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor="whiteAlpha.15"
        borderRadius="1.5rem"
        p={{ base: 6, sm: 10 }}
        w="full"
        maxW="420px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        position="relative"
        zIndex={1}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Box filter="brightness(0) invert(1)" display="inline-block">
            <Image src={logo} alt="iGrades" h="30px" objectFit="contain" />
          </Box>
          <Badge
            bg="blue.500/20"
            color="blue.300"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.05em"
          >
            ADMIN PORTAL
          </Badge>
        </Flex>

        <Heading fontSize="1.5rem" fontWeight="800" color="white" mb={1} letterSpacing="-0.02em">
          Control Panel Login
        </Heading>
        <Text fontSize="12px" color="slate.400" mb={8}>
          Restricted access for authorised administrative personnel.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            <Box>
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.05em"
                color="slate.300"
                mb={2}
                textTransform="uppercase"
              >
                Administrator Email
              </Text>
              <Box position="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@igrades.org"
                  bg="whiteAlpha.05"
                  border="1px solid"
                  borderColor="whiteAlpha.20"
                  color="white"
                  borderRadius="0.75rem"
                  _placeholder={{ color: "slate.500" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #2563EB" }}
                  h="44px"
                  fontSize="13px"
                  px={4}
                />
              </Box>
            </Box>

            <Box>
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.05em"
                color="slate.300"
                mb={2}
                textTransform="uppercase"
              >
                Security Password
              </Text>
              <Box position="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  bg="whiteAlpha.05"
                  border="1px solid"
                  borderColor="whiteAlpha.20"
                  color="white"
                  borderRadius="0.75rem"
                  _placeholder={{ color: "slate.500" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #2563EB" }}
                  h="44px"
                  fontSize="13px"
                  px={4}
                  pr={10}
                />
                <Button
                  variant="ghost"
                  size="xs"
                  position="absolute"
                  right="8px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="slate.400"
                  _hover={{ color: "white", bg: "transparent" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon as={showPassword ? FiEyeOff : FiEye} boxSize={4} />
                </Button>
              </Box>
            </Box>

            {error && (
              <Box p={3} bg="rose.500/10" border="1px solid" borderColor="rose.500/20" borderRadius="0.75rem">
                <Text fontSize="12px" color="rose.300" fontWeight="600">
                  {error}
                </Text>
              </Box>
            )}

            <Button
              type="submit"
              bg="blue.600"
              color="white"
              h="46px"
              borderRadius="0.75rem"
              loading={isLoading}
              loadingText="Authenticating..."
              _hover={{ bg: "blue.500" }}
              transition="all 0.2s"
              fontWeight="700"
              fontSize="14px"
              mt={2}
            >
              Sign In to Control Panel
            </Button>
          </Stack>
        </form>

        <Flex align="center" justify="center" gap={2} mt={8} pt={6} borderTop="1px solid" borderColor="whiteAlpha.10">
          <Icon as={FiShield} color="slate.500" boxSize={3.5} />
          <Text fontSize="11px" color="slate.500" fontWeight="500">
            Encrypted End-to-End Session Guard
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AdminLogin;
