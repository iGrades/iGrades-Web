import {
  Box, Grid, Heading, Text, Icon, VStack, HStack,
} from "@chakra-ui/react";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { BsTwitterX, BsInstagram, BsFacebook, BsWhatsapp, BsCheckCircleFill } from "react-icons/bs";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";
import ContactForm from "./LandingPage/contactForm";

const contactInfo = [
  { icon: <MdEmail />, color: "#206CE1", bg: "#EBF3FF", label: "Email Us", value: "hello@igrades.ng", sub: "We reply within 24 hours" },
  { icon: <MdPhone />, color: "#F18729", bg: "#FFF4EC", label: "WhatsApp / Call", value: "+234 704 542 2933", sub: "Mon – Sat · 8am – 8pm" },
  { icon: <MdLocationOn />, color: "#1FBA79", bg: "#EDFAF4", label: "Head Office", value: "Ibadan, Nigeria", sub: "No. 80, Road C, Alagbayun road, Akobo, Oyo State" },
   
];

const socials = [
  { icon: <BsTwitterX />, label: "Twitter / X", handle: "@iGradesNG", color: "#1a1a1a", href: "https://x.com/goodindomitable?s=21" },
  { icon: <BsInstagram />, label: "Instagram", handle: "@igrades.ng", color: "#E1306C", href: "https://www.instagram.com/igradesapp?igsh=MWkzOG9lc3lxMmJuZA%3D%3D&utm_source=qr" },
  { icon: <BsFacebook />, label: "Facebook", handle: "iGrades Nigeria", color: "#1877F2", href: "https://www.facebook.com/share/1HscvuX9Vh/?mibextid=wwXIfr" },
  { icon: <BsWhatsapp />, label: "WhatsApp", handle: "Chat with us ", color: "#25D366", href: "https://wa.me/2347045422933" },
];

const faqs = [
  { q: "What is iGrades?", a: "iGrades is an academic support platform that helps students with services such as tutoring, assignments, and other academic support solutions designed to make studying less stressful." },
  { q: "How does iGrades work?", a: "Register and a student or tutor - Pick Your Subjects - Start learning or teaching under guidelines - Take quizzes and pass exams - Get Certified"},
  { q: "Is iGrades free?", a: "Yes! You can access a generous free tier. Premium plans unlock all subjects, AI tutoring, and live support." },
  { q: "What subjects can I learn on iGrades?", a: "All Nigerian Secondary School Approved Subjects " },
  { q: "How do I register for a class?", a: "Simply click the link to get started" },
  { q: "Is iGrades a tutoring service?", a: "iGrades provides academic support and educational assistance to help students better " },
  { q: "What exams does iGrades cover?", a: "WAEC, NECO, JAMB, and A-Level. Content is updated every year to match current syllabi." },
    { q: "Is iGrades available for international students?", a: "Yes. iGrades works with students from different countries and educational systems." },
  { q: "Can I use iGrades without internet?", a: "Yes. Download lessons, videos, and past questions for offline use on our mobile app." },
  { q: "How does the AI tutor work?", a: "Spark asks you questions and gives hints rather than direct answers — this builds real understanding, not just recall." },
    { q: "Is my information confidential?", a: "Your personal information, documents, and conversations are kept private and secure." },
];

