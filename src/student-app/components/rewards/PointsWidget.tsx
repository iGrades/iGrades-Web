import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Stack,
  HStack,
  Progress,
  Input,
} from "@chakra-ui/react";
import { usePointsSystem } from "@/student-app/hooks/usePointsSystem";
import {
  FiAward,
  FiZap,
  FiCreditCard,
  FiShield,
  FiCheckCircle,
  FiRefreshCw,
  FiGift,
} from "react-icons/fi";
import { IoFlame } from "react-icons/io5";

export const PointsWidget: React.FC = () => {
  const {
    pointsBalance,
    creditBalance,
    dailyEarned,
    streakInfo,
    pointsHistory,
    creditHistory,
    loading,
    actionLoading,
    fetchPointsData,
    convertPoints,
  } = usePointsSystem();

  const [convertInput, setConvertInput] = useState<number>(100);

  const currentStreak = streakInfo?.current_streak_days || 1;
  const graceUsed = streakInfo?.grace_used_in_window;

  const handleConversionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (convertInput < 100 || convertInput % 100 !== 0) return;
    await convertPoints(convertInput);
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      shadow="md"
      border="1px solid"
      borderColor="gray.100"
      mb={6}
    >
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={3}
        pb={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <HStack gap={3}>
          <Box p={2.5} bg="#206CE11A" borderRadius="xl" color="primaryColor">
            <FiAward size={24} />
          </Box>
          <Box>
            <HStack gap={2}>
              <Heading size="md" color="primaryColor" fontWeight="extrabold">
                iGrades Rewards & Subscription Credit
              </Heading>
              <Badge bg="primaryColor" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="10px">
                iGG Points
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.600">
              Earn points for daily logins & quizzes, maintain streaks, and convert points to Naira (₦) subscription credit!
            </Text>
          </Box>
        </HStack>

        <Button
          size="xs"
          variant="ghost"
          color="primaryColor"
          _hover={{ bg: "#206CE11A" }}
          onClick={() => fetchPointsData()}
          loading={loading}
        >
          <FiRefreshCw size={14} /> Refresh
        </Button>
      </Flex>

      {/* Primary Metrics Grid */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        mt={5}
        align="stretch"
      >
        {/* Card 1: Active Points Balance */}
        <Box
          flex="1"
          p={4}
          borderRadius="2xl"
          bg="primaryColor"
          bgGradient="linear(to-br, #206CE1, #134DB3)"
          color="white"
          shadow="md"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" right="-10px" bottom="-10px" opacity={0.15}>
            <FiAward size={110} />
          </Box>
          <Text fontSize="xs" fontWeight="semibold" color="blue.100" textTransform="uppercase" letterSpacing="wider">
            Active Points Balance
          </Text>
          <Heading size="2xl" my={1} fontWeight="black" color="white">
            {pointsBalance.toLocaleString()}{" "}
            <Text as="span" fontSize="md" fontWeight="normal" color="blue.200">
              IGG Pts
            </Text>
          </Heading>
          <Text fontSize="11px" color="blue.100" mt={1}>
            Value: ₦{(pointsBalance * 10).toLocaleString()} Subscription Credit
          </Text>
        </Box>

        {/* Card 2: Active Subscription Credit */}
        <Box
          flex="1"
          p={4}
          borderRadius="2xl"
          bgGradient="linear(to-br, emerald.600, teal.700)"
          color="white"
          shadow="sm"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" right="-10px" bottom="-10px" opacity={0.15}>
            <FiCreditCard size={110} />
          </Box>
          <Text fontSize="xs" fontWeight="semibold" color="emerald.100" textTransform="uppercase" letterSpacing="wider">
            Subscription Store Credit
          </Text>
          <Heading size="2xl" my={1} fontWeight="black" color="white">
            ₦{creditBalance.toLocaleString()}
          </Heading>
          <Text fontSize="11px" color="emerald.100" mt={1}>
            Ready to apply at checkout for subscription renewals!
          </Text>
        </Box>

        {/* Card 3: Learning Streak */}
        <Box
          flex="1"
          p={4}
          borderRadius="2xl"
          bg="amber.50"
          border="1px solid"
          borderColor="amber.200"
          shadow="xs"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" fontWeight="bold" color="amber.900" textTransform="uppercase" letterSpacing="wider">
              Learning Streak
            </Text>
            <IoFlame color="#D97706" size={22} />
          </Flex>
          <Heading size="2xl" my={1} fontWeight="black" color="amber.900">
            {currentStreak}{" "}
            <Text as="span" fontSize="md" fontWeight="normal" color="amber.700">
              Days
            </Text>
          </Heading>
          <HStack gap={1} mt={1}>
            <FiShield color="#B45309" size={14} />
            <Text fontSize="11px" color="amber.800" fontWeight="medium">
              {graceUsed
                ? "Grace Used (1 missed day covered in window)"
                : "Grace Available (1 missed day protected in 7-day window)"}
            </Text>
          </HStack>
        </Box>
      </Flex>

      {/* Earning Rules & Conversion Bar */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={5}
        mt={6}
        align="stretch"
      >
        {/* Left: Earning Rules & Daily Cap */}
        <Box flex="1.2" p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="xs" color="primaryColor" fontWeight="bold">
              📊 Daily Earning Tracker (WAT UTC+1)
            </Heading>
            <Text fontSize="xs" fontWeight="bold" color={dailyEarned >= 100 ? "emerald.600" : "primaryColor"}>
              {dailyEarned} / 100 Pts Earned Today
            </Text>
          </Flex>

          <Progress.Root value={Math.min(100, dailyEarned)} size="sm" colorPalette="blue" mb={3}>
            <Progress.Track borderRadius="full" bg="gray.200">
              <Progress.Range borderRadius="full" bg="primaryColor" />
            </Progress.Track>
          </Progress.Root>

          <Stack gap={2.5}>
            <HStack justify="space-between" p={2} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100">
              <HStack gap={2}>
                <FiCheckCircle color="#206CE1" size={16} />
                <Text fontSize="xs" fontWeight="medium" color="gray.800">
                  Daily Login Bonus
                </Text>
              </HStack>
              <Badge bg="#206CE11A" color="primaryColor" variant="subtle">
                +5 Pts / day
              </Badge>
            </HStack>

            <HStack justify="space-between" p={2} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100">
              <HStack gap={2}>
                <FiCheckCircle color="#206CE1" size={16} />
                <Box>
                  <Text fontSize="xs" fontWeight="medium" color="gray.800">
                    Quiz First Attempt (Score Bands)
                  </Text>
                  <Text fontSize="10px" color="gray.500">
                    ≥80%: +30 Pts | 50-79%: +20 Pts | &lt;50%: +10 Pts
                  </Text>
                </Box>
              </HStack>
              <Badge colorPalette="blue" variant="subtle">
                First Attempt Only
              </Badge>
            </HStack>

            <HStack justify="space-between" p={2} bg="amber.50" borderRadius="lg" border="1px solid" borderColor="amber.200">
              <HStack gap={2}>
                <FiGift color="#D97706" size={16} />
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="amber.900">
                    Streak Bonus Milestones (Exempt from daily cap!)
                  </Text>
                  <Text fontSize="10px" color="amber.700">
                    7-Day Streak = +50 Pts | 30-Day Streak = +250 Pts
                  </Text>
                </Box>
              </HStack>
              <Badge colorPalette="amber" variant="solid">
                Exempt
              </Badge>
            </HStack>
          </Stack>
        </Box>

        {/* Right: Convert Points to Naira Credit Calculator */}
        <Box
          flex="1"
          p={4}
          bg="#206CE108"
          borderRadius="2xl"
          border="1px solid"
          borderColor="blue.200"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            <HStack gap={2} mb={1}>
              <FiZap color="#206CE1" size={18} />
              <Heading size="xs" color="primaryColor" fontWeight="extrabold">
                Convert Points to Naira Credit
              </Heading>
            </HStack>
            <Text fontSize="xs" color="gray.600" mb={3}>
              Conversion Rate: <Text as="span" fontWeight="bold" color="primaryColor">100 Points = ₦1,000 Store Credit</Text> (Minimum threshold: 100 pts)
            </Text>

            {/* Presets */}
            <HStack gap={2} mb={3}>
              {[100, 200, 500, 1000].map((preset) => (
                <Button
                  key={preset}
                  size="xs"
                  variant={convertInput === preset ? "solid" : "outline"}
                  colorPalette="blue"
                  bg={convertInput === preset ? "primaryColor" : undefined}
                  borderRadius="lg"
                  onClick={() => setConvertInput(preset)}
                >
                  {preset} Pts
                </Button>
              ))}
            </HStack>

            <form onSubmit={handleConversionSubmit}>
              <Box mb={3}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1}>
                  Select or Enter Points to Convert:
                </Text>
                <Input
                  type="number"
                  step={100}
                  min={100}
                  value={convertInput}
                  onChange={(e) => setConvertInput(Number(e.target.value))}
                  bg="white"
                  borderColor="blue.200"
                  _focus={{ borderColor: "primaryColor" }}
                  borderRadius="xl"
                  size="sm"
                  fontWeight="bold"
                />
              </Box>

              <Box p={2.5} bg="white" borderRadius="xl" border="1px solid" borderColor="blue.100" mb={3}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.600">
                    You will receive:
                  </Text>
                  <Text fontSize="md" fontWeight="black" color="emerald.600">
                    ₦{(convertInput * 10).toLocaleString()} Store Credit
                  </Text>
                </Flex>
              </Box>

              <Button
                type="submit"
                w="full"
                bg="primaryColor"
                color="white"
                _hover={{ bg: "#1852B2" }}
                borderRadius="xl"
                loading={actionLoading}
                disabled={pointsBalance < convertInput || actionLoading}
              >
                Convert {convertInput} Points Now
              </Button>
            </form>
          </Box>

          <Text fontSize="10px" color="gray.500" textAlign="center" mt={3}>
            🔒 Conversion is atomic and irreversible. Credit applies directly to future subscription billing.
          </Text>
        </Box>
      </Flex>

      {/* Ledger History Tables */}
      <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.100">
        <Heading size="xs" color="primaryColor" fontWeight="bold" mb={3}>
          📋 Recent Points & Credit Ledger History
        </Heading>

        <Flex direction={{ base: "column", lg: "row" }} gap={4}>
          {/* Points Transactions */}
          <Box flex="1" bg="gray.50" p={3} borderRadius="xl" border="1px solid" borderColor="gray.100">
            <Text fontSize="xs" fontWeight="bold" color="primaryColor" mb={2}>
              Points Earned / Expired Ledger
            </Text>
            {pointsHistory.length === 0 ? (
              <Text fontSize="xs" color="gray.500" py={4} textAlign="center">
                No points history recorded yet. Complete quizzes & log in daily to earn!
              </Text>
            ) : (
              <Stack gap={1.5} maxH="220px" overflowY="auto">
                {pointsHistory.map((pt) => (
                  <Flex
                    key={pt.id}
                    justify="space-between"
                    align="center"
                    p={2}
                    bg="white"
                    borderRadius="lg"
                    fontSize="xs"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box>
                      <Text fontWeight="semibold" color="gray.800" textTransform="capitalize">
                        {pt.type.replace(/_/g, " ")}
                      </Text>
                      <Text fontSize="10px" color="gray.400">
                        {new Date(pt.created_at).toLocaleDateString()} at{" "}
                        {new Date(pt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </Box>
                    <Badge
                      colorPalette={pt.points > 0 ? "emerald" : "red"}
                      variant="solid"
                      borderRadius="md"
                    >
                      {pt.points > 0 ? `+${pt.points}` : pt.points} Pts
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>

          {/* Credit Transactions */}
          <Box flex="1" bg="gray.50" p={3} borderRadius="xl" border="1px solid" borderColor="gray.100">
            <Text fontSize="xs" fontWeight="bold" color="emerald.900" mb={2}>
              Naira (₦) Store Credit Ledger
            </Text>
            {creditHistory.length === 0 ? (
              <Text fontSize="xs" color="gray.500" py={4} textAlign="center">
                No credit history recorded yet. Convert points to see store credit here!
              </Text>
            ) : (
              <Stack gap={1.5} maxH="220px" overflowY="auto">
                {creditHistory.map((cr) => (
                  <Flex
                    key={cr.id}
                    justify="space-between"
                    align="center"
                    p={2}
                    bg="white"
                    borderRadius="lg"
                    fontSize="xs"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box>
                      <Text fontWeight="semibold" color="gray.800" textTransform="capitalize">
                        {cr.type.replace(/_/g, " ")}
                      </Text>
                      <Text fontSize="10px" color="gray.400">
                        {new Date(cr.created_at).toLocaleDateString()}
                      </Text>
                    </Box>
                    <Badge
                      colorPalette={cr.amount_naira > 0 ? "emerald" : "orange"}
                      variant="solid"
                      borderRadius="md"
                    >
                      {cr.amount_naira > 0 ? `+₦${cr.amount_naira.toLocaleString()}` : `-₦${Math.abs(cr.amount_naira).toLocaleString()}`}
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
