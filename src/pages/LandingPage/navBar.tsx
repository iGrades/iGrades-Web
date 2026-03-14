import { Box, Flex, Button, Image, Link } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import logo from "@/assets/landing-page/logo.png";

const NavBar = () => {
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Download", link: "/download" },
    { name: "Contact", link: "/contact" },
  ];

  const toggleMobileNav = () => setIsMobileNavOpen((p) => !p);

  const handleLogin = () => {
    isMobileNavOpen && setIsMobileNavOpen(false);
    navigate("/login");
  };
  const handleRegister = () => {
    isMobileNavOpen && setIsMobileNavOpen(false);
    navigate("/signup");
  };

  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      pt={{ base: 4, md: 8, lg: 10 }}
      px={{ base: 4, lg: 12 }}
      position="relative"
    >
      {/* Logo */}
      <Box display="flex" alignItems="center" bg="white"
        w={{ base: "45%", md: "15%" }} mr={{ base: 4, md: 6, lg: 0 }}>
        <Image src={logo} alt="iGrades_logo" width="150px" fit="cover" />
      </Box>

      {/* Desktop nav */}
      <Box as="nav" display={{ base: "none", md: "block" }}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            asChild
            color="on_backgroundColor"
            mx={4}
            fontSize={{ base: "sm", lg: "md" }}
            fontWeight="semibold"
            textDecoration="none"
            _hover={{ textDecoration: "none", color: "primaryColor" }}
            transition="color 0.2s"
          >
            <RouterLink to={item.link}>{item.name}</RouterLink>
          </Link>
        ))}
      </Box>

      {/* Desktop buttons */}
      <Box display={{ base: "none", md: "block" }}>
        <Button
          variant="outline"
          border="1px solid"
          borderColor="primaryColor"
          rounded={{ base: "xl", lg: "3xl" }}
          color="primaryColor"
          fontWeight="bold"
          fontSize={{ base: "xs", lg: "sm" }}
          w={{ base: 20, md: 16, lg: 28 }}
          p={{ base: 2, lg: 4 }}
          mr={4}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          bg="primaryColor"
          rounded={{ base: "xl", lg: "3xl" }}
          w={{ base: 28, md: 24, lg: 36 }}
          p={{ base: 2, lg: 4 }}
          fontWeight="bold"
          fontSize={{ base: "xs", lg: "sm" }}
          onClick={handleRegister}
        >
          Register
        </Button>
      </Box>

      {/* Mobile hamburger */}
      <Box display={{ base: "block", md: "none" }}
        onClick={toggleMobileNav} cursor="pointer" zIndex="20" p={2}>
        <Box w="25px" h="3px" bg="black" mb="5px" />
        <Box w="25px" h="3px" bg="black" mb="5px" />
        <Box w="25px" h="3px" bg="black" />
      </Box>

      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <Box position="fixed" top="0" left="0" w="100%" h="100%"
          bg="blackAlpha.600" zIndex="10" onClick={toggleMobileNav} />
      )}

      {/* Mobile nav drawer */}
      <Box
        as="nav"
        display={{ base: "flex", md: "none" }}
        flexDirection="column"
        position="fixed"
        top="0"
        left={isMobileNavOpen ? "0" : "-100%"}
        w="80%"
        maxW="300px"
        h="100vh"
        bg="white"
        p={8}
        zIndex="20"
        transition="left 0.3s ease-in-out"
        boxShadow="2xl"
      >
        <Button onClick={toggleMobileNav} alignSelf="flex-end"
          variant="ghost" mb={8} fontSize="xl">✕</Button>

        {navItems.map((item) => (
          <Link
            key={item.name}
            asChild
            color="gray.700"
            py={4}
            px={2}
            fontSize="lg"
            fontWeight="semibold"
            textDecoration="none"
            borderBottom="1px solid"
            borderColor="gray.100"
            _hover={{ bg: "gray.50", textDecoration: "none" }}
            onClick={toggleMobileNav}
          >
            <RouterLink to={item.link}>{item.name}</RouterLink>
          </Link>
        ))}

        <Flex direction="column" mt={8} gap={4}>
          <Button variant="outline" border="1px solid" borderColor="primaryColor"
            rounded="xl" color="primaryColor" fontWeight="bold" fontSize="md"
            py={6} onClick={handleLogin}>
            Login
          </Button>
          <Button bg="primaryColor" rounded="xl" py={6} fontWeight="bold"
            fontSize="md" color="white" onClick={handleRegister}>
            Register
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default NavBar;