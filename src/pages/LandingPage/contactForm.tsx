import { Box, Flex, VStack, Heading, Text, Grid, Input, Textarea, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { MdCheckCircle, MdSend } from "react-icons/md";

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const ContactForm = () => {
  
  const WEB3FORMS_ACCESS_KEY = "585caeb5-766f-456f-9069-ce1456b78525";

  const topics = ["General Inquiry", "Technical Support", "Billing", "Feedback"];

  const [form, setForm] = useState<FormState>({ name: "", email: "", topic: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Basic structural validation fallback check
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: form.name,
          email: form.email,
          subject: `iGrades Contact: ${form.topic}`, 
          message: form.message,
          from_name: "iGrades Landing Page Form",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        alert(result.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Web3Forms submission error:", error);
      alert("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      boxShadow="0 4px 24px rgba(0,0,0,0.07)"
      border="1px solid #EBEBF7"
    >
      {submitted ? (
        <VStack gap={5} py={12} textAlign="center" className="success-in">
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg="#EBF3FF"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon boxSize={10} color="#206CE1">
              <MdCheckCircle />
            </Icon>
          </Box>
          <Heading
            fontSize="xl"
            fontWeight="900"
            color="#07052A"
            fontFamily="'Lexend', sans-serif"
          >
            Message sent!
          </Heading>
          <Text color="#474256" fontSize="md" lineHeight="1.85" maxW="380px">
            Thanks <strong>{form.name}</strong> — we'll get back to you at <strong>{form.email}</strong> within 24 hours.
          </Text>
          <Box
            as="button"
            bg="#206CE1"
            color="white"
            px={7}
            py={3.5}
            borderRadius="xl"
            fontWeight="700"
            fontSize="sm"
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", topic: "General Inquiry", message: "" });
            }}
            cursor="pointer"
            border="none"
            boxShadow="0 4px 16px rgba(32,108,225,0.3)"
          >
            Send another
          </Box>
        </VStack>
      ) : (
        <VStack gap={6} align="stretch">
          <Box>
            <Heading
              fontSize="xl"
              fontWeight="900"
              color="#07052A"
              mb={1}
              fontFamily="'Lexend', sans-serif"
            >
              Send us a message
            </Heading>
            <Text fontSize="sm" color="#BDBDBD">
              We read every message and respond within 24 hours.
            </Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            {[
              { field: "name", label: "Full Name", placeholder: "e.g. Chidi Okafor", type: "text" },
              { field: "email", label: "Email Address", placeholder: "you@example.com", type: "email" },
            ].map(({ field, label, placeholder, type }) => (
              <Box key={field}>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="#474256"
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  mb={1.5}
                >
                  {label}
                </Text>
                <Input
                  placeholder={placeholder}
                  type={type}
                  value={form[field as keyof FormState]}
                  onChange={(e) => handleChange(field as keyof FormState, e.target.value)}
                  bg="#F9F9FB"
                  border="1.5px solid #EBEBF7"
                  borderRadius="xl"
                  _focus={{
                    borderColor: "#206CE1",
                    bg: "white",
                    boxShadow: "0 0 0 3px rgba(32,108,225,0.1)",
                  }}
                  _hover={{ borderColor: "#BDBDBD" }}
                  transition="all .15s"
                  fontSize="sm"
                  px={4}
                  h={12}
                />
              </Box>
            ))}
          </Grid>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="#474256"
              textTransform="uppercase"
              letterSpacing="0.06em"
              mb={2}
            >
              Topic
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {topics.map((t) => (
                <Box
                  key={t}
                  className="topic-pill"
                  as="button"
                  px={3.5}
                  py={1.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                  border="1.5px solid"
                  borderColor={form.topic === t ? "#206CE1" : "#EBEBF7"}
                  bg={form.topic === t ? "#EBF3FF" : "white"}
                  color={form.topic === t ? "#206CE1" : "#474256"}
                  cursor="pointer"
                  onClick={() => handleChange("topic", t)}
                >
                  {t}
                </Box>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="#474256"
              textTransform="uppercase"
              letterSpacing="0.06em"
              mb={1.5}
            >
              Message
            </Text>
            <Textarea
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={5}
              resize="none"
              variant="subtle"
              bg="#F9F9FB"
              border="1.5px solid #EBEBF7"
              borderRadius="xl"
              _focus={{
                borderColor: "#206CE1",
                bg: "white",
                boxShadow: "0 0 0 3px rgba(32,108,225,0.1)",
              }}
              _hover={{ borderColor: "#BDBDBD" }}
              transition="all .15s"
              fontSize="sm"
              px={4}
              pt={3}
            />
          </Box>

          <Box
            as="button"
            className="submit-btn"
            bg={!form.name || !form.email || !form.message ? "#EBEBF7" : "#206CE1"}
            color={!form.name || !form.email || !form.message ? "#BDBDBD" : "white"}
            px={6}
            py={4}
            borderRadius="xl"
            fontWeight="700"
            fontSize="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            cursor={loading || !form.name || !form.email || !form.message ? "not-allowed" : "pointer"}
            border="none"
            boxShadow={!form.name || !form.email || !form.message ? "none" : "0 4px 20px rgba(32,108,225,0.3)"}
            onClick={!loading && form.name && form.email && form.message ? handleSubmit : undefined}
            aria-disabled={loading || !form.name || !form.email || !form.message}
          >
            {loading ? (
              "Sending…"
            ) : (
              <>
                Send Message{" "}
                <Icon boxSize={4}>
                  <MdSend />
                </Icon>
              </>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default ContactForm;