import {
  Box, Flex, Grid, Heading, Text, Icon, VStack, HStack,
} from "@chakra-ui/react";
import { MdSchool, MdLightbulb, MdPeople, MdTrendingUp, MdDevices, MdVerified, MdAutoAwesome } from "react-icons/md";
import { BsArrowRight, BsCheckCircleFill } from "react-icons/bs";
import { FiAward, FiTarget, FiZap } from "react-icons/fi";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";

const stats = [
  { value: "10,000+", label: "Students Enrolled", icon: "👨‍🎓" },
  { value: "94%", label: "WAEC Pass Rate", icon: "📈" },
  { value: "80+", label: "Expert Tutors", icon: "🧑‍🏫" },
  { value: "15", label: "Subjects Covered", icon: "📚" },
  { value: "4.9★", label: "App Store Rating", icon: "⭐" },
  { value: "3yrs", label: "Serving Nigeria", icon: "🇳🇬" },
];

const values = [
  {
    icon: <MdLightbulb />, color: "#F18729", bg: "#FFF4EC",
    title: "Student-First Learning",
    desc: "Every feature, every lesson, every interaction is designed around what helps students actually understand — not just pass. We obsess over comprehension, not completion.",
  },
  {
    icon: <MdSchool />, color: "#206CE1", bg: "#EBF3FF",
    title: "Academic Excellence",
    desc: "Our tutors are vetted, our content is reviewed by exam experts, and our pass rates speak for themselves. Quality isn't a checkbox — it's the culture.",
  },
  {
    icon: <MdPeople />, color: "#1FBA79", bg: "#EDFAF4",
    title: "Accessible to All",
    desc: "Great education shouldn't be a privilege. Flexible pricing, offline mode, and a mobile-first design mean any student anywhere in Nigeria can access what they need.",
  },
  {
    icon: <MdAutoAwesome />, color: "#AE3DD6", bg: "#F9F0FD",
    title: "AI That Teaches, Not Tells",
    desc: "Spark, our AI tutor, guides students to answers through questions and hints — never just handing over the solution. That's how real learning happens.",
  },
  {
    icon: <FiTarget />, color: "#018BEF", bg: "#E8F5FF",
    title: "Exam-Focused Curriculum",
    desc: "Built specifically for WAEC, NECO, JAMB, and A-Levels. Our content mirrors the exact patterns and question styles that appear in real Nigerian exams.",
  },
  {
    icon: <MdVerified />, color: "#F18729", bg: "#FFF4EC",
    title: "Results You Can Measure",
    desc: "Detailed analytics show students exactly where they stand — by subject, by topic, by week. No guessing. No surprises. Just a clear picture of progress.",
  },
];

const team = [
  { name: "Joseph Ajiboye", role: "Founder & CEO", initials: "JA", color: "#206CE1", bio: "Former teacher turned product builder. Passionate about closing the education gap in Nigeria." },
  { name: "Ngozi Adeyemi", role: "Head of Curriculum", initials: "NA", color: "#F18729", bio: "10+ years developing WAEC and JAMB-aligned content. Architect of the iGrades curriculum." },
  { name: "Tunde Olatunji", role: "Lead — STEM Tutors", initials: "TO", color: "#1FBA79", bio: "Physics PhD candidate and lead tutor overseeing our science faculty." },
  { name: "Amaka Obi", role: "Product & Technology", initials: "AO", color: "#AE3DD6", bio: "Built the platform from scratch. Leads everything engineering at iGrades." },
];

const milestones = [
  { year: "2021", title: "iGrades Founded", desc: "Started as a WhatsApp study group in Lagos. First 50 students enrolled in beta." },
  { year: "2022", title: "Platform Launched", desc: "Web app goes live. First 500 students. WAEC cohort sees 89% pass rate." },
  { year: "2023", title: "Mobile App Ships", desc: "iOS and Android apps launched. Spark AI tutor introduced. 3,000 students." },
  { year: "2024", title: "Nationwide Scale", desc: "Expanded to 30+ states. 10,000 students. Series A funding secured." },
];

const partners = ["WAEC", "JAMB", "NECO", "Cowrywise", "Flutterwave", "Google for Startups"];

