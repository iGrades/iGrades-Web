import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FiSearch,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiBookOpen,
  FiAward,
  FiShield,
  FiCpu,
  FiMail,
} from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";
import { toaster } from "@/components/ui/toaster";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";

interface StudentFaq {
  category: "quizzes" | "rewards" | "security" | "learning" | "general";
  q: string;
  a: string;
}

const studentFaqs: StudentFaq[] = [
  {
    category: "quizzes",
    q: "How do I start and take quizzes on iGrades?",
    a: "Click on 'Quizzes' in the sidebar navigation or select a subject from your dashboard. Choose your preferred subject, topic, and difficulty level, then tap 'Start Quiz'. Each test has instant scoring and step-by-step solutions at the end.",
  },
  {
    category: "quizzes",
    q: "Can I review question explanations after completing a quiz?",
    a: "Yes! Once you submit a quiz, you will see a full score breakdown along with detailed explanations for every single question. You can review which options were right or wrong and understand the correct method.",
  },
  {
    category: "rewards",
    q: "What are IGG Points and how do I earn them?",
    a: "IGG Points are rewards you earn for completing quiz sessions, maintaining daily study streaks, and scoring above 80%. You can view your total points, global leaderboard standing, and unlocked badges in the 'IGG Points' tab.",
  },
  {
    category: "rewards",
    q: "How do study streaks work?",
    a: "Completing at least one practice quiz every 24 hours extends your daily streak. Higher streaks give you bonus points multipliers and unlock exclusive student achievement badges.",
  },
  {
    category: "security",
    q: "How do I view or change my 6-digit access passkey?",
    a: "Go to Settings > Security & Passkey. Here you can reveal your current 6-digit access code and update it anytime. Make sure to keep your passkey private so only you can access your practice progress.",
  },
  {
    category: "security",
    q: "What should I do if I forgot my passkey or cannot log in?",
    a: "Your linked parent or guardian can view or reset your student passcode directly from their Parent Dashboard under the 'Students' management tab.",
  },
  {
    category: "learning",
    q: "What is the AI Study Assistant and how can it help me?",
    a: "The AI Study Assistant is located at the bottom-right corner of your dashboard (outside active quizzes). You can ask it to explain difficult concepts, solve practice problems step-by-step, or generate study hints for WAEC, JAMB, BECE, or school exams.",
  },
  {
    category: "learning",
    q: "How do I download or access past question papers (PQs)?",
    a: "Visit the 'Learning' tab in your sidebar. Select 'Past Questions & Notes' to browse official syllabus topics, previous examination questions, and revision cheat sheets.",
  },
  {
    category: "general",
    q: "How do I update my subjects or class level?",
    a: "You can update your personal information under Settings > My Student Profile. To change enrolled subjects or curriculum grade level, you can also ask your parent/guardian to adjust your curriculum profile in their dashboard.",
  },
  {
    category: "general",
    q: "Can I use iGrades on my smartphone or tablet?",
    a: "Yes! iGrades is fully responsive and designed to work seamlessly on smartphones, tablets, laptops, and desktop computers.",
  },
];

const categoryFilters = [
  { id: "all", label: "All Questions", icon: FiHelpCircle },
  { id: "quizzes", label: "Quizzes & Tests", icon: FiBookOpen },
  { id: "rewards", label: "IGG Points & Badges", icon: FiAward },
  { id: "security", label: "Security & Passkey", icon: FiShield },
  { id: "learning", label: "AI & Learning", icon: FiCpu },
];

