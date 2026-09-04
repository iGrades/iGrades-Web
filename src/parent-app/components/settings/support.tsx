import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  Icon,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdEmail, MdPhone, MdLocationOn, MdHelpOutline, MdSend } from "react-icons/md";
import { BsWhatsapp, BsShieldCheck } from "react-icons/bs";
import { toaster } from "@/components/ui/toaster";

const parentFaqs = [
  {
    q: "How do I add and manage my children's accounts?",
    a: "You can add a child by navigating to the Students section or Parent Dashboard and clicking 'Add Child'. You'll assign their class, school, and create a 6-digit access passcode.",
  },
  {
    q: "How do I reset my child's passcode if forgotten?",
    a: "Go to the Students section, locate your child in the list, click the actions menu (⋮), and select 'Edit'. You can view or set a new 6-digit passcode anytime.",
  },
  {
    q: "How does the Parent Dashboard work?",
    a: "The dashboard automatically gathers your children's quiz scores, subject strengths, and study progress to provide clear guidance and helpful practice tips.",
  },
  {
    q: "How do subscriptions and payment work?",
    a: "iGrades offers flexible monthly and termly plans. You can upgrade any of your children's accounts directly from their dashboard settings or the subscription portal.",
  },
  {
    q: "Is my child's learning data secure and private?",
    a: "Yes. All assessment attempts, monitoring logs, and identity credentials are encrypted and isolated so that only verified parents and students have access.",
  },
];

const Support = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toaster.create({
        title: "All Fields Required",
        description: "Please enter your name, email, and message before submitting.",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate quick ticket dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      toaster.create({
        title: "Inquiry Sent!",
        description: "Our dedicated parent support team will get back to you within 24 hours.",
        type: "success",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toaster.create({
        title: "Submission Error",
        description: "Could not deliver your message right now. Please try via WhatsApp or email.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="full" pb={12}>
      {/* Top Banner */}
      <Box
        p={{ base: 5, md: 8 }}
        borderRadius="2xl"
        bgGradient="linear(to-r, #1E56B3, #206CE1)"
        color="white"
        mb={8}
        shadow="md"
      >
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
          <Box maxW="600px">
            <HStack gap={2} mb={2}>
              <Badge colorPalette="blue" variant="solid" bg="white/20" color="white" px={2.5} py={0.5} borderRadius="full" fontSize="11px">
                Parent Support Desk
              </Badge>
              <HStack gap={1}>
                <Box w={2} h={2} rounded="full" bg="green.400" />
                <Text fontSize="xs" color="blue.100" fontWeight="medium">Team Online</Text>
              </HStack>
            </HStack>
            <Heading size={{ base: "lg", md: "xl" }} color="white" fontWeight="extrabold">
              How can we help your family today?
            </Heading>
            <Text fontSize="sm" color="blue.100" mt={2} lineHeight="tall">
              Whether you need help with your child's curriculum, subscription, analytics, or login credentials, our academic support specialists are ready to assist.
            </Text>
          </Box>

          <Button
            asChild
            size="lg"
            bg="#25D366"
            color="white"
            _hover={{ bg: "#20b859", transform: "translateY(-2px)" }}
            borderRadius="xl"
            fontWeight="bold"
            shadow="lg"
          >
            <a href="https://wa.me/2347045422933" target="_blank" rel="noopener noreferrer">
              <HStack gap={2}>
                <BsWhatsapp size={20} />
                <Text>Chat on WhatsApp</Text>
              </HStack>
            </a>
          </Button>
        </Flex>
      </Box>

      {/* Support Channels Grid */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5} mb={8}>
        <Box
          p={5}
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
        >
          <Flex align="center" gap={3} mb={3}>
            <Icon boxSize={10} p={2.5} bg="blue.50" color="blue.600" borderRadius="xl">
              <MdEmail size={22} />
            </Icon>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="semibold">Email Support</Text>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">hello@igrades.ng</Text>
            </Box>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            For general inquiries, billing, and progress certificate queries. Average response time: under 24 hours.
          </Text>
        </Box>

        <Box
          p={5}
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
        >
          <Flex align="center" gap={3} mb={3}>
            <Icon boxSize={10} p={2.5} bg="green.50" color="green.600" borderRadius="xl">
              <MdPhone size={22} />
            </Icon>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="semibold">Direct Line & WhatsApp</Text>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">+234 704 542 2933</Text>
            </Box>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            Available Monday – Saturday, 8:00 AM – 8:00 PM for urgent student access assistance.
          </Text>
        </Box>

        <Box
          p={5}
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
        >
          <Flex align="center" gap={3} mb={3}>
            <Icon boxSize={10} p={2.5} bg="purple.50" color="purple.600" borderRadius="xl">
              <MdLocationOn size={22} />
            </Icon>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="semibold">Head Office</Text>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">Ibadan, Nigeria</Text>
            </Box>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            No. 80, Road C, Alagbayun road, Akobo, Oyo State. Certified Nigerian Curriculum Hub.
          </Text>
        </Box>
      </Grid>

      {/* FAQs and Contact Form Dual Layout */}
      <Grid templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }} gap={8}>
        {/* FAQs */}
        <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
          <HStack gap={2} mb={4}>
            <Icon as={MdHelpOutline} color="primaryColor" boxSize={5} />
            <Heading size="md" color="gray.800">
              Frequently Asked Questions for Parents
            </Heading>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={5}>
            Answers to common questions regarding student management, quiz grading, and account controls.
          </Text>

          <VStack gap={3} align="stretch">
            {parentFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <Box
                  key={idx}
                  p={4}
                  borderRadius="xl"
                  bg={isOpen ? "blue.50/50" : "textFieldColor"}
                  border="1px"
                  borderColor={isOpen ? "blue.200" : "transparent"}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="bold" color={isOpen ? "primaryColor" : "gray.800"}>
                      {faq.q}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="gray.400">
                      {isOpen ? "−" : "+"}
                    </Text>
                  </Flex>
                  {isOpen && (
                    <Text fontSize="xs" color="gray.600" mt={2} lineHeight="relaxed">
                      {faq.a}
                    </Text>
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* Contact Form */}
        <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
          <HStack gap={2} mb={4}>
            <Icon as={BsShieldCheck} color="green.500" boxSize={5} />
            <Heading size="md" color="gray.800">
              Send Support Message
            </Heading>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={5}>
            Have an issue with your account? Fill out the details below and our team will get right on it.
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <Box w="full">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                  Your Full Name
                </Text>
                <Input
                  placeholder="e.g. Mrs. Adebayo"
                  fontSize="xs"
                  p={4}
                  bg="textFieldColor"
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Box>

              <Box w="full">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                  Email Address
                </Text>
                <Input
                  type="email"
                  placeholder="e.g. adebayo@example.com"
                  fontSize="xs"
                  p={4}
                  bg="textFieldColor"
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Box>

              <Box w="full">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                  Message / Issue Description
                </Text>
                <Textarea
                  placeholder="Describe your inquiry or question in detail..."
                  fontSize="xs"
                  p={4}
                  rows={4}
                  bg="textFieldColor"
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </Box>

              <Button
                type="submit"
                w="full"
                h="48px"
                bg="primaryColor"
                color="white"
                borderRadius="xl"
                fontSize="sm"
                fontWeight="bold"
                loading={loading}
                _hover={{ bg: "#1956b5", transform: "translateY(-1px)" }}
              >
                <HStack gap={2}>
                  <Icon as={MdSend} />
                  <Text>Submit Inquiry</Text>
                </HStack>
              </Button>
            </VStack>
          </form>
        </Box>
      </Grid>
    </Box>
  );
};

export default Support;
