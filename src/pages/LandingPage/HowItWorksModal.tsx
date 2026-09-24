import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import {
  FaGraduationCap,
  FaLightbulb,
  FaChalkboardUser,
  FaYoutube,
} from "react-icons/fa6";
import { FiLink, FiCheck } from "react-icons/fi";
import { YouTubeVideoPlayer } from "@/components/YouTubeVideoPlayer";

const DEFAULT_VIDEO_URL =
  "https://jmjballgaxelqhsvhlvl.supabase.co/storage/v1/object/public/assets/How%20it%20works%20Vid.mp4";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export const HowItWorksModal = ({
  isOpen,
  onClose,
  videoUrl = DEFAULT_VIDEO_URL,
}: HowItWorksModalProps) => {
  const navigate = useNavigate();
  const [activeUrl, setActiveUrl] = useState<string>(videoUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState("");

  // Sync prop changes
  useEffect(() => {
    setActiveUrl(videoUrl);
  }, [videoUrl]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputUrl.trim()) {
      setActiveUrl(customInputUrl.trim());
      setIsEditingUrl(false);
    }
  };

  const handleResetToDefault = () => {
    setActiveUrl(DEFAULT_VIDEO_URL);
    setCustomInputUrl("");
    setIsEditingUrl(false);
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(5, 7, 26, 0.90)"
      backdropFilter="blur(10px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 3, sm: 4, md: 6 }}
      onClick={() => onClose()}
    >
      <Box
        bg="#0F0F0F"
        color="white"
        borderRadius={{ base: "xl", md: "2xl" }}
        boxShadow="0 25px 60px -12px rgba(0, 0, 0, 0.85)"
        border="1px solid rgba(255, 255, 255, 0.12)"
        maxW="960px"
        w="full"
        maxH="95vh"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
        animation="fadeIn 0.2s ease-out"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          px={{ base: 4, sm: 6 }}
          py={{ base: 3.5, sm: 4 }}
          borderBottom="1px solid rgba(255, 255, 255, 0.08)"
          bg="rgba(255, 255, 255, 0.02)"
        >
          <Box>
            <HStack gap={2} mb={1}>
              <Badge
                bg="#FF0000"
                color="white"
                fontSize="10px"
                fontWeight="800"
                px={2}
                py={0.5}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FaYoutube} boxSize={3} />
                YOUTUBE PLAYER
              </Badge>
              <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)">
                iGrades Walkthrough & Demo
              </Text>
            </HStack>
            <Heading
              fontSize={{ base: "md", sm: "lg", md: "xl" }}
              fontWeight="800"
              color="white"
              letterSpacing="-0.02em"
            >
              How iGrades Works
            </Heading>
          </Box>

          <HStack gap={2}>
            {/* Custom URL or YouTube Link Option */}
            <Button
              size="xs"
              variant="outline"
              color="whiteAlpha.800"
              borderColor="whiteAlpha.200"
              _hover={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.400" }}
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              display={{ base: "none", sm: "flex" }}
              alignItems="center"
              gap={1.5}
            >
              <Icon as={FiLink} boxSize={3} />
              {isEditingUrl ? "Hide URL" : "Switch / YouTube Link"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              color="whiteAlpha.700"
              _hover={{ color: "white", bg: "whiteAlpha.200" }}
              borderRadius="full"
              w="36px"
              h="36px"
              p={0}
              minW="auto"
              onClick={onClose}
              aria-label="Close video modal"
            >
              <Icon as={IoClose} boxSize={5} />
            </Button>
          </HStack>
        </Flex>

        {/* Optional Custom YouTube URL Banner */}
        {isEditingUrl && (
          <Box
            bg="#181818"
            px={{ base: 4, sm: 6 }}
            py={3}
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
          >
            <form onSubmit={handleApplyCustomUrl}>
              <Flex gap={2} align="center" flexWrap="wrap">
                <Input
                  flex="1"
                  size="sm"
                  placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or MP4 URL)"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  bg="#222"
                  borderColor="whiteAlpha.300"
                  color="white"
                  fontSize="xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  bg="#FF0000"
                  color="white"
                  fontSize="xs"
                  fontWeight="bold"
                  _hover={{ bg: "#d90000" }}
                >
                  <Icon as={FiCheck} mr={1} /> Play
                </Button>
                {activeUrl !== DEFAULT_VIDEO_URL && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.700"
                    fontSize="xs"
                    onClick={handleResetToDefault}
                  >
                    Reset to Default
                  </Button>
                )}
              </Flex>
            </form>
          </Box>
        )}

        {/* Video Player Container */}
        <Box
          bg="#000000"
          p={{ base: 1.5, sm: 3 }}
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box w="100%" maxW="920px" mx="auto">
            <YouTubeVideoPlayer
              key={activeUrl}
              url={activeUrl}
              title="How iGrades Works"
              autoPlay={true}
            />
          </Box>
        </Box>

        {/* Footer / Highlights & CTA */}
        <Box
          px={{ base: 4, sm: 6 }}
          py={{ base: 3, sm: 3.5 }}
          borderTop="1px solid rgba(255, 255, 255, 0.08)"
          bg="rgba(255, 255, 255, 0.02)"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={3}
          >
            {/* Quick feature pill highlights */}
            <HStack
              gap={{ base: 2, md: 3 }}
              flexWrap="wrap"
              color="rgba(255, 255, 255, 0.75)"
              fontSize="12px"
            >
              <HStack
                gap={1.5}
                bg="whiteAlpha.100"
                px={2.5}
                py={1}
                borderRadius="md"
              >
                <Icon as={FaGraduationCap} color="#206CE1" boxSize={3.5} />
                <Text>WAEC & JAMB Ready</Text>
              </HStack>
              <HStack
                gap={1.5}
                bg="whiteAlpha.100"
                px={2.5}
                py={1}
                borderRadius="md"
              >
                <Icon as={FaLightbulb} color="#FD8B3A" boxSize={3.5} />
                <Text>Smart Quizzes</Text>
              </HStack>
              <HStack
                gap={1.5}
                bg="whiteAlpha.100"
                px={2.5}
                py={1}
                borderRadius="md"
                display={{ base: "none", md: "flex" }}
              >
                <Icon as={FaChalkboardUser} color="#22C55E" boxSize={3.5} />
                <Text>Certified Tutors</Text>
              </HStack>
            </HStack>

            {/* Actions */}
            <HStack gap={2.5} justify={{ base: "flex-end", sm: "auto" }}>
              <Button
                variant="outline"
                size="sm"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={onClose}
                fontSize="xs"
                fontWeight="600"
              >
                Close
              </Button>
              <Button
                bg="#206CE1"
                _hover={{ bg: "#1a58b8" }}
                color="white"
                size="sm"
                fontWeight="bold"
                fontSize="xs"
                px={4}
                onClick={() => {
                  onClose();
                  navigate("/signup");
                }}
              >
                Join for free
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
