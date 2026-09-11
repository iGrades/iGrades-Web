import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  HStack,
  VStack,
  Badge,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  LuSparkles,
  LuPresentation,
  LuBookOpenCheck,
  LuTrendingUp,
  LuWallet,
  LuArrowRight,
  LuClock,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import { FaGraduationCap, FaCircleCheck } from "react-icons/fa6";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";
import { toaster } from "@/components/ui/toaster";

const UPCOMING_FEATURES = [
  {
    icon: LuPresentation,
    title: "Live Interactive Classrooms",
    tag: "Virtual Sessions",
    color: "#206CE1",
    bg: "#EBF3FF",
    description:
      "Low-bandwidth optimized virtual video & whiteboard rooms designed for Nigerian internet networks. Host up to 100 students with zero lag.",
  },
  {
    icon: LuBookOpenCheck,
    title: "Accredited Exam Broadcaster",
    tag: "Assessment Engine",
    color: "#FD8B3A",
    bg: "#FFF4EC",
    description:
      "Instant access to over 25,000 verified WAEC, JAMB, and NECO past questions. Launch timed quizzes and receive instant auto-graded scorecards.",
  },
  {
    icon: LuTrendingUp,
    title: "Student Telemetry & Analytics",
    tag: "Parent Transparency",
    color: "#1FBA79",
    bg: "#EDFAF4",
    description:
      "Deep diagnostics showing which sub-topics each student struggles with. Automatically generate weekly PDF progress reports for parents.",
  },
  {
    icon: LuWallet,
    title: "Automated Tutor Payouts",
    tag: "Monetization",
    color: "#AE3DD6",
    bg: "#F9F0FD",
    description:
      "Set your own private tutoring rates or group class fees. Receive automated, verified direct bank deposits to your Nigerian bank account.",
  },
];

const FAQS = [
  {
    q: "When will the Instructor & Virtual Classroom portal launch?",
    a: "We are currently beta testing with select partner educators in Lagos, Abuja, and Port Harcourt. Public instructor onboarding will begin in Q3 2026.",
  },
  {
    q: "Can I bring my existing offline students onto iGrades?",
    a: "Yes! You can generate unique student access codes to invite your private tutees and organize them into dedicated class batches.",
  },
  {
    q: "How much will it cost for teachers or tutors?",
    a: "Joining the platform and setting up basic class cohorts will be free. Premium tutor analytics and high-volume live streaming tools will have affordable pay-as-you-teach tiers.",
  },
  {
    q: "Are the past questions compliant with current Nigerian syllabi?",
    a: "All questions and mock examinations are rigorously indexed against the latest WAEC, JAMB, NECO, and Cambridge IGCSE syllabi.",
  },
];

