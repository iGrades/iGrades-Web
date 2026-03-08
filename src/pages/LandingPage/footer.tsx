import { Box, Flex, Image, Link, Text, HStack, Container } from "@chakra-ui/react";
import { FaGoogle, FaLinkedinIn, FaInstagram, FaFacebookF } from "react-icons/fa";
import logo from "@/assets/landing-page/logo.png";

const Footer = () => {
  const navItems = [
    { name: "HOME", link: "#" },
    { name: "ABOUT US", link: "#" },
    { name: "DOWNLOAD", link: "#" },
    { name: "CONTACT US", link: "#" },
    { name: "LOG IN", link: "#" },
    { name: "SIGN UP", link: "#" },
  ];

  return (
    <Box bg="#0F172A" color="white" pt={20} mt={20}>
      <Container maxW="container.xl">
        <Flex 
          direction="column" 
          align="center" 
          textAlign="center"
        >
          {/* Elegant Logo Treatment */}
          <Box mb={12} filter="brightness(0) invert(1)">
            <Image src={logo} alt="iGrades_logo" width="140px" />
          </Box>

          {/* Navigation with High-End Typography */}
          <HStack 
            gap={{ base: 4, md: 10 }} 
            flexWrap="wrap" 
            justify="center"
            mb={12}
          >
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="2px"
                color="gray.400"
                _hover={{ color: "white", textDecoration: "none" }}
                transition="all 0.3s ease"
              >
                {item.name}
              </Link>
            ))}
          </HStack>

          {/* Minimalist Socials */}
          <HStack gap={8} mb={16}>
            {[FaGoogle, FaLinkedinIn, FaInstagram, FaFacebookF].map((Icon, idx) => (
              <Link 
                key={idx} 
                href="#" 
                color="gray.500" 
                _hover={{ color: "white" }}
                fontSize="xl"
              >
                <Icon />
              </Link>
            ))}
          </HStack>
        </Flex>

        {/* Legal Row */}
        <Flex
          py={10}
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          fontSize="11px"
          fontWeight="medium"
          letterSpacing="1px"
          color="whiteAlpha.500"
          gap={4}
        >
          <Text>© 2026 INDOMITABLES. ALL RIGHTS RESERVED.</Text>
          <HStack gap={6}>
            <Link _hover={{ color: "white" }}>PRIVACY POLICY</Link>
            <Link _hover={{ color: "white" }}>TERMS & CONDITIONS</Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;