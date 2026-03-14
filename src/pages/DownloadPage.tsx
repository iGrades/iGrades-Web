import {
  Box, Flex, Grid, Heading, Text, Icon,  HStack,
} from "@chakra-ui/react";
import { MdOfflineBolt, MdNotifications, MdBarChart, MdSecurity, MdDevices, MdAutoAwesome } from "react-icons/md";
import { BsApple, BsGooglePlay, BsGlobe, BsCheckCircleFill } from "react-icons/bs";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";

const features = [
  { icon: <MdOfflineBolt />, color: "#F18729", bg: "#FFF4EC", title: "Works Offline", desc: "Download lessons, practice tests, and video summaries. Study on the go — no data needed." },
  { icon: <MdNotifications />, color: "#206CE1", bg: "#EBF3FF", title: "Smart Reminders", desc: "Personalised daily nudges that adapt to your exam calendar and weak subjects." },
  { icon: <MdBarChart />, color: "#1FBA79", bg: "#EDFAF4", title: "Deep Analytics", desc: "Know exactly where you stand — by subject, by topic, by week. No guessing required." },
  { icon: <MdSecurity />, color: "#AE3DD6", bg: "#F9F0FD", title: "Secure & Private", desc: "Your data is encrypted and never shared. Student privacy is non-negotiable." },
  { icon: <MdDevices />, color: "#018BEF", bg: "#E8F5FF", title: "Sync Everywhere", desc: "Start on your phone, finish on your laptop. Progress syncs instantly across all devices." },
  { icon: <MdAutoAwesome />, color: "#F18729", bg: "#FFF4EC", title: "AI Tutor Built In", desc: "Spark is available on every platform — ask questions, get hints, learn better." },
];

const platforms = [
  { icon: <BsApple />, label: "Download on the", name: "App Store", sub: "iOS 14 · 4.9★", bg: "#1a1a1a", glow: "rgba(0,0,0,0.4)" },
  { icon: <BsGooglePlay />, label: "Get it on", name: "Google Play", sub: "Android 8+ · 4.8★", bg: "#206CE1", glow: "rgba(32,108,225,0.45)" },
  { icon: <BsGlobe />, label: "Open in", name: "Web Browser", sub: "Any device · Free", bg: "#F18729", glow: "rgba(241,135,41,0.45)" },
];

const steps = [
  { num: "01", title: "Download the app", desc: "Free on App Store and Google Play, or open in any browser. No hardware requirements.", color: "#206CE1" },
  { num: "02", title: "Set your subjects", desc: "Choose your exam type (WAEC, JAMB, A-Level), select your subjects and set target grades.", color: "#F18729" },
  { num: "03", title: "Pick your plan", desc: "Start completely free. Upgrade to unlock all subjects, AI tutoring, and live support.", color: "#1FBA79" },
  { num: "04", title: "Study & track", desc: "Access all materials, take practice quizzes, chat with Spark, and watch your score rise.", color: "#AE3DD6" },
];

const reviews = [
  { name: "Adaeze O.", score: "A1 Mathematics", text: "I failed WAEC twice before iGrades. Third time I got A1. Spark helped me understand what I was missing, not just memorise answers.", rating: 5 },
  { name: "Emeka N.", score: "JAMB — 312/400", text: "Used iGrades for 3 months before JAMB. Got 312. The past questions bank alone is worth it — it knows exactly what JAMB likes to ask.", rating: 5 },
  { name: "Fatima B.", score: "6 Credits, 1 attempt", text: "The offline mode was a game changer. Our area has poor internet. I downloaded everything and studied every night. First attempt, 6 credits.", rating: 5 },
];

