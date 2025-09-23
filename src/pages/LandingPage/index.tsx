import { Box, Flex, Button, Image, Grid } from "@chakra-ui/react";
import NavBar from "./navBar";
import Hero from "./hero";
import Services from "./services";
import About from "./about";
import Courses from "./courses";
import Reviews from "./reviews";
import Footer from "./footer";

const LandingPage = () => {
   
  return (
    <Box>
        <NavBar />
        <Hero />
        <Services />
        <About />
        <Courses />
        <Reviews />
        <Footer />
    </Box>
  );
};

export default LandingPage;