import { Box } from "@chakra-ui/react";
import NavBar from "./navBar";
import Hero from "./hero";
import Services from "./services";
import About from "./about";
import Courses from "./courses";
import Reviews from "./reviews";
import Footer from "./footer";
import ScrollReveal from "./scrollReveal";

const LandingPage = () => {
  return (
    <Box>
      <ScrollReveal direction="left" delay={0.2}>
        <NavBar />
      </ScrollReveal>

      <ScrollReveal direction="up">
        <Hero />
      </ScrollReveal>

      <ScrollReveal direction="left" delay={0.2}>
        <Services />
      </ScrollReveal>

      <ScrollReveal direction="right" delay={0.2}>
        <About />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.2}>
        <Courses />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.2}>
        <Reviews />
      </ScrollReveal>

      <Footer />
    </Box>
  );
};

export default LandingPage;
