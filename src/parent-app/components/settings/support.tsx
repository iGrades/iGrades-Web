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
    q: "How do subscriptions and payment work for parents?",
    a: "iGrades provides a generous free Basic tier allowing 1 connected child with basic score tracking and quiz history. Standard (₦15,000) unlocks up to 3 connected children, weekly learning digests, subject performance tracking, and progress trends. Premium (₦25,000) allows up to 5 children, advanced predictive exam readiness diagnostics, and printable executive reports. You can upgrade anytime in your Subscription settings.",
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
        p={{ base: 4, md: 5 }}
        borderRadius="xl"
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        mb={6}
      >
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3}>
          <Box maxW="600px">
            <HStack gap={1.5} mb={1}>
              <Box
                w={6}
                h={6}
                rounded="md"
                bg="blue.50"
                color="primaryColor"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <MdHelpOutline size={16} />
              </Box>
              <Badge colorPalette="blue" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="10px" fontWeight="semibold">
                Parent Support Desk
              </Badge>
              <HStack gap={1}>
                <Box w={1.5} h={1.5} rounded="full" bg="green.500" />
                <Text fontSize="10.5px" color="gray.500" fontWeight="medium">Team Online</Text>
              </HStack>
            </HStack>
            <Heading fontSize={{ base: "13px", sm: "14px" }} color="gray.800" fontWeight="bold">
              How can we help your family today?
            </Heading>
            <Text fontSize="11px" color="gray.600" mt={1} lineHeight="normal">
              Whether you need help with your child's curriculum, subscription, analytics, or login credentials, our academic support specialists are ready to assist.
            </Text>
          </Box>

          <Button
            asChild
            size="xs"
            h="28px"
            px={2.5}
            fontSize="11px"
            bg="#25D366"
            color="white"
            _hover={{ bg: "#20b859" }}
            borderRadius="md"
            fontWeight="bold"
            shadow="none"
          >
            <a href="https://wa.me/2347045422933" target="_blank" rel="noopener noreferrer">
              <HStack gap={1}>
                <BsWhatsapp size={13} />
                <Text>Chat on WhatsApp</Text>
              </HStack>
            </a>
          </Button>
        </Flex>
      </Box>

      {/* Support Channels Grid */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
        <Box
          p={4}
          bg="white"
          borderRadius="xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-1px)", shadow: "md" }}
        >
          <Flex align="center" gap={2.5} mb={2}>
            <Icon boxSize={8} p={2} bg="blue.50" color="blue.600" borderRadius="lg">
              <MdEmail size={16} />
            </Icon>
            <Box>
              <Text fontSize="10.5px" color="gray.500" fontWeight="semibold">Email Support</Text>
              <Text fontSize="12px" fontWeight="bold" color="gray.800">info@igrades.org</Text>
            </Box>
          </Flex>
          <Text fontSize="10.5px" color="gray.600" lineHeight="short">
            For general inquiries, billing, and progress certificate queries. Average response: under 24 hours.
          </Text>
        </Box>

        <Box
          p={4}
          bg="white"
          borderRadius="xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-1px)", shadow: "md" }}
        >
          <Flex align="center" gap={2.5} mb={2}>
            <Icon boxSize={8} p={2} bg="green.50" color="green.600" borderRadius="lg">
              <MdPhone size={16} />
            </Icon>
            <Box>
              <Text fontSize="10.5px" color="gray.500" fontWeight="semibold">Direct Line & WhatsApp</Text>
              <Text fontSize="12px" fontWeight="bold" color="gray.800">+234 704 542 2933</Text>
            </Box>
          </Flex>
          <Text fontSize="10.5px" color="gray.600" lineHeight="short">
            Available Monday – Saturday, 8:00 AM – 8:00 PM for urgent student access assistance.
          </Text>
        </Box>

        <Box
          p={4}
          bg="white"
          borderRadius="xl"
          border="1px"
          borderColor="gray.100"
          shadow="sm"
          transition="all 0.2s"
          _hover={{ transform: "translateY(-1px)", shadow: "md" }}
        >
          <Flex align="center" gap={2.5} mb={2}>
            <Icon boxSize={8} p={2} bg="purple.50" color="purple.600" borderRadius="lg">
              <MdLocationOn size={16} />
            </Icon>
            <Box>
              <Text fontSize="10.5px" color="gray.500" fontWeight="semibold">Head Office</Text>
              <Text fontSize="12px" fontWeight="bold" color="gray.800">Ibadan, Nigeria</Text>
            </Box>
          </Flex>
          <Text fontSize="10.5px" color="gray.600" lineHeight="short">
            No. 80, Road C, Alagbayun road, Akobo, Oyo State. Certified Nigerian Curriculum Hub.
          </Text>
        </Box>
      </Grid>

      {/* FAQs and Contact Form Dual Layout */}
      <Grid templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }} gap={6}>
        {/* FAQs */}
        <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
          <HStack gap={2} mb={2}>
            <Icon as={MdHelpOutline} color="primaryColor" boxSize={4} />
            <Heading fontSize={{ base: "13px", sm: "14px" }} fontWeight="bold" color="gray.800">
              Frequently Asked Questions for Parents
            </Heading>
          </HStack>
          <Text fontSize="11px" color="gray.500" mb={4}>
            Answers to common questions regarding student management, quiz grading, and account controls.
          </Text>

          <VStack gap={2} align="stretch">
            {parentFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <Box
                  key={idx}
                  p={3}
                  borderRadius="lg"
                  bg={isOpen ? "blue.50/50" : "textFieldColor"}
                  border="1px"
                  borderColor={isOpen ? "blue.200" : "transparent"}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <Flex justify="space-between" align="center" gap={2}>
                    <Text fontSize="11px" fontWeight="600" color={isOpen ? "primaryColor" : "gray.800"}>
                      {faq.q}
                    </Text>
                    <Text fontSize="13px" fontWeight="bold" color="gray.400" flexShrink={0}>
                      {isOpen ? "−" : "+"}
                    </Text>
                  </Flex>
                  {isOpen && (
                    <Text fontSize="11px" color="gray.600" mt={1.5} lineHeight="relaxed">
                      {faq.a}
                    </Text>
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* Contact Form */}
        <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
          <HStack gap={2} mb={2}>
            <Icon as={BsShieldCheck} color="green.500" boxSize={4} />
            <Heading fontSize={{ base: "13px", sm: "14px" }} fontWeight="bold" color="gray.800">
              Send Support Message
            </Heading>
          </HStack>
          <Text fontSize="11px" color="gray.500" mb={4}>
            Have an issue with your account? Fill out the details below and our team will get right on it.
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack gap={3}>
              <Box w="full">
                <Text fontSize="10.5px" fontWeight="semibold" color="gray.700" mb={1}>
                  Your Full Name
                </Text>
                <Input
                  placeholder="e.g. Mrs. Adebayo"
                  fontSize="11px"
                  h="36px"
                  px={3}
                  bg="textFieldColor"
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Box>

              <Box w="full">
                <Text fontSize="10.5px" fontWeight="semibold" color="gray.700" mb={1}>
                  Email Address
                </Text>
                <Input
                  type="email"
                  placeholder="e.g. adebayo@example.com"
                  fontSize="11px"
                  h="36px"
                  px={3}
                  bg="textFieldColor"
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Box>

              <Box w="full">
                <Text fontSize="10.5px" fontWeight="semibold" color="gray.700" mb={1}>
                  Message / Issue Description
                </Text>
                <Textarea
                  placeholder="Describe your inquiry or question in detail..."
                  fontSize="11px"
                  px={3}
                  py={2}
                  rows={3}
                  bg="textFieldColor"
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </Box>

              <Button
                type="submit"
                w="full"
                h="36px"
                bg="primaryColor"
                color="white"
                borderRadius="lg"
                fontSize="11px"
                fontWeight="bold"
                loading={loading}
                _hover={{ bg: "#1956b5" }}
              >
                <HStack gap={1.5}>
                  <Icon as={MdSend} boxSize={3.5} />
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