const DownloadPage = () => {
  return (
    <>
      <NavBar />
      <Box bg="white" overflow="hidden" mt={10}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&display=swap');
          .dl-root * { font-family: "'Helvetica Neue', Helvetica, Arial, sans-serif"; }
          .dl-root h1,.dl-root h2,.dl-root h3 { font-family: "'Space Grotesk Variable', sans-serif" !important; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes float2 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
          @keyframes pulse-ring { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(1.6);opacity:0} }
          .fu1{animation:fadeUp .7s ease .1s both}
          .fu2{animation:fadeUp .7s ease .25s both}
          .fu3{animation:fadeUp .7s ease .4s both}
          .float-a{animation:float 5s ease-in-out infinite}
          .float-b{animation:float 5s ease-in-out 1.7s infinite}
          .float-c{animation:float2 6s ease-in-out .8s infinite}
          .pl-btn{transition:all .25s ease}
          .pl-btn:hover{transform:translateY(-5px)!important}
          .feat-card{transition:all .25s ease}
          .feat-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important}
          .review-card{transition:all .2s ease}
          .review-card:hover{transform:translateY(-3px)}
        `}</style>

        <Box className="dl-root">

          {/* ══════════════════════════════════════
              HERO
          ══════════════════════════════════════ */}
          <Box position="relative" bg="#07052A" overflow="hidden"
            pt={{ base: 28, md: 36 }} pb={{ base: 16, md: 0 }}
            px={{ base: 6, md: 12, lg: 20 }}
            minH={{ base: "auto", lg: "90vh" }}>

            <Box position="absolute" inset={0} opacity={0.04}
              backgroundImage="radial-gradient(circle, #fff 1.5px, transparent 1.5px)"
              backgroundSize="36px 36px" pointerEvents="none" />
            <Box position="absolute" bottom="-100px" left="-60px" w="500px" h="500px"
              borderRadius="full" bg="#206CE1" opacity={0.08} filter="blur(100px)" pointerEvents="none" />
            <Box position="absolute" top="10%" right="15%" w="350px" h="350px"
              borderRadius="full" bg="#F18729" opacity={0.06} filter="blur(80px)" pointerEvents="none" />

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={12} alignItems="center" maxW="1300px" mx="auto" position="relative" zIndex={1}
              pb={{ base: 12, lg: 0 }}>

              {/* Left text */}
              <Box pb={{ base: 0, lg: 20 }}>
                <HStack className="fu1" mb={6} gap={2}>
                  <Box w="32px" h="2px" bg="#F18729" borderRadius="full" />
                  <Text color="#F18729" fontSize="xs" fontWeight="700"
                    letterSpacing="0.15em" textTransform="uppercase">Now Available</Text>
                </HStack>
                <Heading className="fu2"
                  color="white" fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                  fontWeight="900" lineHeight="1.05" letterSpacing="-0.025em" mb={7}>
                  Your grades<br />
                  <Box as="span" color="#F18729">live in your</Box><br />
                  pocket now.
                </Heading>
                <Text className="fu3"
                  color="rgba(255,255,255,0.55)" fontSize={{ base: "md", md: "lg" }}
                  lineHeight="1.85" maxW="500px" mb={10}>
                  iGrades is available on iOS, Android, and the web.
                  Study on the bus, revise before bed, practice
                  JAMB questions at lunch — learning never stops.
                </Text>

                <Flex gap={4} flexWrap="wrap" className="fu3">
                  {platforms.map((p) => (
                    <Box key={p.name} className="pl-btn" as="button"
                      bg={p.bg} borderRadius="16px" px={5} py={3.5}
                      display="flex" alignItems="center" gap={3}
                      cursor="pointer" border="none"
                      boxShadow={`0 8px 24px ${p.glow}`} minW="160px">
                      <Icon boxSize={6} color="white">{p.icon}</Icon>
                      <Box textAlign="left">
                        <Text color="rgba(255,255,255,0.65)" fontSize="9px" lineHeight={1} mb={0.5}
                          textTransform="uppercase" letterSpacing="0.08em">{p.label}</Text>
                        <Text color="white" fontWeight="700" fontSize="sm" lineHeight={1.2}>{p.name}</Text>
                        <Text color="rgba(255,255,255,0.5)" fontSize="10px" mt={0.5}>{p.sub}</Text>
                      </Box>
                    </Box>
                  ))}
                </Flex>

                <HStack mt={8} gap={6} className="fu3">
                  {["Free to download", "No credit card", "Cancel anytime"].map((t) => (
                    <HStack key={t} gap={1.5}>
                      <Icon boxSize={3} color="#1FBA79"><BsCheckCircleFill /></Icon>
                      <Text color="rgba(255,255,255,0.5)" fontSize="xs">{t}</Text>
                    </HStack>
                  ))}
                </HStack>
              </Box>

              {/* Right — phone stack */}
              <Box display={{ base: "none", lg: "block" }}
                position="relative" h="600px">

                {/* Phone 1 — back left */}
                <Box className="float-c" position="absolute" left="0px" top="80px"
                  w="200px" h="380px" bg="#111" borderRadius="36px"
                  boxShadow="0 40px 80px rgba(0,0,0,0.6)"
                  border="6px solid #222" overflow="hidden" zIndex={1}>
                  <Box bg="#206CE1" h="60px" display="flex" alignItems="center" px={4} gap={2}>
                    <Box w="6px" h="6px" borderRadius="full" bg="rgba(255,255,255,0.5)" />
                    <Text color="white" fontWeight="700" fontSize="xs">My Subjects</Text>
                  </Box>
                  <Box p={3} bg="#f9f9fb">
                    {[["Mathematics", 88, "#206CE1"], ["Physics", 72, "#F18729"], ["Chemistry", 95, "#1FBA79"], ["Biology", 61, "#AE3DD6"]].map(([s, p, c]) => (
                      <Box key={String(s)} bg="white" borderRadius="lg" p={2.5} mb={2}
                        boxShadow="0 1px 4px rgba(0,0,0,0.06)">
                        <Flex justify="space-between" mb={1.5}>
                          <Text fontSize="10px" fontWeight="600" color="#242E3E">{s}</Text>
                          <Text fontSize="10px" fontWeight="700" color={String(c)}>{p}%</Text>
                        </Flex>
                        <Box h="4px" bg="#f0f0f0" borderRadius="full">
                          <Box h="full" w={`${p}%`} bg={String(c)} borderRadius="full" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Phone 2 — center main */}
                <Box className="float-a" position="absolute" left="33%" top="20px" transform="translateX(-50%)"
                  w="220px" h="430px" bg="#111" borderRadius="40px"
                  boxShadow="0 60px 120px rgba(0,0,0,0.7)"
                  border="7px solid #1a1a1a" overflow="hidden" zIndex={3}>
                  <Box bg="linear-gradient(135deg,#F18729,#e06d1a)" h="72px"
                    display="flex" alignItems="center" px={4} gap={3}>
                    <Box w="32px" h="32px" borderRadius="full" bg="rgba(255,255,255,0.2)"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="14px">⚡</Text>
                    </Box>
                    <Box>
                      <Text color="white" fontWeight="800" fontSize="sm">Spark</Text>
                      <Text color="rgba(255,255,255,0.7)" fontSize="9px">AI Tutor · Online</Text>
                    </Box>
                  </Box>
                  <Box p={3} flex={1} display="flex" flexDirection="column" gap={2} bg="#fafaf8">
                    <Box bg="#f0f0fd" borderRadius="12px 12px 12px 4px" p={3}>
                      <Text fontSize="11px" color="#474256">What is Newton's 3rd Law?</Text>
                    </Box>
                    <Box bg="white" borderRadius="12px 12px 4px 12px" p={3}
                      alignSelf="flex-end" boxShadow="0 1px 4px rgba(0,0,0,0.06)" maxW="90%">
                      <Text fontSize="11px" color="#242E3E" lineHeight="1.6">
                        Great question! Think: when you push a wall, what does the wall do to you? 🤔
                      </Text>
                    </Box>
                    <Box bg="#f0f0fd" borderRadius="12px 12px 12px 4px" p={3}>
                      <Text fontSize="11px" color="#474256">It pushes back?</Text>
                    </Box>
                    <Box bg="white" borderRadius="12px 12px 4px 12px" p={3}
                      alignSelf="flex-end" boxShadow="0 1px 4px rgba(0,0,0,0.06)" maxW="90%">
                      <Text fontSize="11px" color="#242E3E" lineHeight="1.6">
                        Exactly! Equal force, opposite direction. That's the law ✅
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* Phone 3 — back right */}
                <Box className="float-b" position="absolute" right="0px" top="100px"
                  w="190px" h="360px" bg="#111" borderRadius="34px"
                  boxShadow="0 40px 80px rgba(0,0,0,0.5)"
                  border="6px solid #222" overflow="hidden" zIndex={1}>
                  <Box bg="#07052A" h="56px" display="flex" alignItems="center" px={4} gap={2}>
                    <Text color="white" fontWeight="700" fontSize="11px">Quiz · WAEC 2024</Text>
                  </Box>
                  <Box p={3} bg="#f9f9fb">
                    <Text fontSize="10px" fontWeight="600" color="#242E3E" mb={3} lineHeight="1.5">
                      What is the atomic number of Carbon?
                    </Text>
                    {[["4", false], ["6", true], ["8", false], ["12", false]].map(([opt, correct]) => (
                      <Box key={String(opt)} bg={correct ? "#EBF3FF" : "white"} border="1px solid"
                        borderColor={correct ? "#206CE1" : "#EBEBF7"}
                        borderRadius="lg" p={2} mb={1.5}
                        display="flex" alignItems="center" gap={2}>
                        <Box w="12px" h="12px" borderRadius="full" border="1.5px solid"
                          borderColor={correct ? "#206CE1" : "#BDBDBD"}
                          bg={correct ? "#206CE1" : "white"} flexShrink={0} />
                        <Text fontSize="10px" color={correct ? "#206CE1" : "#474256"}
                          fontWeight={correct ? "700" : "400"}>{opt}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Floating rating badge */}
                <Box position="absolute" bottom="30px" left="50%" transform="translateX(-50%)"
                  bg="white" borderRadius="2xl" px={5} py={3}
                  boxShadow="0 8px 32px rgba(0,0,0,0.15)"
                  border="1px solid #EBEBF7" zIndex={4} whiteSpace="nowrap">
                  <HStack gap={3}>
                    <Text fontSize="xl">⭐</Text>
                    <Box>
                      <Text fontWeight="800" fontSize="sm" color="#242E3E">4.9 / 5.0</Text>
                      <Text fontSize="10px" color="gray.400">10,000+ ratings</Text>
                    </Box>
                  </HStack>
                </Box>
              </Box>
            </Grid>

            {/* Diagonal clip */}
            <Box position="absolute" bottom="-2px" left={0} right={0} h="80px" bg="white"
              style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
          </Box>

          {/* ══════════════════════════════════════
              FEATURES
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="white">
            <Box textAlign="center" mb={14} maxW="580px" mx="auto">
              <HStack justify="center" mb={4} gap={2}>
                <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                <Text fontSize="xs" fontWeight="700" color="#F18729"
                  letterSpacing="0.12em" textTransform="uppercase">Built Different</Text>
                <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
              </HStack>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900"
                color="#07052A" letterSpacing="-0.02em" fontFamily="'Space Grotesk Variable', sans-serif">
                Everything a serious student needs.
              </Heading>
            </Box>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }}
              gap={5} maxW="1100px" mx="auto">
              {features.map((f) => (
                <Box key={f.title} className="feat-card" p={7} borderRadius="2xl"
                  bg={f.bg} border="1px solid #EBEBF7"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  position="relative" overflow="hidden">
                  <Box position="absolute" top="-16px" right="-16px" w="80px" h="80px"
                    borderRadius="full" bg={f.color} opacity={0.08} />
                  <Box w="48px" h="48px" borderRadius="xl" bg={f.color}
                    display="flex" alignItems="center" justifyContent="center" mb={5}>
                    <Icon boxSize={5} color="white">{f.icon}</Icon>
                  </Box>
                  <Text fontWeight="700" fontSize="md" color="#242E3E" mb={2}>{f.title}</Text>
                  <Text fontSize="sm" color="#474256" lineHeight="1.8">{f.desc}</Text>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              HOW TO START
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="#F9F9FB">
            <Box textAlign="center" mb={14} maxW="560px" mx="auto">
              <HStack justify="center" mb={4} gap={2}>
                <Box w="24px" h="2px" bg="#206CE1" borderRadius="full" />
                <Text fontSize="xs" fontWeight="700" color="#206CE1"
                  letterSpacing="0.12em" textTransform="uppercase">Getting Started</Text>
                <Box w="24px" h="2px" bg="#206CE1" borderRadius="full" />
              </HStack>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900"
                color="#07052A" letterSpacing="-0.02em" fontFamily="'Space Grotesk Variable', sans-serif">
                Up and scoring in 4 steps.
              </Heading>
            </Box>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(4,1fr)" }}
              gap={6} maxW="1100px" mx="auto" position="relative">
              <Box display={{ base: "none", lg: "block" }}
                position="absolute" top="28px" left="12.5%" right="12.5%"
                h="2px" bg="#EBEBF7" zIndex={0} />
              {steps.map((s) => (
                <Box key={s.num} textAlign="center" position="relative" zIndex={1}>
                  <Box w="56px" h="56px" borderRadius="full" mx="auto" mb={5}
                    bg={s.color} display="flex" alignItems="center" justifyContent="center"
                    boxShadow={`0 8px 24px ${s.color}44`}
                    border="4px solid white">
                    <Text color="white" fontWeight="900" fontSize="sm"
                      fontFamily="'Space Grotesk Variable', sans-serif">{s.num}</Text>
                  </Box>
                  <Text fontWeight="700" fontSize="md" color="#242E3E" mb={2}>{s.title}</Text>
                  <Text fontSize="sm" color="#474256" lineHeight="1.75">{s.desc}</Text>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              REVIEWS
          ══════════════════════════════════════ */}
          <Box py={{ base: 16, md: 24 }} px={{ base: 6, md: 12, lg: 20 }} bg="white">
            <Box textAlign="center" mb={12} maxW="560px" mx="auto">
              <HStack justify="center" mb={4} gap={2}>
                <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
                <Text fontSize="xs" fontWeight="700" color="#F18729"
                  letterSpacing="0.12em" textTransform="uppercase">Student Stories</Text>
                <Box w="24px" h="2px" bg="#F18729" borderRadius="full" />
              </HStack>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900"
                color="#07052A" letterSpacing="-0.02em" fontFamily="'Space Grotesk Variable', sans-serif">
                Real results. Real students.
              </Heading>
            </Box>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
              gap={6} maxW="1000px" mx="auto">
              {reviews.map((r) => (
                <Box key={r.name} className="review-card" p={7} bg="#F9F9FB"
                  borderRadius="2xl" border="1px solid #EBEBF7"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)">
                  <HStack gap={1} mb={4}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Text key={i} color="#F18729" fontSize="sm">★</Text>
                    ))}
                  </HStack>
                  <Text fontSize="sm" color="#474256" lineHeight="1.85" mb={5} fontStyle="italic">
                    "{r.text}"
                  </Text>
                  <HStack gap={3}>
                    <Box w="36px" h="36px" borderRadius="full" bg="#206CE1"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontSize="xs" fontWeight="800">
                        {r.name.charAt(0)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="sm" color="#242E3E">{r.name}</Text>
                      <Text fontSize="xs" color="#1FBA79" fontWeight="600">{r.score}</Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              BOTTOM CTA
          ══════════════════════════════════════ */}
          <Box bg="#07052A" py={{ base: 16, md: 24 }} px={{ base: 6, md: 12 }}
            textAlign="center" position="relative" overflow="hidden">
            <Box position="absolute" inset={0} opacity={0.04}
              backgroundImage="radial-gradient(circle, #fff 1.5px, transparent 1.5px)"
              backgroundSize="30px 30px" pointerEvents="none" />
            <Box position="absolute" top="-60px" right="-60px" w="400px" h="400px"
              borderRadius="full" bg="#F18729" opacity={0.07} filter="blur(80px)" pointerEvents="none" />
            <Box position="relative" zIndex={1} maxW="640px" mx="auto">
              <Heading color="white" fontSize={{ base: "2xl", md: "4xl" }} fontWeight="900"
                letterSpacing="-0.025em" mb={4} fontFamily="'Space Grotesk Variable', sans-serif">
                Download iGrades today.
                <Box as="span" color="#F18729"> It's free.</Box>
              </Heading>
              <Text color="rgba(255,255,255,0.45)" fontSize="md" mb={10}>
                No credit card. No catch. Just better grades.
              </Text>
              <Flex gap={4} justify="center" flexWrap="wrap">
                {platforms.map((p) => (
                  <Box key={p.name} className="pl-btn" as="button"
                    bg={p.bg} borderRadius="14px" px={5} py={3.5}
                    display="flex" alignItems="center" gap={3} cursor="pointer" border="none"
                    boxShadow={`0 4px 20px ${p.glow}`} minW="150px">
                    <Icon boxSize={5} color="white">{p.icon}</Icon>
                    <Box textAlign="left">
                      <Text color="rgba(255,255,255,0.6)" fontSize="9px" lineHeight={1} mb={0.5}
                        textTransform="uppercase" letterSpacing="0.08em">{p.label}</Text>
                      <Text color="white" fontWeight="700" fontSize="sm" lineHeight={1}>{p.name}</Text>
                    </Box>
                  </Box>
                ))}
              </Flex>
            </Box>
          </Box>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default DownloadPage;