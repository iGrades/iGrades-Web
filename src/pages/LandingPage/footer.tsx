import { Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebookSquare } from "react-icons/fa";
import logo from "@/assets/landing-page/logo.png";

const footer = () => {
  const navItems = [
    { name: "Home", link: "#" },
    { name: "About us", link: "#" },
    { name: "Download", link: "#" },
    { name: "Contact us", link: "#" },
    { name: "Log in", link: "#" },
    { name: "Sign up", link: "#" },
  ];
  return (
    <Box
      bg="#E0ECFF"
      pt={10}
      mt={20}
      alignContent="center"
    >
      {/* logo image */}
      <Box
        display="flex"
        alignItems="center"
        w={{ base: "25%", md: "15%" }}
        m="auto"
        my={2}
      >
        <Image src={logo} alt="iGrades_logo" width="150px" fit="cover" />
      </Box>

      <Flex
      flexWrap='wrap'
      gap={{base: 6, md: 3, lg: 0}}
        mx={{base: 0, md: '6', lg:'16'}}
        mb={10}
        py={10}
        px={{ base: 2, md: 6, lg: 12 }}
        justify="space-around"
        align="start"
      >
        {navItems.map((item, idx) => (
          <Link
            href={item.name}
            key={idx}
            flex="1"
            mx={{base: 5, md: 1, lg: 10}}
            textAlign="center"
            borderRight={idx !== navItems.length ? "2px solid" : "none"}
            borderColor="#232323"
            fontSize="sm"
            fontWeight="semibold"
            color="#232323"
          >
            {item.name}
          </Link>
        ))}
      </Flex>

      <Flex justify="center" align="center" mt={-6}>
        {[
          <FaGoogle />,
          <FaLinkedinIn />,
          <AiFillInstagram />,
          <FaFacebookSquare />,
        ].map((icon, idx) => (
          <Link key={idx} href="#" mx={2} fontSize="2xl" color="#232323">
            {icon}
          </Link>
        ))}
      </Flex>

      <Flex
        color="#232323"
        justify={{base: 'space-between', md: 'space-around'}}
        align="center"
        mt={10}
        py={3}
        bg="white"
        fontSize={{base: 'xs', md: 'sm'}}
      >
        <Text>(c) 2022 copyright | Indomitables, All rights reserved</Text>
        <Link href="#!">Privacy & Policy | Terms & Condition</Link>
      </Flex>
    </Box>
  );
};

export default footer;
