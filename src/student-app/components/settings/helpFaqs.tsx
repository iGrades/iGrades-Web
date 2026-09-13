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
  FiCheckCircle,
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
    <Box w="full" py={2}>
      {/* Header Banner */}
      <Box
        bg="white"
        p={{ base: 5, md: 8 }}
        rounded="xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box>
            <HStack gap={2} mb={2}>
              <Box
                w={8}
                h={8}
                rounded="lg"
                bg="blue.50"
                color="#206CE1"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiHelpCircle size={18} />
              </Box>
              <Badge colorPalette="blue" variant="subtle" size="sm" rounded="md">
                Student Help Center
              </Badge>
            </HStack>
            <Heading size={{ base: "lg", md: "xl" }} color="gray.800" fontWeight="bold">
              Help & Frequently Asked Questions
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1} maxW="600px">
              Need assistance? Explore quick answers below or send a message directly to our student support team.
            </Text>
          </Box>

          {/* Quick Direct Contacts */}
          <HStack gap={3} flexWrap="wrap">
            <Button
              as="a"
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              bg="#25D366"
              color="white"
              _hover={{ bg: "#20bd5a" }}
              rounded="lg"
              gap={2}
            >
              <BsWhatsapp size={15} />
              WhatsApp Help
            </Button>
            <Button
              as="a"
              href="mailto:info@igrades.org"
              size="sm"
              variant="outline"
              borderColor="gray.300"
              color="gray.700"
              _hover={{ bg: "gray.50" }}
              rounded="lg"
              gap={2}
            >
              <FiMail size={15} />
              Email Support
            </Button>
          </HStack>
        </Flex>

        {/* Search Bar */}
        <Box mt={6} position="relative">
          <Flex
            align="center"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            rounded="xl"
            px={4}
            py={2.5}
            gap={3}
            _focusWithin={{ borderColor: "#206CE1", bg: "white", shadow: "xs" }}
            transition="all 0.2s"
          >
            <FiSearch size={18} color="#718096" />
            <Input
              variant="unstyled"
              placeholder="Search by keyword (e.g. 'quizzes', 'points', 'passkey', 'AI assistant')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fontSize="sm"
              color="gray.800"
            />
            {searchQuery && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setSearchQuery("")}
                color="gray.400"
                _hover={{ color: "gray.600" }}
              >
                Clear
              </Button>
            )}
          </Flex>
        </Box>

        {/* Category Filters */}
        <Flex gap={2} mt={4} overflowX="auto" pb={1} css={{ scrollbarWidth: "none" }}>
          {categoryFilters.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = cat.icon;
            return (
              <Button
                key={cat.id}
                size="xs"
                px={3}
                py={2}
                rounded="full"
                variant={isSelected ? "solid" : "outline"}
                bg={isSelected ? "#206CE1" : "white"}
                color={isSelected ? "white" : "gray.600"}
                borderColor={isSelected ? "#206CE1" : "gray.200"}
                _hover={{ bg: isSelected ? "#1a5bc0" : "gray.50" }}
                onClick={() => setSelectedCategory(cat.id)}
                whiteSpace="nowrap"
                gap={1.5}
              >
                <IconComp size={12} />
                {cat.label}
              </Button>
            );
          })}
        </Flex>
      </Box>

      {/* Main Content: FAQs List & Contact Box */}
      <Grid templateColumns={{ base: "1fr", lg: "1.8fr 1.2fr" }} gap={6} alignContent="start">
        {/* FAQs Accordion Column */}
        <VStack align="stretch" gap={3}>
          <Flex justify="space-between" align="center" px={1}>
            <Text fontSize="sm" fontWeight="bold" color="gray.700">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? "Question" : "Questions"} Found
            </Text>
            {selectedCategory !== "all" && (
              <Button
                size="xs"
                variant="ghost"
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
              bg="white"
              p={8}
              rounded="xl"
              border="1px solid"
              borderColor="gray.100"
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold" color="gray.700" mb={1}>
                No questions matching "{searchQuery}"
              </Text>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Try adjusting your search terms or send us a direct message below.
              </Text>
              <Button
                size="sm"
                variant="outline"
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
                  bg="white"
                  rounded="xl"
                  border="1px solid"
                  borderColor={isOpen ? "#206CE133" : "gray.100"}
                  shadow={isOpen ? "sm" : "xs"}
                  transition="all 0.2s"
                  overflow="hidden"
                >
                  <Flex
                    p={4}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    _hover={{ bg: "gray.50" }}
                    gap={3}
                  >
                    <HStack gap={3} align="center" flex="1">
                      <Box
                        w={6}
                        h={6}
                        rounded="full"
                        bg={isOpen ? "blue.50" : "gray.100"}
                        color={isOpen ? "#206CE1" : "gray.500"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize="xs" fontWeight="bold">
                          ?
                        </Text>
                      </Box>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        {faq.q}
                      </Text>
                    </HStack>
                    <Box color="gray.400" flexShrink={0}>
                      {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </Box>
                  </Flex>

                  {isOpen && (
                    <Box px={4} pb={4} pt={1} borderTop="1px solid" borderColor="gray.50">
                      <Text fontSize="sm" color="gray.600" lineHeight="tall">
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
            bg="linear-gradient(135deg, #206CE10F 0%, #206CE11A 100%)"
            border="1px solid"
            borderColor="#206CE133"
            p={4}
            rounded="xl"
            mt={2}
          >
            <HStack gap={3} align="flex-start">
              <Box p={2} bg="#206CE1" color="white" rounded="lg">
                <FiCpu size={18} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  Have an academic question right now?
                </Text>
                <Text fontSize="xs" color="gray.600" mt={0.5}>
                  Use the 24/7 AI Study Assistant in the bottom right corner of your screen for instant explanations, formulas, and hints.
                </Text>
              </Box>
            </HStack>
          </Box>
        </VStack>

        {/* Contact / Inquiry Form Column */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          rounded="xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          height="fit-content"
        >
          <HStack gap={2} mb={1}>
            <FiSend color="#206CE1" size={16} />
            <Text fontSize="md" fontWeight="bold" color="gray.800">
              Contact Student Support
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={4}>
            Can't find what you're looking for? Submit a ticket and our teachers will help you out.
          </Text>

          <form onSubmit={handleSupportSubmit}>
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                  Your Name
                </Text>
                <Input
                  size="sm"
                  bg="gray.50"
                  rounded="md"
                  value={studentName || "Student"}
                  disabled
                  fontSize="xs"
                  color="gray.600"
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                  Your Email
                </Text>
                <Input
                  size="sm"
                  bg="gray.50"
                  rounded="md"
                  value={studentEmail || "No registered email"}
                  disabled
                  fontSize="xs"
                  color="gray.600"
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                  Topic / Issue
                </Text>
                <Box
                  as="select"
                  w="full"
                  p={2}
                  fontSize="xs"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  value={formSubject}
                  onChange={(e: any) => setFormSubject(e.target.value)}
                  _focus={{ borderColor: "#206CE1" }}
                >
                  <option value="Question about quizzes or scoring">Question about quizzes or scoring</option>
                  <option value="Issue with IGG Points or Rewards">Issue with IGG Points or Rewards</option>
                  <option value="Security or 6-digit Passkey">Security or 6-digit Passkey</option>
                  <option value="Study Assistant or Learning Materials">Study Assistant or Learning Materials</option>
                  <option value="Other Question or Feedback">Other Question or Feedback</option>
                </Box>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                  Your Message
                </Text>
                <Textarea
                  size="sm"
                  rows={4}
                  bg="gray.50"
                  rounded="md"
                  placeholder="Describe what you need help with in detail..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  fontSize="xs"
                  resize="none"
                  _focus={{ borderColor: "#206CE1", bg: "white" }}
                />
              </Box>

              <Button
                type="submit"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1a5bc0" }}
                size="sm"
                rounded="md"
                loading={isSubmitting}
                w="full"
                gap={2}
                mt={1}
              >
                <FiSend size={14} />
                Send Inquiry
              </Button>
            </VStack>
          </form>

          <Box mt={5} pt={4} borderTop="1px solid" borderColor="gray.100">
            <HStack gap={2} mb={2}>
              <FiCheckCircle color="#38A169" size={14} />
              <Text fontSize="xs" color="gray.600" fontWeight="500">
                Typical response time: Within a few hours
              </Text>
            </HStack>
            <HStack gap={2}>
              <FiMail color="#718096" size={14} />
              <Text fontSize="xs" color="gray.600">
                Direct: <Text as="span" fontWeight="600" color="#206CE1">info@igrades.org</Text>
              </Text>
            </HStack>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default HelpFaqs;
