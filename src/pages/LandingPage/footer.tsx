import { Box, Flex, Grid, Image, Link, Text, HStack, VStack, Icon } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { MdEmail, MdPhone } from "react-icons/md";
import logo from "@/assets/landing-page/logo.png";

const Footer = () => {
  const links = {
    Platform: [
      { label: "How It Works", href: "#" },
      { label: "Subjects", href: "#" },
      { label: "Past Questions", href: "#" },
      { label: "AI Tutor — Spark", href: "#" },
      { label: "Pricing", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Our Team", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Press Kit", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Support: [
      { label: "Help Centre", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  const socials = [
    { icon: <FaXTwitter />, href: "#", label: "X" },
    { icon: <FaInstagram />, href: "#", label: "Instagram" },
    { icon: <FaFacebookF />, href: "#", label: "Facebook" },
    { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn" },
  ];

  return (
    <Box
      bg="#07052A"
      color="white"
      position="relative"
      overflow="hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&display=swap');
        .footer-link { transition: all 0.2s ease; }
        .footer-link:hover { color: white !important; padding-left: 6px; }
        .social-btn { transition: all 0.2s ease; }
        .social-btn:hover { transform: translateY(-3px); }
        .footer-email::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Background texture */}
      <Box position="absolute" inset={0} opacity={0.025}
        backgroundImage="radial-gradient(circle, #fff 1px, transparent 1px)"
        backgroundSize="28px 28px" pointerEvents="none" />

      {/* Top accent line */}
      <Box h="3px" bg="linear-gradient(90deg, #206CE1 0%, #F18729 50%, transparent 100%)" />

      {/* ── Big wordmark hero strip ── */}
      <Box
        px={{ base: 6, md: 12, lg: 20 }}
        pt={16} pb={12}
        borderBottom="1px solid rgba(255,255,255,0.06)"
        position="relative"
      >
        {/* Giant background text */}
        <Box
          position="absolute"
          bottom="-10px"
          left={{ base: "50%", lg: "8%" }}
          transform={{ base: "translateX(-50%)", lg: "none" }}
          fontSize={{ base: "100px", md: "160px", lg: "200px" }}
          fontWeight="900"
          color="rgba(255,255,255,0.025)"
          lineHeight="1"
          letterSpacing="-0.04em"
          pointerEvents="none"
          userSelect="none"
          fontFamily="'Space Grotesk', sans-serif"
          whiteSpace="nowrap"
        >
          iGrades
        </Box>

        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "flex-start", lg: "flex-end" }}
          gap={10}
          position="relative"
          zIndex={1}
          maxW="1300px"
          mx="auto"
        >
          {/* Brand block */}
          <Box maxW="360px">
            <Box mb={5} filter="brightness(0) invert(1)" display="inline-block">
              <Image src={logo} alt="iGrades" width="130px" />
            </Box>
            <Text
              color="rgba(255,255,255,0.45)"
              fontSize="sm"
              lineHeight="1.85"
              mb={7}
            >
              Nigeria's most complete online learning platform.
              Built for WAEC, JAMB, NECO & A-Level students who
              refuse to be average.
            </Text>

            {/* Contact quick links */}
            <VStack align="start" gap={2.5}>
              <HStack gap={2.5}>
                <Icon boxSize={3.5} color="#F18729"><MdEmail /></Icon>
                <Text fontSize="xs" color="rgba(255,255,255,0.4)"
                  _hover={{ color: "white" }} transition="color .2s" cursor="default">
                  hello@igrades.ng
                </Text>
              </HStack>
              <HStack gap={2.5}>
                <Icon boxSize={3.5} color="#F18729"><MdPhone /></Icon>
                <Text fontSize="xs" color="rgba(255,255,255,0.4)"
                  _hover={{ color: "white" }} transition="color .2s" cursor="default">
                  +234 800 000 0000
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Link columns */}
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
            gap={{ base: 8, md: 12 }}
          >
            {Object.entries(links).map(([category, items]) => (
              <Box key={category}>
                <Text
                  fontSize="10px"
                  fontWeight="800"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  color="#F18729"
                  mb={5}
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  {category}
                </Text>
                <VStack align="start" gap={3}>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      asChild
                      className="footer-link"
                      fontSize="sm"
                      color="rgba(255,255,255,0.45)"
                      textDecoration="none"
                      _hover={{ textDecoration: "none" }}
                    >
                      <RouterLink to={item.href}>{item.label}</RouterLink>
                    </Link>
                  ))}
                </VStack>
              </Box>
            ))}
          </Grid>
        </Flex>
      </Box>

      {/* ── Newsletter strip ── */}
      <Box
        px={{ base: 6, md: 12, lg: 20 }}
        py={8}
        borderBottom="1px solid rgba(255,255,255,0.06)"
        maxW="1300px"
        mx="auto"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          gap={5}
        >
          <Box>
            <Text fontWeight="700" fontSize="sm" color="white" mb={0.5}
              fontFamily="'Space Grotesk', sans-serif">
              Stay in the loop
            </Text>
            <Text fontSize="xs" color="rgba(255,255,255,0.35)">
              Tips, updates, and exam news — straight to your inbox.
            </Text>
          </Box>
          <HStack gap={0} maxW="400px" w="full">
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRight: "none",
                borderRadius: "12px 0 0 12px",
                padding: "0 16px",
                height: "44px",
                fontSize: "14px",
                color: "white",
                outline: "none",
                width: "100%",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
              className="footer-email"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(32,108,225,0.6)";
                e.currentTarget.style.background = "rgba(32,108,225,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            />
            <Box
              as="button"
              bg="#206CE1"
              color="white"
              px={5}
              h="44px"
              borderRadius="0 xl xl 0"
              fontWeight="700"
              fontSize="xs"
              letterSpacing="0.05em"
              border="none"
              cursor="pointer"
              whiteSpace="nowrap"
              _hover={{ bg: "#1a5cc7" }}
              transition="background .15s"
            >
              Subscribe
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* ── Bottom legal bar ── */}
      <Box px={{ base: 6, md: 12, lg: 20 }} py={6} maxW="1300px" mx="auto">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="11px" color="rgba(255,255,255,0.25)"
            letterSpacing="0.08em" textTransform="uppercase">
            © 2026 Indomitables. All rights reserved.
          </Text>

          {/* Socials */}
          <HStack gap={3}>
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="social-btn"
                aria-label={s.label}
                w="34px" h="34px"
                borderRadius="lg"
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.08)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="rgba(255,255,255,0.4)"
                fontSize="sm"
                _hover={{ color: "white", bg: "rgba(255,255,255,0.1)", textDecoration: "none" }}
                transition="all .2s"
              >
                {s.icon}
              </Link>
            ))}
          </HStack>

          <HStack gap={5}>
            {["Privacy Policy", "Terms", "Cookies"].map((t) => (
              <Link key={t} asChild fontSize="11px" color="rgba(255,255,255,0.25)"
                letterSpacing="0.06em" textTransform="uppercase"
                _hover={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
                transition="color .2s">
                <RouterLink to="#">{t}</RouterLink>
              </Link>
            ))}
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default Footer;