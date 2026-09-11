import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Badge,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useUser } from "../../context/parentDataContext";
import { toaster } from "@/components/ui/toaster";
import {
  FaLink,
  FaGift,
  FaWhatsapp,
  FaEnvelope,
  FaCheck,
  FaRegCopy,
  FaBell,
  FaUsers,
} from "react-icons/fa6";
import { LuClock, LuShieldCheck, LuAward, LuSparkles } from "react-icons/lu";

export const ReferAFriendView = () => {
  const { parent } = useUser();
  const [copied, setCopied] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  const parentName = parent[0]?.firstname || "Family";
  const referralCode = `IGRADE-${parentName.toUpperCase()}-2025`;
  const previewLink = `https://igrade.app/join?ref=${referralCode}`;

  useEffect(() => {
    const saved = localStorage.getItem("igrade_referral_waitlist_joined");
    if (saved === "true") {
      setIsWaitlisted(true);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(previewLink);
      }
      setCopied(true);
      toaster.create({
        title: "Referral Link Copied!",
        description: `Your custom referral code (${referralCode}) has been reserved for launch.`,
        type: "success",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toaster.create({
        title: "Link Reserved",
        description: `Your code ${referralCode} will be ready when the program goes live!`,
        type: "info",
      });
    }
  };

  const handleToggleWaitlist = () => {
    const newState = !isWaitlisted;
    setIsWaitlisted(newState);
    localStorage.setItem("igrade_referral_waitlist_joined", String(newState));

    if (newState) {
      toaster.create({
        title: "You're on the VIP Waitlist!",
        description: "We will alert you as soon as the Refer-a-Friend program launches with early bonus rewards.",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Notification Removed",
        description: "You've unsubscribed from referral launch alerts.",
        type: "info",
      });
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Hey! I'm using iGrade to track my child's academic progress and quiz performance. You can check it out here: ${previewLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Invite to join iGrade Learning Platform");
    const body = encodeURIComponent(
      `Hello,\n\nI recommend trying iGrade for tracking student quiz results, identifying academic strengths and weaknesses, and getting weekly study digests.\n\nUse my invite code ${referralCode} at: ${previewLink}\n\nBest regards,\n${parent[0]?.firstname || "A fellow parent"}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Box w="full" maxW="4xl" mx="auto" pb={8}>
      {/* Upcoming Feature Hero Card */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="3xl"
        p={{ base: 6, md: 8 }}
        bg="linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #FFFFFF 100%)"
        border="1px solid"
        borderColor="purple.200"
        boxShadow="sm"
        mb={8}
      >
        {/* Top Feature Status Tag */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
          <HStack gap={2}>
            <Badge
              bg="#AE3DD6"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={1.5}
            >
              <Icon as={LuClock} />
              Upcoming Feature
            </Badge>
            <Badge colorPalette="purple" variant="subtle" size="sm" px={2.5}>
              Coming Soon
            </Badge>
          </HStack>

          <Button
            size="xs"
            variant={isWaitlisted ? "solid" : "outline"}
            colorPalette="purple"
            borderRadius="full"
            px={3.5}
            py={1.5}
            onClick={handleToggleWaitlist}
          >
            <Icon as={isWaitlisted ? FaCheck : FaBell} style={{ marginRight: "6px" }} />
            {isWaitlisted ? "VIP Waitlist Joined" : "Notify Me On Launch"}
          </Button>
        </Flex>

        {/* Hero Title & Pitch */}
        <VStack align="start" gap={3} maxW="2xl">
          <HStack gap={3}>
            <Box
              p={3}
              bg="#AE3DD61A"
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaGift} boxSize="28px" color="#AE3DD6" />
            </Box>
            <Box>
              <Heading
                as="h2"
                size={{ base: "lg", md: "xl" }}
                color="gray.900"
                fontWeight="800"
                lineHeight="1.2"
              >
                Refer a Friend & Empower Families
              </Heading>
              <Text fontSize="xs" color="purple.700" fontWeight="semibold" mt={0.5}>
                Give the gift of academic confidence and earn mutual rewards.
              </Text>
            </Box>
          </HStack>

          <Text fontSize="sm" color="gray.600" lineHeight="1.6" mt={1}>
            We&apos;re currently preparing our family referral initiative. Soon, you&apos;ll be able to invite fellow parents, family members, and PTA friends to iGrade and unlock exclusive learning perks for both your students.
          </Text>
        </VStack>

        {/* Interactive Code Preview Box */}
        <Box
          mt={6}
          p={{ base: 4, md: 5 }}
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="purple.100"
          boxShadow="xs"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "start", sm: "center" }}
            gap={3}
          >
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Your Reserved Family Referral Code
              </Text>
              <HStack gap={2} mt={1}>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color="#AE3DD6"
                  fontFamily="monospace"
                  bg="purple.50"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  border="1px dashed"
                  borderColor="purple.300"
                >
                  {referralCode}
                </Text>
                <Badge colorPalette="green" variant="subtle" size="sm">
                  Reserved for You
                </Badge>
              </HStack>
            </Box>

            <HStack gap={2} w={{ base: "full", sm: "auto" }}>
              <Button
                size="sm"
                bg="#AE3DD6"
                color="white"
                _hover={{ bg: "#932eb8" }}
                borderRadius="xl"
                flex={{ base: 1, sm: "initial" }}
                onClick={handleCopyLink}
              >
                <Icon as={copied ? FaCheck : FaRegCopy} style={{ marginRight: "6px" }} />
                {copied ? "Copied!" : "Copy Preview Link"}
              </Button>
            </HStack>
          </Flex>

          {/* Social Share Mockup Buttons */}
          <HStack gap={2} mt={4} pt={3} borderTop="1px solid" borderColor="gray.100" wrap="wrap">
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              Share preview via:
            </Text>
            <Button
              size="xs"
              variant="outline"
              colorPalette="green"
              borderRadius="lg"
              onClick={handleShareWhatsApp}
            >
              <Icon as={FaWhatsapp} style={{ marginRight: "5px" }} />
              WhatsApp
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorPalette="blue"
              borderRadius="lg"
              onClick={handleShareEmail}
            >
              <Icon as={FaEnvelope} style={{ marginRight: "5px" }} />
              Email
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="purple"
              borderRadius="lg"
              onClick={handleCopyLink}
            >
              <Icon as={FaLink} style={{ marginRight: "5px" }} />
              Copy Link
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* How It Will Work Section */}
      <Box mb={8}>
        <HStack gap={2} mb={4}>
          <Icon as={LuSparkles} color="#AE3DD6" />
          <Heading size="md" color="gray.900">
            How It Will Work
          </Heading>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {/* Step 1 */}
          <Box
            p={5}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="xs"
          >
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="purple.50"
              color="#AE3DD6"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="sm"
              mb={3}
            >
              1
            </Flex>
            <Heading size="sm" color="gray.800" mb={1.5}>
              Share Your Link
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.6">
              Send your personal invitation link or code to friends, relatives, or fellow parents in your school network.
            </Text>
          </Box>

          {/* Step 2 */}
          <Box
            p={5}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="xs"
          >
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="blue.50"
              color="blue.600"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="sm"
              mb={3}
            >
              2
            </Flex>
            <Heading size="sm" color="gray.800" mb={1.5}>
              Friend Enrolls Student
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.6">
              Your invited parent signs up, adds their child, and starts exploring diagnostic practice quizzes and learning insights.
            </Text>
          </Box>

          {/* Step 3 */}
          <Box
            p={5}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="xs"
          >
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="green.50"
              color="green.600"
              align="center"
              justify="center"
              fontWeight="bold"
              fontSize="sm"
              mb={3}
            >
              3
            </Flex>
            <Heading size="sm" color="gray.800" mb={1.5}>
              Unlock Shared Perks
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.6">
              Both families receive bonus practice coins, detailed weekly intelligence digests, and discount tokens for term subscriptions.
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Planned Upcoming Rewards */}
      <Box mb={8}>
        <HStack gap={2} mb={4}>
          <Icon as={LuAward} color="#AE3DD6" />
          <Heading size="md" color="gray.900">
            Upcoming Referral Rewards
          </Heading>
        </HStack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          <Box
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="purple.100"
          >
            <Flex
              w="40px"
              h="40px"
              borderRadius="xl"
              bg="purple.50"
              align="center"
              justify="center"
              mb={3}
            >
              <Icon as={FaGift} color="#AE3DD6" boxSize="20px" />
            </Flex>
            <Heading size="sm" color="gray.800" mb={1}>
              1 Month Intelligence Free
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.5">
              Enjoy deep diagnostic quiz analytics, strengths and weaknesses breakdowns, and predictive exam trends.
            </Text>
          </Box>

          <Box
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="amber.100"
          >
            <Flex
              w="40px"
              h="40px"
              borderRadius="xl"
              bg="amber.50"
              align="center"
              justify="center"
              mb={3}
            >
              <Icon as={LuSparkles} color="amber.600" boxSize="20px" />
            </Flex>
            <Heading size="sm" color="gray.800" mb={1}>
              500 Student Quiz Coins
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.5">
              Bonus practice currency for your child to unlock mock exams, challenge quizzes, and educational avatar badges.
            </Text>
          </Box>

          <Box
            p={5}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="blue.100"
          >
            <Flex
              w="40px"
              h="40px"
              borderRadius="xl"
              bg="blue.50"
              align="center"
              justify="center"
              mb={3}
            >
              <Icon as={FaUsers} color="blue.600" boxSize="20px" />
            </Flex>
            <Heading size="sm" color="gray.800" mb={1}>
              Community Ambassador
            </Heading>
            <Text fontSize="xs" color="gray.500" lineHeight="1.5">
              Priority invitations to iGrade webinars, academic curriculum guides, and early access to new AI tutoring tools.
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Early Access Waitlist Opt-in Banner */}
      <Box
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        bg="gray.50"
        border="1px dashed"
        borderColor="gray.300"
        textAlign="center"
      >
        <Flex
          w="48px"
          h="48px"
          borderRadius="full"
          bg="purple.100"
          color="#AE3DD6"
          align="center"
          justify="center"
          mx="auto"
          mb={3}
        >
          <Icon as={LuShieldCheck} boxSize="24px" />
        </Flex>
        <Heading size="sm" color="gray.800" mb={1.5}>
          Want Priority Access to the Referral Launch?
        </Heading>
        <Text fontSize="xs" color="gray.500" maxW="md" mx="auto" mb={4}>
          Be among the first group of parents invited to share your link and receive double reward credits on your first 3 successful referrals.
        </Text>
        <Button
          bg={isWaitlisted ? "green.600" : "#AE3DD6"}
          color="white"
          _hover={{ bg: isWaitlisted ? "green.700" : "#932eb8" }}
          borderRadius="xl"
          size="sm"
          px={6}
          onClick={handleToggleWaitlist}
        >
          <Icon as={isWaitlisted ? FaCheck : FaBell} style={{ marginRight: "6px" }} />
          {isWaitlisted ? "You are on the Early Access List!" : "Join Priority Launch List"}
        </Button>
      </Box>
    </Box>
  );
};