const HelpFaqs = () => {
  const { authdStudent } = useAuthdStudentData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Inquiry form state
  const studentEmail = authdStudent?.email || "";
  const studentName = `${authdStudent?.firstname || ""} ${authdStudent?.lastname || ""}`.trim();
  const [formSubject, setFormSubject] = useState("Question about quizzes or scoring");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = studentFaqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) {
      toaster.create({
        title: "Message Required",
        description: "Please enter your question or message before submitting.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormMessage("");
      toaster.create({
        title: "Inquiry Sent Successfully!",
        description:
          "Our academic support team has received your inquiry and will assist you shortly.",
        type: "success",
      });
    }, 800);
  };

  return (
    <Box w="100%" py={1} mb={10}>
      {/* Header Banner */}
      <Box
        bg="white"
        p={{ base: 4, sm: 6 }}
        border="none"
        outline="none"
        boxShadow="none"
        mb={5}
        w="100%"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box>
            <HStack gap={1.5} mb={1}>
              <Box
                w={5}
                h={5}
                rounded="md"
                bg="blue.50"
                color="#206CE1"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiHelpCircle size={13} />
              </Box>
              <Badge colorPalette="blue" variant="subtle" size="xs" fontSize="9px" px={1.5} py={0.5} rounded="md" border="none">
                Student Help Center
              </Badge>
            </HStack>
            <Heading fontSize={{ base: "13px", sm: "14px" }} color="gray.800" fontWeight="bold">
              Help & Frequently Asked Questions
            </Heading>
            <Text fontSize="11px" color="gray.500" mt={0.5} maxW="600px">
              Need assistance? Explore quick answers below or send a message directly to our student support team.
            </Text>
          </Box>

          {/* Quick Direct Contacts */}
          <HStack gap={1.5} flexWrap="wrap">
            <Button
              as="a"
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              h="26px"
              px={2}
              fontSize="11px"
              bg="#25D366"
              color="white"
              _hover={{ bg: "#20bd5a" }}
              rounded="md"
              border="none"
              outline="none"
              boxShadow="none"
              gap={1}
            >
              <BsWhatsapp size={12} />
              WhatsApp Help
            </Button>
            <Button
              as="a"
              href="mailto:info@igrades.org"
              size="xs"
              h="26px"
              px={2}
              fontSize="11px"
              bg="#F4F7FB"
              color="gray.700"
              _hover={{ bg: "#EDF2F7" }}
              rounded="md"
              border="none"
              outline="none"
              boxShadow="none"
              gap={1}
            >
              <FiMail size={12} />
              Email Support
            </Button>
          </HStack>
        </Flex>

        {/* Search Bar */}
        <Box mt={4} position="relative" w="100%">
          <Flex
            align="center"
            bg="#F4F7FB"
            border="none"
            outline="none"
            boxShadow="none"
            rounded="xl"
            px={4}
            py={2.5}
            gap={3}
            transition="all 0.2s"
          >
            <FiSearch size={14} color="#718096" />
            <Input
              variant="unstyled"
              placeholder="Search by keyword (e.g. 'quizzes', 'points', 'passkey')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fontSize="11px"
              color="gray.800"
              border="none"
              outline="none"
            />
            {searchQuery && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setSearchQuery("")}
                color="gray.400"
                _hover={{ color: "gray.600" }}
                fontSize="10px"
              >
                Clear
              </Button>
            )}
          </Flex>
        </Box>

        {/* Category Filters */}
        <Flex gap={1.5} mt={2.5} overflowX="auto" pb={1} css={{ scrollbarWidth: "none" }} w="100%">
          {categoryFilters.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = cat.icon;
            return (
              <Button
                key={cat.id}
                size="xs"
                px={2.5}
                py={1}
                fontSize="10px"
                rounded="full"
                border="none"
                outline="none"
                boxShadow="none"
                bg={isSelected ? "#206CE1" : "#F4F7FB"}
                color={isSelected ? "white" : "gray.600"}
                _hover={{ bg: isSelected ? "#1a5bc0" : "#EDF2F7" }}
                onClick={() => setSelectedCategory(cat.id)}
                whiteSpace="nowrap"
                gap={1}
              >
                <IconComp size={10} />
                {cat.label}
              </Button>
            );
          })}
        </Flex>
      </Box>

      {/* Main Content: FAQs List & Contact Box */}
      <Grid templateColumns={{ base: "1fr", lg: "1.8fr 1.2fr" }} gap={4} alignContent="start" w="100%">
        {/* FAQs Accordion Column */}
        <VStack align="stretch" gap={2} w="100%">
          <Flex justify="space-between" align="center" px={1}>
            <Text fontSize="11px" fontWeight="bold" color="gray.700">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? "Question" : "Questions"} Found
            </Text>
            {selectedCategory !== "all" && (
              <Button
                size="xs"
                variant="ghost"
                fontSize="10px"
                color="#206CE1"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            )}
          </Flex>

          {filteredFaqs.length === 0 ? (
            <Box
              bg="#F4F7FB"
              p={5}
              rounded="xl"
              border="none"
              outline="none"
              boxShadow="none"
              textAlign="center"
              w="100%"
            >
              <Text fontSize="12px" fontWeight="bold" color="gray.700" mb={1}>
                No questions matching "{searchQuery}"
              </Text>
              <Text fontSize="11px" color="gray.500" mb={2.5}>
                Try adjusting your search terms or send us a direct message below.
              </Text>
              <Button
                size="xs"
                fontSize="11px"
                bg="white"
                border="none"
                boxShadow="none"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                View all FAQs
              </Button>
            </Box>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <Box
                  key={index}
                  bg="#F4F7FB"
                  rounded="xl"
                  border="none"
                  outline="none"
                  boxShadow="none"
                  transition="all 0.15s"
                  overflow="hidden"
                  w="100%"
                >
                  <Flex
                    p={3}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    _hover={{ bg: "#EDF2F7" }}
                    gap={2}
                  >
                    <HStack gap={2} align="center" flex="1">
                      <Box
                        w={4.5}
                        h={4.5}
                        rounded="full"
                        bg={isOpen ? "blue.50" : "white"}
                        color={isOpen ? "#206CE1" : "gray.500"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize="9px" fontWeight="bold">
                          ?
                        </Text>
                      </Box>
                      <Text fontSize={{ base: "11px", sm: "12px" }} fontWeight="600" color="gray.800" lineHeight="short">
                        {faq.q}
                      </Text>
                    </HStack>
                    <Box color="gray.400" flexShrink={0}>
                      {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </Box>
                  </Flex>

                  {isOpen && (
                    <Box px={3} pb={3} pt={0.5} borderTop="1px solid" borderColor="gray.50">
                      <Text fontSize="11px" color="gray.600" lineHeight="1.5">
                        {faq.a}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })
          )}

          {/* Quick AI Tutor Reminder Banner */}
          <Box
            bg="#EFF6FF"
            border="none"
            outline="none"
            boxShadow="none"
            p={3}
            rounded="xl"
            mt={0.5}
          >
            <HStack gap={2} align="flex-start">
              <Box p={1} bg="#206CE1" color="white" rounded="md">
                <FiCpu size={13} />
              </Box>
              <Box>
                <Text fontSize="11px" fontWeight="bold" color="gray.800">
                  Have an academic question right now?
                </Text>
                <Text fontSize="10.5px" color="gray.600" mt={0.5} lineHeight="short">
                  Use the 24/7 AI Study Assistant in the bottom right corner of your screen for instant explanations, formulas, and hints.
                </Text>
              </Box>
            </HStack>
          </Box>
        </VStack>

        {/* Contact / Inquiry Form Column */}
        <Box
          bg="#F4F7FB"
          p={{ base: 3.5, md: 4 }}
          rounded="xl"
          border="none"
          outline="none"
          boxShadow="none"
          height="fit-content"
          w="100%"
        >
          <HStack gap={1.5} mb={1}>
            <FiSend color="#206CE1" size={13} />
            <Text fontSize="12px" fontWeight="bold" color="gray.800">
              Ask Student Support
            </Text>
          </HStack>
          <Text fontSize="10.5px" color="gray.500" mb={3} lineHeight="short">
            Can't find your answer? Drop your question below and our academic support desk will assist you.
          </Text>

          <form onSubmit={handleSupportSubmit}>
            <VStack gap={2.5} align="stretch">
              <Box>
                <Text fontSize="10.5px" fontWeight="600" color="gray.700" mb={1}>
                  Your Name
                </Text>
                <Input
                  fontSize="11px"
                  bg="white"
                  border="none"
                  outline="none"
                  rounded="lg"
                  h="32px"
                  value={studentName || "Student"}
                  disabled
                  color="gray.600"
                />
              </Box>

              <Box>
                <Text fontSize="10.5px" fontWeight="600" color="gray.700" mb={1}>
                  Email Address
                </Text>
                <Input
                  fontSize="11px"
                  bg="white"
                  border="none"
                  outline="none"
                  rounded="lg"
                  h="32px"
                  value={studentEmail || "student@example.com"}
                  disabled
                  color="gray.600"
                />
              </Box>

              <Box>
                <Text fontSize="10.5px" fontWeight="600" color="gray.700" mb={1}>
                  Topic Category
                </Text>
                <Input
                  fontSize="11px"
                  bg="white"
                  border="none"
                  outline="none"
                  rounded="lg"
                  h="32px"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="10.5px" fontWeight="600" color="gray.700" mb={1}>
                  Describe Your Question
                </Text>
                <Textarea
                  fontSize="11px"
                  bg="white"
                  border="none"
                  outline="none"
                  rounded="lg"
                  rows={3}
                  placeholder="Type your question or issue in detail..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                />
              </Box>

              <Button
                type="submit"
                size="xs"
                h="32px"
                fontSize="11px"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1a5bc0" }}
                rounded="lg"
                border="none"
                loading={isSubmitting}
                loadingText="Sending..."
                mt={1}
              >
                Send Message
              </Button>
            </VStack>
          </form>
        </Box>
      </Grid>
    </Box>
  );
};

export default HelpFaqs;
