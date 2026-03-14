import { Box, Heading, Text, Button, Icon, Alert, VStack } from "@chakra-ui/react"
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

type Props = {
  setShowLogoutModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const LogoutPopover = ({ setShowLogoutModal }: Props) => {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
    }
    navigate("/login");
    setAlert({ type: "success", message: "Logged out successfully!" });
  };

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        w="100vw"
        h="100vh"
        bg="rgba(0, 0, 0, 0.7)"   
        zIndex={7000} 
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={{ base: 4, md: 6 }}
      >
        <Box
          position="relative"
          width={{ base: "100%", sm: "85%", md: "60%", lg: "35%" }}
          maxH="90vh"
          bg="white"
          borderRadius="3xl"
          boxShadow="2xl"
          p={{ base: 6, md: 10 }}
          textAlign="center"
        >
          {/* Content Section */}
          <VStack gap={4} align="center">
            <Icon
              bg="blue.50"
              boxSize={{ base: "60px", md: "70px" }}
              color="primaryColor"
              rounded="full"
              p={4}
            >
              <LuLogOut size="100%" />
            </Icon>
            
            <Heading 
              as="h1" 
              fontSize={{ base: "xl", md: "2xl" }} 
              color="backgroundColor2"
              lineHeight="1.2"
            >
              Logout Request
            </Heading>
            
            <Text
              fontSize={{ base: "sm", md: "xs" }}
              color="gray.600"
              maxW="90%"
              lineHeight="tall"
            >
              You are about to logout. All active sessions and unsaved data for this session will be cleared.
            </Text>
          </VStack>

          {/* Buttons Section */}
          <VStack gap={3} mt={8} w="full">
            <Button
              bg="primaryColor"
              color="white"
              borderRadius="3xl"
              h="55px" 
              w="full"
              fontSize="sm"
              fontWeight="bold"
              _active={{ transform: "scale(0.97)" }}
              onClick={handleLogout}
            >
              Yes, logout
            </Button>

            <Button
              variant="outline"
              color="blue.600"
              borderColor="blue.200"
              borderRadius="3xl"
              h="55px"
              w="full"
              fontSize="sm"
              fontWeight="medium"
              _active={{ transform: "scale(0.97)" }}
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
          </VStack>

          {alert && (
            <Alert.Root status={alert.type} variant="subtle" mt={6} borderRadius="lg">
              <Alert.Indicator />
              <Alert.Content fontSize="xs">
                <Alert.Title>
                  {alert.type === "error" ? "Error" : "Success"}
                </Alert.Title>
                <Alert.Description>{alert.message}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </Box>
      </Box>
    </>
  );
};

export default LogoutPopover;