const AboutPage = () => {
  return (
    <>
      <NavBar />
      <Box bg="#FFFFFF" overflow="hidden" mt={10}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&display=swap');
          .about-root * { font-family: "'Helvetica Neue', Helvetica, Arial, sans-serif"; }
          .about-root h1, .about-root h2, .about-root h3 { font-family: "'Space Grotesk Variable', sans-serif" !important; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
          @keyframes slideRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes dash { to { stroke-dashoffset: 0; } }
          .fu1{animation:fadeUp .7s ease .1s both}
          .fu2{animation:fadeUp .7s ease .25s both}
          .fu3{animation:fadeUp .7s ease .4s both}
          .fu4{animation:fadeUp .7s ease .55s both}
          .sr1{animation:slideRight .6s ease .2s both}
          .sr2{animation:slideRight .6s ease .35s both}
          .float-a{animation:float 5s ease-in-out infinite}
          .float-b{animation:float 5s ease-in-out 1.5s infinite}
          .float-c{animation:float 5s ease-in-out 3s infinite}
          .spin-s{animation:spin-slow 18s linear infinite}
          .val-card{transition:all .25s ease; cursor:default}
          .val-card:hover{transform:translateY(-6px); box-shadow:0 20px 48px rgba(0,0,0,0.1)!important}
          .team-card{transition:all .25s ease}
          .team-card:hover{transform:translateY(-4px)}
          .milestone-dot{transition:all .2s ease}
          .milestone-row:hover .milestone-dot{transform:scale(1.4)}
        `}</style>

        <Box className="about-root">

          {/* ══════════════════════════════════════
              HERO — editorial split layout
          ══════════════════════════════════════ */}
          <Box
            position="relative"
            bg="#07052A"
            pt={{ base: 28, md: 36 }}
            pb={{ base: 0, md: 0 }}
            px={{ base: 6, md: 12, lg: 20 }}
            overflow="hidden"
            minH={{ base: "auto", lg: "92vh" }}
          >
            {/* Animated grid lines */}
            <Box position="absolute" inset={0} opacity={0.04}
              backgroundImage="linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)"
              backgroundSize="60px 60px" pointerEvents="none" />

            {/* Spinning ring accent */}
            <Box position="absolute" top={{ base: "5%", md: "8%" }} right={{ base: "-60px", md: "-40px" }}
              w={{ base: "260px", md: "420px" }} h={{ base: "260px", md: "420px" }}
              borderRadius="full" border="1px solid rgba(32,108,225,0.2)"
              className="spin-s" pointerEvents="none" />
            <Box position="absolute" top={{ base: "8%", md: "11%" }} right={{ base: "-40px", md: "-20px" }}
              w={{ base: "200px", md: "340px" }} h={{ base: "200px", md: "340px" }}
              borderRadius="full" border="1px dashed rgba(241,135,41,0.25)"
              pointerEvents="none" />

            {/* Blobs */}
            <Box position="absolute" bottom="-100px" left="-80px" w="500px" h="500px"
              borderRadius="full" bg="#206CE1" opacity={0.06} filter="blur(100px)" pointerEvents="none" />
            <Box position="absolute" top="20%" right="20%" w="300px" h="300px"
              borderRadius="full" bg="#F18729" opacity={0.07} filter="blur(80px)" pointerEvents="none" />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={0} alignItems="flex-end" maxW="1300px" mx="auto" position="relative" zIndex={1}>

              {/* Left text */}
              <Box pb={{ base: 14, lg: 24 }}>
                <HStack className="fu1" mb={6} gap={2}>
                  <Box w="32px" h="2px" bg="#F18729" borderRadius="full" />
                  <Text color="#F18729" fontSize="xs" fontWeight="700"
                    letterSpacing="0.15em" textTransform="uppercase">
                    About iGrades
                  </Text>
                </HStack>

                <Heading
                  className="fu2"
                  color="white"
                  fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                  fontWeight="900"
                  lineHeight="1.05"
                  letterSpacing="-0.025em"
                  mb={7}
                  fontFamily="'Space Grotesk Variable', sans-serif"
                >
                  Built for the<br />
                  <Box as="span" position="relative" display="inline-block">
                    <Box as="span" color="#206CE1">Nigerian</Box>
                    {/* Underline accent */}
                    <Box position="absolute" bottom="-4px" left={0} right={0} h="3px"
                      bg="linear-gradient(90deg, #F18729, transparent)" borderRadius="full" />
                  </Box>
                  {" "}student<br />who refuses<br />
                  <Box as="span" color="#F18729">to be average.</Box>
                </Heading>

                <Text
                  className="fu3"
                  color="rgba(255,255,255,0.55)"
                  fontSize={{ base: "md", md: "lg" }}
                  lineHeight="1.85"
                  maxW="520px"
                  mb={10}
                >
                  iGrades is Nigeria's most complete online learning platform —
                  combining expert tutors, AI-powered study tools, structured
                  past-question banks, and live analytics to help every student
                  hit their academic peak.
                </Text>

                <HStack className="fu4" gap={4} flexWrap="wrap">
                  {["WAEC Ready", "JAMB Ready", "A-Level Ready"].map((tag, i) => (
                    <HStack key={tag} gap={2} bg="rgba(255,255,255,0.06)"
                      border="1px solid rgba(255,255,255,0.1)"
                      borderRadius="full" px={4} py={2}>
                      <Icon boxSize={3} color={["#F18729","#206CE1","#1FBA79"][i]}>
                        <BsCheckCircleFill />
                      </Icon>
                      <Text color="white" fontSize="xs" fontWeight="600">{tag}</Text>
                    </HStack>
                  ))}
                </HStack>
              </Box>

              {/* Right — abstract SVG illustration */}
              <Box
                display={{ base: "none", lg: "flex" }}
                alignItems="flex-end" justifyContent="center"
                position="relative" h="full"
              >
                {/* Main card stack illustration */}
                <Box position="relative" w="440px" h="500px">
                  {/* Back card */}
                  <Box
                    className="float-c"
                    position="absolute" top="60px" left="20px"
                    w="360px" borderRadius="24px"
                    bg="rgba(32,108,225,0.15)"
                    border="1px solid rgba(32,108,225,0.3)"
                    p={5} backdropFilter="blur(10px)"
                  >
                    <HStack gap={3} mb={4}>
                      <Box w="36px" h="36px" borderRadius="xl" bg="#206CE1"
                        display="flex" alignItems="center" justifyContent="center">
                        <Icon boxSize={4} color="white"><MdTrendingUp /></Icon>
                      </Box>
                      <Text color="white" fontWeight="700" fontSize="sm">Performance Report</Text>
                    </HStack>
                    {[["Mathematics", 88], ["Physics", 72], ["Chemistry", 95]].map(([s, p]) => (
                      <Box key={String(s)} mb={3}>
                        <Flex justify="space-between" mb={1}>
                          <Text color="rgba(255,255,255,0.6)" fontSize="xs">{s}</Text>
                          <Text color="white" fontSize="xs" fontWeight="700">{p}%</Text>
                        </Flex>
                        <Box h="5px" bg="rgba(255,255,255,0.1)" borderRadius="full">
                          <Box h="full" w={`${p}%`} borderRadius="full"
                            bg={Number(p) >= 85 ? "#1FBA79" : "#206CE1"} />
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Front card — Spark chat */}
                  <Box
                    className="float-a"
                    position="absolute" bottom="0px" right="0px"
                    w="300px" borderRadius="24px"
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.12)"
                    p={5} backdropFilter="blur(16px)"
                  >
                    <HStack gap={2} mb={4}>
                      <Box w="30px" h="30px" borderRadius="full"
                        bg="linear-gradient(135deg,#F18729,#e06d1a)"
                        display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="12px">⚡</Text>
                      </Box>
                      <Text color="white" fontWeight="700" fontSize="xs">Spark AI Tutor</Text>
                      <Box ml="auto" w="6px" h="6px" borderRadius="full" bg="#1FBA79" />
                    </HStack>
                    <Box bg="rgba(255,255,255,0.08)" borderRadius="12px 12px 12px 4px" p={3} mb={2}>
                      <Text fontSize="11px" color="rgba(255,255,255,0.7)">
                        Why does a balloon shrink in the cold?
                      </Text>
                    </Box>
                    <Box bg="rgba(32,108,225,0.3)" borderRadius="12px 12px 4px 12px" p={3} alignSelf="flex-end">
                      <Text fontSize="11px" color="rgba(255,255,255,0.8)">
                        Great question! Think about what happens to gas molecules when temperature drops...
                      </Text>
                    </Box>
                  </Box>

                  {/* Floating badge */}
                  <Box
                    className="float-b"
                    position="absolute" top="10px" right="10px"
                    bg="#F18729" borderRadius="16px" px={4} py={2}
                    boxShadow="0 8px 24px rgba(241,135,41,0.4)"
                  >
                    <Text color="white" fontWeight="800" fontSize="sm">94% Pass Rate</Text>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Diagonal bottom clip */}
            <Box
              position="absolute" bottom="-2px" left={0} right={0} h="80px"
              bg="white"
              style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
            />
          </Box>

          {/* ══════════════════════════════════════
              STATS — overlapping cards
          ══════════════════════════════════════ */}
          <Box py={16} px={{ base: 6, md: 12, lg: 20 }} bg="white">
            <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(6,1fr)" }}
              gap={4} maxW="1300px" mx="auto">
              {stats.map((s) => (
                <Box key={s.label} textAlign="center" p={5}
                  bg="#F9F9FB" borderRadius="2xl"
                  border="1px solid #EBEBF7"
                  _hover={{ bg: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", transform: "translateY(-4px)" }}
                  transition="all .25s ease">
                  <Text fontSize="2xl" mb={1}>{s.icon}</Text>
                  <Text fontWeight="900" fontSize={{ base: "xl", md: "2xl" }}
                    color="#206CE1" fontFamily="'Space Grotesk Variable', sans-serif">{s.value}</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="500" mt={0.5}>{s.label}</Text>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              STORY — asymmetric layout
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="#F9F9FB">
            <Grid templateColumns={{ base: "1fr", lg: "5fr 4fr" }}
              gap={16} alignItems="center" maxW="1300px" mx="auto">
              <Box>
                <HStack mb={4} gap={2}>
                  <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                  <Text fontSize="xs" fontWeight="700" color="#F18729"
                    letterSpacing="0.12em" textTransform="uppercase">Our Story</Text>
                </HStack>
                <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="900"
                  color="#07052A" lineHeight="1.15" mb={6}
                  letterSpacing="-0.02em" fontFamily="'Space Grotesk Variable', sans-serif">
                  Started in a Lagos classroom.
                  <Box as="span" color="#206CE1"> Grown across Nigeria.</Box>
                </Heading>
                <VStack align="start" gap={5}>
                  <Text fontSize="md" color="#474256" lineHeight="1.9">
                    iGrades was born from frustration. Our founder watched brilliant students
                    fail WAEC and JAMB — not because they lacked ability, but because they
                    lacked access to consistent, affordable academic support. The private tutors
                    that wealthy students had were out of reach. Good study materials were
                    scattered across WhatsApp groups. There was no single, trustworthy place
                    a student could go to get everything they needed.
                  </Text>
                  <Text fontSize="md" color="#474256" lineHeight="1.9">
                    So in 2021, we built iGrades. We started with 50 students in a beta group
                    and a simple promise: to give every Nigerian student the same quality of
                    academic support that was previously only available to the privileged few.
                    Today we serve over 10,000 students across 30 states — and we're just getting started.
                  </Text>
                </VStack>

                <Grid templateColumns="1fr 1fr" gap={4} mt={8}>
                  {[
                    { icon: <FiAward />, label: "Best EdTech Startup 2023", sub: "Lagos Innovation Awards" },
                    { icon: <FiZap />, label: "Top-Rated Tutoring App", sub: "App Store Nigeria, 2024" },
                    { icon: <MdDevices />, label: "Multi-Platform", sub: "Web, iOS & Android" },
                    { icon: <MdTrendingUp />, label: "2x Growth YoY", sub: "Since 2022" },
                  ].map((a) => (
                    <HStack key={a.label} gap={3} p={3} bg="white"
                      borderRadius="xl" border="1px solid #EBEBF7">
                      <Box w="34px" h="34px" borderRadius="lg" bg="#EBF3FF" flexShrink={0}
                        display="flex" alignItems="center" justifyContent="center">
                        <Icon boxSize={4} color="#206CE1">{a.icon}</Icon>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="#242E3E" lineHeight="1.2">{a.label}</Text>
                        <Text fontSize="10px" color="gray.400">{a.sub}</Text>
                      </Box>
                    </HStack>
                  ))}
                </Grid>
              </Box>

              {/* Timeline */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="#206CE1"
                  letterSpacing="0.12em" textTransform="uppercase" mb={6}>Milestones</Text>
                <VStack align="stretch" gap={0}>
                  {milestones.map((m, i) => (
                    <HStack key={m.year} className="milestone-row" align="flex-start" gap={4}
                      pb={i < milestones.length - 1 ? 6 : 0} position="relative">
                      {/* Line */}
                      {i < milestones.length - 1 && (
                        <Box position="absolute" left="19px" top="40px" bottom={0}
                          w="2px" bg="#EBEBF7" />
                      )}
                      {/* Dot */}
                      <Box className="milestone-dot" w="40px" h="40px" borderRadius="full" flexShrink={0}
                        bg={i % 2 === 0 ? "#206CE1" : "#F18729"}
                        display="flex" alignItems="center" justifyContent="center"
                        boxShadow={`0 4px 12px ${i % 2 === 0 ? "rgba(32,108,225,0.3)" : "rgba(241,135,41,0.3)"}`}>
                        <Text color="white" fontSize="10px" fontWeight="800">{m.year}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="700" fontSize="sm" color="#242E3E" mb={1}>{m.title}</Text>
                        <Text fontSize="sm" color="#474256" lineHeight="1.7">{m.desc}</Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              VALUES — editorial grid
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="white">
            <Box maxW="1300px" mx="auto">
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} alignItems="start" mb={12}>
                <Box>
                  <HStack mb={4} gap={2}>
                    <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                    <Text fontSize="xs" fontWeight="700" color="#F18729"
                      letterSpacing="0.12em" textTransform="uppercase">What We Stand For</Text>
                  </HStack>
                  <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="900"
                    color="#07052A" letterSpacing="-0.02em" lineHeight="1.15"
                    fontFamily="'Space Grotesk Variable', sans-serif">
                    Six principles that<br />guide everything we do.
                  </Heading>
                </Box>
                <Flex align="flex-end">
                  <Text fontSize="md" color="#474256" lineHeight="1.85">
                    We don't just say we care about students — every product decision,
                    every hire, and every feature is run through these values first.
                    This is the iGrades operating system.
                  </Text>
                </Flex>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
                {values.map((v, i) => (
                  <Box key={v.title} className="val-card" p={7} borderRadius="2xl"
                    bg={v.bg} border="1px solid" borderColor="gray.100"
                    boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                    position="relative" overflow="hidden">
                    <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px"
                      borderRadius="full" bg={v.color} opacity={0.07} />
                    <Box w="48px" h="48px" borderRadius="xl" bg={v.color}
                      display="flex" alignItems="center" justifyContent="center" mb={5}>
                      <Icon boxSize={5} color="white">{v.icon}</Icon>
                    </Box>
                    <Box position="absolute" top={5} right={5}>
                      <Text fontWeight="900" fontSize="3xl" color={v.color} opacity={0.15}
                        fontFamily="'Space Grotesk Variable', sans-serif">0{i + 1}</Text>
                    </Box>
                    <Text fontWeight="700" fontSize="md" color="#242E3E" mb={3}>{v.title}</Text>
                    <Text fontSize="sm" color="#474256" lineHeight="1.85">{v.desc}</Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* ══════════════════════════════════════
              TEAM
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="#07052A">
            <Box maxW="1300px" mx="auto">
              <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={12} alignItems="start" mb={14}>
                <Box>
                  <HStack mb={4} gap={2}>
                    <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                    <Text fontSize="xs" fontWeight="700" color="#F18729"
                      letterSpacing="0.12em" textTransform="uppercase">The Team</Text>
                  </HStack>
                  <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900"
                    color="white" letterSpacing="-0.02em" lineHeight="1.2"
                    fontFamily="'Space Grotesk Variable', sans-serif">
                    The people behind the mission.
                  </Heading>
                </Box>
                <Flex align="flex-end">
                  <Text color="rgba(255,255,255,0.5)" fontSize="md" lineHeight="1.85">
                    A small, focused team of educators, engineers, and dreamers united by one goal:
                    to make academic excellence achievable for every Nigerian student.
                  </Text>
                </Flex>
              </Grid>

              <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={5}>
                {team.map((member) => (
                  <Box key={member.name} className="team-card" p={6}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.08)"
                    borderRadius="2xl">
                    <Box w="60px" h="60px" borderRadius="full" bg={member.color}
                      display="flex" alignItems="center" justifyContent="center" mb={4}>
                      <Text color="white" fontWeight="900" fontSize="xl"
                        fontFamily="'Space Grotesk Variable', sans-serif">{member.initials}</Text>
                    </Box>
                    <Text fontWeight="700" fontSize="sm" color="white" mb={0.5}>{member.name}</Text>
                    <Text fontSize="xs" color={member.color} fontWeight="600" mb={3}>{member.role}</Text>
                    <Text fontSize="xs" color="rgba(255,255,255,0.45)" lineHeight="1.75">{member.bio}</Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* ══════════════════════════════════════
              PARTNERS
          ══════════════════════════════════════ */}
          <Box py={12} px={{ base: 6, md: 12, lg: 20 }} bg="#F9F9FB"
            borderTop="1px solid #EBEBF7" borderBottom="1px solid #EBEBF7">
            <Text textAlign="center" fontSize="xs" fontWeight="700" color="gray.400"
              letterSpacing="0.15em" textTransform="uppercase" mb={8}>
              Trusted & Recognised By
            </Text>
            <Flex justify="center" gap={{ base: 6, md: 10 }} flexWrap="wrap">
              {partners.map((p) => (
                <Text key={p} fontSize={{ base: "md", md: "lg" }} fontWeight="800"
                  color="#BDBDBD" fontFamily="'Space Grotesk Variable', sans-serif"
                  _hover={{ color: "#206CE1" }} transition="color .2s" cursor="default">
                  {p}
                </Text>
              ))}
            </Flex>
          </Box>

          {/* ══════════════════════════════════════
              CTA
          ══════════════════════════════════════ */}
          <Box
            position="relative" overflow="hidden"
            bg="linear-gradient(135deg, #206CE1 0%, #07052A 100%)"
            py={{ base: 16, md: 24 }} px={{ base: 6, md: 12 }} textAlign="center"
          >
            <Box position="absolute" inset={0} opacity={0.04}
              backgroundImage="linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)"
              backgroundSize="48px 48px" pointerEvents="none" />
            <Box position="absolute" top="-80px" right="-80px" w="400px" h="400px"
              borderRadius="full" bg="#F18729" opacity={0.08} filter="blur(80px)" pointerEvents="none" />
            <Box position="relative" zIndex={1} maxW="640px" mx="auto">
              <Heading color="white" fontSize={{ base: "2xl", md: "4xl" }} fontWeight="900"
                letterSpacing="-0.025em" lineHeight="1.15" mb={5} fontFamily="'Space Grotesk Variable', sans-serif">
                Your academic breakthrough starts today.
              </Heading>
              <Text color="rgba(255,255,255,0.6)" mb={10} fontSize="md" lineHeight="1.8">
                Join 10,000+ students across Nigeria who are studying smarter,
                scoring higher, and building their futures with iGrades.
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                <Box as="button" bg="#F18729" color="white" px={8} py={4} borderRadius="xl"
                  fontWeight="700" fontSize="md" display="inline-flex" alignItems="center" gap={2}
                  border="none" cursor="pointer"
                  boxShadow="0 8px 32px rgba(241,135,41,0.4)"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 40px rgba(241,135,41,0.5)" }}
                  transition="all .2s">
                  Get Started Free <Icon boxSize={4}><BsArrowRight /></Icon>
                </Box>
                <Box as="button" bg="transparent" color="white" px={8} py={4} borderRadius="xl"
                  fontWeight="700" fontSize="md" border="1px solid rgba(255,255,255,0.25)"
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }} transition="all .2s">
                  View Pricing
                </Box>
              </HStack>
            </Box>
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default AboutPage;