const ContactPage = () => {
  return (
    <>
      <NavBar />
      <Box bg="white" overflow="hidden" >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@700;800;900&display=swap');
          .ct-root * { font-family: "'Plus Jakarta Sans', sans-serif"; }
          .ct-root h1,.ct-root h2,.ct-root h3 { font-family: "'Lexend', sans-serif" !important; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scaleIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
          .fu1{animation:fadeUp .7s ease .1s both}
          .fu2{animation:fadeUp .7s ease .25s both}
          .fu3{animation:fadeUp .7s ease .4s both}
          .success-in{animation:scaleIn .4s cubic-bezier(.16,1,.3,1) both}
          .online-dot{animation:blink 2s ease-in-out infinite}
          .social-item{transition:all .2s ease}
          .social-item:hover{transform:translateX(4px)}
          .faq-item{transition:all .2s ease}
          .faq-item:hover{background:#F9F9FB!important}
          .topic-pill{transition:all .15s ease}
          .submit-btn{transition:all .2s ease}
          .submit-btn:hover:not([disabled]){transform:translateY(-2px);box-shadow:0 12px 32px rgba(32,108,225,0.35)!important}
        `}</style>

        <Box className="ct-root">

          {/* ══════════════════════════════════════
              HERO
          ══════════════════════════════════════ */}
          <Box position="relative" bg="#07052A" overflow="hidden"
            pt={{ base: 28, md: 36 }} pb={{ base: 20, md: 28 }}
            px={{ base: 6, md: 12, lg: 20 }}>
            <Box position="absolute" inset={0} opacity={0.04}
              backgroundImage="linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)"
              backgroundSize="56px 56px" pointerEvents="none" />
            <Box position="absolute" top="-80px" right="-80px" w="500px" h="500px"
              borderRadius="full" bg="#206CE1" opacity={0.07} filter="blur(100px)" pointerEvents="none" />
            <Box position="absolute" bottom="-60px" left="30%" w="300px" h="300px"
              borderRadius="full" bg="#F18729" opacity={0.07} filter="blur(80px)" pointerEvents="none" />

            <Box position="relative" zIndex={1} maxW="760px">
              <HStack className="fu1" mb={6} gap={2}>
                <Box w="32px" h="2px" bg="#F18729" borderRadius="full" />
                <Text color="#F18729" fontSize="xs" fontWeight="700"
                  letterSpacing="0.15em" textTransform="uppercase">Contact Us</Text>
              </HStack>
              <Heading className="fu2"
                color="white" fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                fontWeight="900" lineHeight="1.05" letterSpacing="-0.025em" mb={6}>
                We'd love to
                <Box as="span" color="#F18729"> hear<br />from you.</Box>
              </Heading>
              <Text className="fu3"
                color="rgba(255,255,255,0.5)" fontSize={{ base: "md", md: "lg" }}
                lineHeight="1.85" maxW="560px">
                Whether it's a question, a partnership idea, a bug report, or just a hello —
                our team reads every message and responds within 24 hours.
              </Text>
            </Box>
          </Box>

          {/* ══════════════════════════════════════
              CONTACT INFO CARDS — overlap hero
          ══════════════════════════════════════ */}
          <Box px={{ base: 6, md: 12, lg: 20 }} mt={-10} position="relative" zIndex={2}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
              gap={4} maxW="1000px" mx="auto">
              {contactInfo.map((c) => (
                <Box key={c.label} bg="white" borderRadius="2xl" p={6}
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  border="1px solid #EBEBF7"
                  display="flex" alignItems="center" gap={4}>
                  <Box w="52px" h="52px" borderRadius="xl" bg={c.bg} flexShrink={0}
                    display="flex" alignItems="center" justifyContent="center">
                    <Icon boxSize={6} color={c.color}>{c.icon}</Icon>
                  </Box>
                  <Box>
                    <Text fontSize="10px" color="gray.400" fontWeight="700"
                      textTransform="uppercase" letterSpacing="0.08em" mb={0.5}>{c.label}</Text>
                    <Text fontWeight="800" fontSize="sm" color="#242E3E" lineHeight="1.3"
                      fontFamily="'Lexend', sans-serif">{c.value}</Text>
                    <Text fontSize="xs" color="gray.400" mt={0.5}>{c.sub}</Text>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              MAIN — form + sidebar
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 20 }} px={{ base: 6, md: 12, lg: 20 }}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }}
              gap={10} maxW="1100px" mx="auto" alignItems="start">

              {/* ── Form ── */}
              <ContactForm />

              {/* ── Sidebar ── */}
              <VStack gap={5} align="stretch">

                {/* Online indicator */}
                <Box bg="#07052A" borderRadius="2xl" p={5}
                  border="1px solid rgba(255,255,255,0.08)">
                  <HStack gap={3} mb={4}>
                    <Box position="relative">
                      <Box className="online-dot" w="10px" h="10px" borderRadius="full" bg="#1FBA79" />
                      <Box position="absolute" inset={0} w="10px" h="10px" borderRadius="full"
                        bg="#1FBA79" opacity={0.3}
                        style={{ animation: "blink 2s ease-in-out infinite" }} />
                    </Box>
                    <Text color="white" fontWeight="700" fontSize="sm">We're online now</Text>
                  </HStack>
                  <Text color="rgba(255,255,255,0.45)" fontSize="xs" lineHeight="1.7">
                    Average response time: <strong style={{ color: "#1FBA79" }}>under 2 hours</strong>.
                    For urgent matters, WhatsApp us directly.
                  </Text>
                </Box>

                {/* Social links */}
                <Box bg="white" borderRadius="2xl" p={6}
                  border="1px solid #EBEBF7" boxShadow="0 2px 12px rgba(0,0,0,0.04)">
                  <Text fontSize="xs" fontWeight="700" color="#BDBDBD"
                    textTransform="uppercase" letterSpacing="0.1em" mb={4}>Find Us On Social</Text>
                  <VStack align="stretch" gap={2.5}>
                    {socials.map((s) => (
                      <a 
                        key={s.label}
                        href={s.href}      
                        target="_blank"   
                        rel="noopener noreferrer" 
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <HStack 
                          className="social-item" 
                          gap={3}
                          p={3} 
                          borderRadius="xl" 
                          cursor="pointer" 
                          w="full" 
                          justify="flex-start"
                          bg="#F9F9FB" 
                          border="1px solid #EBEBF7"
                          _hover={{ borderColor: "#BDBDBD" }} 
                          transition="all .15s"
                        >
                          <Box 
                            w="36px" 
                            h="36px" 
                            borderRadius="lg" 
                            bg={s.color}
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center" 
                            flexShrink={0}
                          >
                            <Icon boxSize={4} color="white">{s.icon}</Icon>
                          </Box>
                          
                          <Box textAlign="left">
                            <Text fontSize="10px" color="#BDBDBD" lineHeight={1} mb={0.5}>{s.label}</Text>
                            <Text fontSize="sm" fontWeight="600" color="#242E3E">{s.handle}</Text>
                          </Box>
                        </HStack>
                      </a>
                    ))}
                  </VStack>
                </Box>

              </VStack>
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              FAQ
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 20 }} px={{ base: 6, md: 12, lg: 20 }} bg="#F9F9FB"
            borderTop="1px solid #EBEBF7">
            <Box maxW="800px" mx="auto">
              <HStack mb={4} gap={2}>
                <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                <Text fontSize="xs" fontWeight="700" color="#F18729"
                  letterSpacing="0.12em" textTransform="uppercase">Quick Answers</Text>
              </HStack>
              <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="900"
                color="#07052A" letterSpacing="-0.02em" mb={8}
                fontFamily="'Lexend', sans-serif">
                Frequently asked questions
              </Heading>
              <VStack align="stretch" gap={3}>
                {faqs.map((f) => (
                  <Box key={f.q} className="faq-item" p={6} bg="white" borderRadius="2xl"
                    border="1px solid #EBEBF7" boxShadow="0 1px 4px rgba(0,0,0,0.04)">
                    <HStack align="start" gap={4}>
                      <Box w="24px" h="24px" borderRadius="lg" bg="#EBF3FF" flexShrink={0}
                        display="flex" alignItems="center" justifyContent="center" mt={0.5}>
                        <Icon boxSize={3} color="#206CE1"><BsCheckCircleFill /></Icon>
                      </Box>
                      <Box>
                        <Text fontWeight="700" fontSize="md" color="#242E3E" mb={2}>{f.q}</Text>
                        <Text fontSize="sm" color="#474256" lineHeight="1.8">{f.a}</Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ContactPage;