export default function UpcomingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("SSS (WAEC / JAMB)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const joined = localStorage.getItem("igrade_instructor_waitlist");
    if (joined) {
      setHasJoined(true);
    }
  }, []);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toaster.create({
        title: "Missing Information",
        description: "Please provide your full name and email address.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const waitlistEntry = {
        name,
        email,
        phone,
        subject,
        level,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("igrade_instructor_waitlist", JSON.stringify(waitlistEntry));
      setHasJoined(true);
      setIsSubmitting(false);
      toaster.create({
        title: "Waitlist Confirmed!",
        description: "You've been added to our VIP Instructor Early Access program.",
        type: "success",
      });
    }, 800);
  };

  return (
    <Box bg="#F8FAFC" minH="100vh" display="flex" flexDirection="column">
      <NavBar />

      {/* Hero Section */}
      <Box
        pt={{ base: 12, md: 16 }}
        pb={{ base: 16, md: 24 }}
        px={{ base: 4, md: 8, lg: 16 }}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="relative"
        overflow="hidden"
      >
        {/* Subtle decorative background gradient */}
        <Box
          position="absolute"
          top="-10%"
          right="-5%"
          w={{ base: "300px", md: "500px" }}
          h={{ base: "300px", md: "500px" }}
          borderRadius="full"
          bg="radial-gradient(circle, rgba(32,108,225,0.08) 0%, rgba(253,139,58,0.04) 50%, transparent 70%)"
          pointerEvents="none"
        />

        <Box maxW="900px" mx="auto" textAlign="center" position="relative" zIndex={1}>
          <HStack justify="center" gap={2} mb={4}>
            <Badge
              bg="#FFF4EC"
              color="#FD8B3A"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              border="1px solid"
              borderColor="orange.200"
            >
              <Icon as={LuSparkles} />
              Upcoming Feature • Instructor Portal
            </Badge>
            <Badge
              bg="#EBF3FF"
              color="#206CE1"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              border="1px solid"
              borderColor="blue.200"
            >
              Launching Soon
            </Badge>
          </HStack>

          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="800"
            color="#0F172A"
            lineHeight="1.2"
            mb={6}
          >
            Start a Class & Teach with{" "}
            <Text as="span" color="#206CE1">
              Virtual Precision
            </Text>
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="#475569"
            maxW="720px"
            mx="auto"
            lineHeight="1.7"
            mb={8}
          >
            We are building Nigeria's premier virtual classroom and tutoring engine.
            Instructors, tutors, and schools will be able to schedule live interactive
            classes, assign accredited WAEC & JAMB drills, monitor topic mastery, and
            automate earnings.
          </Text>

          {/* Quick Dual CTAs */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="center"
            align="center"
            gap={4}
          >
            <Button
              as="a"
              href="#waitlist"
              bg="#206CE1"
              color="white"
              size="lg"
              px={8}
              py={6}
              borderRadius="full"
              fontWeight="700"
              fontSize="sm"
              _hover={{ bg: "#1755B8", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              boxShadow="0 4px 14px rgba(32,108,225,0.3)"
            >
              Join Instructor Waitlist <Icon as={LuArrowRight} ml={2} />
            </Button>

            <Button
              onClick={() => navigate("/student-login")}
              variant="outline"
              borderColor="gray.300"
              bg="white"
              color="#1E293B"
              size="lg"
              px={8}
              py={6}
              borderRadius="full"
              fontWeight="700"
              fontSize="sm"
              _hover={{ bg: "gray.50", borderColor: "gray.400" }}
              transition="all 0.2s"
            >
              <Icon as={FaGraduationCap} mr={2} color="#FD8B3A" />
              Student? Enter Access Code
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Feature Preview Grid */}
      <Box maxW="1150px" mx="auto" px={{ base: 4, md: 8 }} py={16} w="full">
        <Box textAlign="center" mb={12}>
          <Text color="#FD8B3A" fontWeight="700" fontSize="xs" letterSpacing="widest" textTransform="uppercase" mb={2}>
            What to Expect
          </Text>
          <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="#0F172A">
            Built for Serious Educators & Ambitious Students
          </Heading>
          <Text color="#64748B" fontSize="sm" mt={2} maxW="600px" mx="auto">
            Everything you need to deliver high-impact virtual instruction without juggling multiple disjointed tools.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          {UPCOMING_FEATURES.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Box
                key={feat.title}
                bg="white"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="0 4px 16px rgba(0,0,0,0.03)"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
              >
                <Box>
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="xl"
                    bg={feat.bg}
                    align="center"
                    justify="center"
                    mb={4}
                  >
                    <Icon as={IconComp} color={feat.color} boxSize="24px" />
                  </Flex>
                  <Badge
                    bg="gray.100"
                    color="gray.700"
                    fontSize="10px"
                    fontWeight="700"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    mb={2}
                  >
                    {feat.tag}
                  </Badge>
                  <Heading as="h3" fontSize="md" fontWeight="700" color="#0F172A" mb={2}>
                    {feat.title}
                  </Heading>
                  <Text fontSize="xs" color="#64748B" lineHeight="1.6">
                    {feat.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Waitlist Form Section */}
      <Box
        id="waitlist"
        bg="white"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="gray.200"
        py={16}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="700px" mx="auto">
          <Box
            bg="#F8FAFC"
            p={{ base: 6, md: 10 }}
            borderRadius="3xl"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="0 8px 30px rgba(0,0,0,0.04)"
          >
            {hasJoined ? (
              <Box textAlign="center" py={6}>
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg="#EDFAF4"
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={4}
                >
                  <Icon as={FaCircleCheck} color="#1FBA79" boxSize="32px" />
                </Flex>
                <Heading as="h3" fontSize="xl" fontWeight="800" color="#0F172A" mb={2}>
                  You're on the VIP Waitlist!
                </Heading>
                <Text fontSize="sm" color="#475569" maxW="460px" mx="auto" mb={6}>
                  Thank you for registering early interest. We'll send your private invite code,
                  onboarding perks, and platform access as soon as beta seats open.
                </Text>
                <HStack justify="center" gap={3}>
                  <Button
                    onClick={() => {
                      localStorage.removeItem("igrade_instructor_waitlist");
                      setHasJoined(false);
                    }}
                    variant="outline"
                    size="sm"
                    borderRadius="full"
                    color="gray.600"
                  >
                    Submit Another Inquiry
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/"
                    size="sm"
                    bg="#206CE1"
                    color="white"
                    borderRadius="full"
                  >
                    Return to Homepage
                  </Button>
                </HStack>
              </Box>
            ) : (
              <form onSubmit={handleWaitlistSubmit}>
                <Box textAlign="center" mb={8}>
                  <Badge
                    bg="#EBF3FF"
                    color="#206CE1"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="700"
                    mb={3}
                  >
                    VIP Instructor Cohort
                  </Badge>
                  <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color="#0F172A" mb={2}>
                    Join the Instructor Early Access List
                  </Heading>
                  <Text fontSize="xs" color="#64748B">
                    Get free beta access, dedicated concierge onboarding, and early verification perks.
                  </Text>
                </Box>

                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                      Full Name *
                    </Text>
                    <Input
                      type="text"
                      placeholder="e.g. Dr. Adebayo Ogunlesi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      bg="white"
                      borderRadius="xl"
                      borderColor="gray.200"
                      fontSize="sm"
                      h="11"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                      Email Address *
                    </Text>
                    <Input
                      type="email"
                      placeholder="adebayo@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      bg="white"
                      borderRadius="xl"
                      borderColor="gray.200"
                      fontSize="sm"
                      h="11"
                    />
                  </Box>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                        Phone / WhatsApp (Optional)
                      </Text>
                      <Input
                        type="tel"
                        placeholder="0801 234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        bg="white"
                        borderRadius="xl"
                        borderColor="gray.200"
                        fontSize="sm"
                        h="11"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                        Primary Subject
                      </Text>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={{
                          width: "100%",
                          height: "44px",
                          backgroundColor: "white",
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          padding: "0 12px",
                          fontSize: "14px",
                          color: "#1E293B",
                          outline: "none",
                        }}
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="English Language">English Language</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="Economics">Economics</option>
                        <option value="Government">Government</option>
                        <option value="Literature in English">Literature in English</option>
                        <option value="Commerce & Accounting">Commerce & Accounting</option>
                        <option value="Other">Other Subjects</option>
                      </select>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#334155" mb={1.5}>
                      Target Student Level
                    </Text>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      style={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        padding: "0 12px",
                        fontSize: "14px",
                        color: "#1E293B",
                        outline: "none",
                      }}
                    >
                      <option value="SSS (WAEC / JAMB / NECO)">Senior Secondary (WAEC, JAMB, NECO)</option>
                      <option value="JSS (BECE / Junior Secondary)">Junior Secondary (BECE)</option>
                      <option value="Cambridge / IGCSE / A-Levels">Cambridge / IGCSE / A-Levels</option>
                      <option value="Primary School Level">Primary School Foundation</option>
                    </select>
                  </Box>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    loadingText="Reserving Spot..."
                    bg="#206CE1"
                    color="white"
                    size="lg"
                    borderRadius="xl"
                    fontWeight="700"
                    fontSize="sm"
                    mt={2}
                    _hover={{ bg: "#1755B8" }}
                    boxShadow="0 4px 14px rgba(32,108,225,0.25)"
                  >
                    Request Early Access Spot
                  </Button>

                  <HStack justify="center" gap={4} mt={2}>
                    <Text fontSize="11px" color="gray.400" display="flex" alignItems="center" gap={1}>
                      <Icon as={LuShieldCheck} color="green.500" />
                      100% Free early onboarding
                    </Text>
                    <Text fontSize="11px" color="gray.400" display="flex" alignItems="center" gap={1}>
                      <Icon as={LuClock} color="blue.500" />
                      Priority notification
                    </Text>
                  </HStack>
                </VStack>
              </form>
            )}
          </Box>
        </Box>
      </Box>

      {/* Timeline Section */}
      <Box py={16} px={{ base: 4, md: 8 }} maxW="860px" mx="auto" w="full">
        <Heading as="h3" fontSize="xl" fontWeight="800" color="#0F172A" textAlign="center" mb={10}>
          Rollout Roadmap
        </Heading>

        <VStack gap={4} align="stretch">
          <Flex
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="green.200"
            align="center"
            justify="space-between"
          >
            <HStack gap={4}>
              <Flex w="36px" h="36px" borderRadius="full" bg="#EDFAF4" align="center" justify="center">
                <Icon as={FaCircleCheck} color="#1FBA79" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="#0F172A">
                  Phase 1: Architecture & Question Engine
                </Text>
                <Text fontSize="xs" color="#64748B">
                  Core 25k+ WAEC and JAMB past questions cataloged and verified with interactive quizzes.
                </Text>
              </Box>
            </HStack>
            <Badge bg="#EDFAF4" color="#1FBA79" borderRadius="full" px={2.5} py={1} fontSize="11px" fontWeight="700">
              Completed
            </Badge>
          </Flex>

          <Flex
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="blue.300"
            align="center"
            justify="space-between"
            boxShadow="0 4px 14px rgba(32,108,225,0.06)"
          >
            <HStack gap={4}>
              <Flex w="36px" h="36px" borderRadius="full" bg="#EBF3FF" align="center" justify="center">
                <Icon as={LuClock} color="#206CE1" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="#0F172A">
                  Phase 2: Virtual Classroom & Batch Management
                </Text>
                <Text fontSize="xs" color="#64748B">
                  Real-time interactive session broadcaster, whiteboard canvas, and student roster access codes.
                </Text>
              </Box>
            </HStack>
            <Badge bg="#EBF3FF" color="#206CE1" borderRadius="full" px={2.5} py={1} fontSize="11px" fontWeight="700">
              In Progress
            </Badge>
          </Flex>

          <Flex
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            align="center"
            justify="space-between"
          >
            <HStack gap={4}>
              <Flex w="36px" h="36px" borderRadius="full" bg="gray.100" align="center" justify="center">
                <Icon as={LuUsers} color="gray.500" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="700" color="#64748B">
                  Phase 3: Public Beta & Tutor Monetization
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Open enrollment for verified Nigerian educators and direct automated bank payouts.
                </Text>
              </Box>
            </HStack>
            <Badge bg="gray.100" color="gray.500" borderRadius="full" px={2.5} py={1} fontSize="11px" fontWeight="700">
              Coming Q3 2026
            </Badge>
          </Flex>
        </VStack>
      </Box>

      {/* FAQs */}
      <Box bg="white" borderTop="1px solid" borderColor="gray.200" py={16} px={{ base: 4, md: 8 }}>
        <Box maxW="800px" mx="auto">
          <Heading as="h3" fontSize="xl" fontWeight="800" color="#0F172A" textAlign="center" mb={8}>
            Frequently Asked Questions
          </Heading>

          <VStack gap={4} align="stretch">
            {FAQS.map((faq) => (
              <Box
                key={faq.q}
                p={5}
                borderRadius="xl"
                bg="#F8FAFC"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text fontSize="sm" fontWeight="700" color="#1E293B" mb={1.5}>
                  {faq.q}
                </Text>
                <Text fontSize="xs" color="#64748B" lineHeight="1.6">
                  {faq.a}
                </Text>
              </Box>
            ))}
          </VStack>

          {/* Student Access Banner */}
          <Box
            mt={12}
            p={6}
            borderRadius="2xl"
            bg="#FFF4EC"
            border="1px solid"
            borderColor="orange.200"
            textAlign="center"
          >
            <Heading as="h4" fontSize="md" fontWeight="800" color="#0F172A" mb={2}>
              Are you a student looking to enter your class access code?
            </Heading>
            <Text fontSize="xs" color="#64748B" mb={4} maxW="500px" mx="auto">
              If your teacher or parent gave you a 6-digit access passkey, proceed directly to the student login portal.
            </Text>
            <Button
              onClick={() => navigate("/student-login")}
              bg="#FD8B3A"
              color="white"
              size="md"
              borderRadius="full"
              fontWeight="700"
              fontSize="xs"
              _hover={{ bg: "#E57728" }}
            >
              Go to Student Login <Icon as={LuArrowRight} ml={1.5} />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
