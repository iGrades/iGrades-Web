import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Button,
  Image,
  Heading,
  Text,
  IconButton,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogActionTrigger } from "@/components/ui/dialog";
import { FaArrowRightLong, FaChevronRight, FaStar } from "react-icons/fa6";
import { supabase } from "@/lib/supabaseClient";
import testimonialImg from "@/assets/landing-page/testimonial_img.png"; // Original asset fallback
import orangeBlob from "@/assets/landing-page/third_orange_line.png";

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  image_url: string;
}

const Reviews = () => {
  // --- State Variables ---
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Form Inputs
  const [formData, setFormData] = useState({ name: "", content: "", rating: 5 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch Testimonials ---
  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- Automatic Crossfade Loop ---
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      handleNextReview();
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews]);

  const handleNextReview = () => {
    if (reviews.length === 0) return;
    setIsFading(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setIsFading(false);
    }, 300);
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !formData.name || !formData.content) return alert("Please fill out all fields.");
    
    setSubmitting(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `review-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("reviews-bucket")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("reviews-bucket")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("reviews").insert([
        {
          name: formData.name,
          content: formData.content,
          rating: formData.rating,
          image_url: urlData.publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      setFormData({ name: "", content: "", rating: 5 });
      setImageFile(null);
      setIsOpen(false);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentReview = reviews[currentIndex];

  return (
    <Flex
      as="section"
      my={20}
      px={{ base: 4, lg: 12 }}
      align="start"
      justify="space-between"
      direction={{ base: "column", md: "row" }}
    >
      {/* ── LEFT COLUMN ── */}
      <Box
        w={{ base: "100%", md: "45%" }}
        mr={{ base: 0, md: 6, lg: 12 }}
        mb={{ base: 12, md: 0 }}
      >
        <Flex justify="start" align="center" mb={4} gap={2}>
          <Image src={orangeBlob} display="inline-block" alt="orange blob" />
          <Heading as="h4" fontSize="lg" fontWeight="semibold" color="#FD8B3A">
            {" "}
            TESTIMONIAL
          </Heading>
        </Flex>

        <Heading
          as="h2"
          lineHeight="1.2"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          fontFamily={"'Bricolage', Grotesque"}
          mb={6}
          color="#2F327D"
        >
          What They Say?
        </Heading>

        <Text w={{base: '100%', md: '90%'}} fontSize={{base:'md', md: 'md', lg: 'xl'}} color="#696984" mb={6} lineHeight="1.8">
          Students and tutors consistently praise iGrade for delivering high-quality instruction, connecting learners with reliable tutors, and offering flexible, personalized learning experiences. Users love the affordability, convenience, and measurable academic improvements that make iGrade their go-to platform for success.
        </Text>

        <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
          <DialogTrigger asChild>
            <Button
              w={72}
              p={6}
              pr={16}
              rounded="3xl"
              border="1px solid"
              borderColor="primaryColor"
              bg="white"
              color="primaryColor"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              position="relative"
              fontWeight='400'
              fontSize='md'
              _hover={{ bg: "gray.50" }}
              onClick={() => setIsOpen(true)}
            >
              Write your assessment
              <Box
                border="1px solid"
                borderColor="primaryColor"
                rounded="full"
                p={3.5}
                bg="white"
                position="absolute"
                right={-1}
              >
                <FaArrowRightLong />
              </Box>
            </Button>
          </DialogTrigger>

          <DialogContent borderRadius="xl" p={4}>
            <DialogHeader>
              <DialogTitle fontSize="xl" color="#2F327D">Submit Your Assessment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <DialogBody>
                <VStack gap={4} align="stretch">
                  <Field.Root required>
                    <Field.Label>Your Name</Field.Label>
                    <Input
                      placeholder="e.g. Gloria Rose"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Assessment / Review Text</Field.Label>
                    <Textarea
                      placeholder="Write your review experience here..."
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Rating Score</Field.Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Your Avatar Picture</Field.Label>
                    <Input
                      type="file"
                      accept="image/*"
                      pt={1}
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </Field.Root>
                </VStack>
              </DialogBody>
              <Flex justify="flex-end" gap={3} mt={6} px={6} pb={2}>
                <DialogActionTrigger asChild>
                  <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                </DialogActionTrigger>
                <Button type="submit" bg="primaryColor" color="white" loading={submitting}>
                  Submit Assessment
                </Button>
              </Flex>
            </form>
          </DialogContent>
        </DialogRoot>
      </Box>

      {/* ── RIGHT COLUMN  ── */}
      <Box
        w={{ base: "100%", md: "45%" }}
        mr={0}
        display="flex"
        justifyContent="center"
      >
        {loading ? (
          <Spinner size="xl" color="primaryColor" mt={10} />
        ) : (
          <Box 
            position="relative" 
            w="100%"
            style={{
              opacity: isFading ? 0 : 1,
              transform: isFading ? "scale(0.99)" : "scale(1)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {/* Main Image Layer (Adopts original design properties) */}
            <Image
              src={currentReview ? currentReview.image_url : testimonialImg}
              alt="testimonial-img"
              borderRadius="md"
              boxShadow="md"
              w="90%"
              h="75vh"
            />

            {/* Float reviews info overlays over image if row state tracks rows */}
            {currentReview && (
              <>
                <IconButton
                  aria-label="Next assessment item"
                  onClick={handleNextReview}
                  position="absolute"
                  right="-20px"
                  top="40%"
                  transform="translateY(-50%)"
                  borderRadius="full"
                  bg="white"
                  color="#206CE1"
                  boxShadow="xl"
                  size="lg"
                  zIndex={3}
                  _hover={{ transform: "translateY(-50%) scale(1.05)" }}
                >
                  <FaChevronRight size={18} />
                </IconButton>

                <Box
                  position="absolute"
                  bottom="-40px" // Shift downwards to overlap beautifully as seen in Screenshot (137).jpg
                  left="5%"
                  w="90%"
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="2xl"
                  p={{ base: 5, md: 6 }}
                  borderLeft="6px solid #F56565"
                  zIndex={2}
                >
                  <Text fontSize={{ base: "sm", md: "md" }} color="#696984" lineHeight="1.6" mb={4}>
                    "{currentReview.content}"
                  </Text>

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" fontSize="md" color="#2F327D">
                      {currentReview.name}
                    </Text>
                    
                    <VStack align="flex-end" gap={1}>
                      <HStack gap={1}>
                        {Array.from({ length: currentReview.rating }).map((_, i) => (
                          <Box as={FaStar} key={i} color="#F6AD55" boxSize={6} />
                        ))}
                      </HStack>
                      <Text fontSize="11px" color="#9898B0">
                        {currentReview.rating} Stars Rating
                      </Text>
                    </VStack>
                  </Flex>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default Reviews;