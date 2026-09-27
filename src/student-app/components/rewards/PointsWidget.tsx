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
  const [activeLedgerTab, setActiveLedgerTab] = useState<"points" | "credit">("points");

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
      p={{ base: 4, md: 7 }}
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      mb={6}
    >
      {/* ── HEADER ── */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={3}
        pb={5}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <HStack gap={3}>
          <Box
            p={2.5}
            borderRadius="xl"
            bg="blue.50"
            color="primaryColor"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiAward size={24} />
          </Box>
          <Box>
            <HStack gap={2} mb={0.5}>
              <Heading size="md" color="gray.900" fontWeight="800">
                iGG Rewards & Store Credit
              </Heading>
              <Badge bg="#206CE1" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                100% Free Perks
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Study, maintain your daily streak, and convert your points into real subscription discounts.
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          <Button
            size="xs"
            variant="ghost"
            color="primaryColor"
            _hover={{ bg: "blue.50" }}
            onClick={() => fetchPointsData()}
            loading={loading}
            borderRadius="lg"
            fontWeight="bold"
          >
            <FiRefreshCw size={13} style={{ marginRight: "4px" }} /> Refresh
          </Button>
        </HStack>
      </Flex>

      {/* ── THREE MAIN OVERVIEW CARDS ── */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        mt={5}
        align="stretch"
      >
        {/* Card 1: Points Balance */}
        <Box
          flex="1"
          p={5}
          borderRadius="2xl"
          bg="linear-gradient(135deg, #206CE1 0%, #154EB8 100%)"
          color="white"
          shadow="sm"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" right="-8px" bottom="-8px" opacity={0.12} color="white">
            <FiAward size={100} />
          </Box>
          <Text fontSize="xs" fontWeight="700" color="blue.100" textTransform="uppercase" letterSpacing="wider">
            iGG Points Balance
          </Text>
          <Heading size="2xl" my={1.5} fontWeight="900" color="white">
            {pointsBalance.toLocaleString()}{" "}
            <Text as="span" fontSize="sm" fontWeight="normal" color="blue.200">
              Pts
            </Text>
          </Heading>
          <Text fontSize="xs" color="blue.100">
            Worth <strong>₦{(pointsBalance * 10).toLocaleString()}</strong> store discount
          </Text>
        </Box>

        {/* Card 2: Store Credit */}
        <Box
          flex="1"
          p={5}
          borderRadius="2xl"
          bg="emerald.50/50"
          border="1px solid"
          borderColor="emerald.200"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" right="-8px" bottom="-8px" opacity={0.1} color="emerald.700">
            <FiCreditCard size={100} />
          </Box>
          <Text fontSize="xs" fontWeight="700" color="emerald.800" textTransform="uppercase" letterSpacing="wider">
            Available Store Credit
          </Text>
          <Heading size="2xl" my={1.5} fontWeight="900" color="emerald.900">
            ₦{creditBalance.toLocaleString()}
          </Heading>
          <Text fontSize="xs" color="emerald.700">
            Automatically deducted when upgrading or renewing
          </Text>
        </Box>

        {/* Card 3: Daily Streak */}
        <Box
          flex="1"
          p={5}
          borderRadius="2xl"
          bg="amber.50/60"
          border="1px solid"
          borderColor="amber.200"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" fontWeight="700" color="amber.900" textTransform="uppercase" letterSpacing="wider">
              Study Streak
            </Text>
            <IoFlame color="#D97706" size={22} />
          </Flex>
          <Heading size="2xl" my={1.5} fontWeight="900" color="amber.900">
            {currentStreak}{" "}
            <Text as="span" fontSize="sm" fontWeight="normal" color="amber.700">
              Days
            </Text>
          </Heading>
          <HStack gap={1}>
            <FiShield color="#B45309" size={13} />
            <Text fontSize="xs" color="amber.800">
              {graceUsed ? "1 grace day protected" : "Streak protection active"}
            </Text>
          </HStack>
        </Box>
      </Flex>

      {/* ── TWO-COLUMN INTERACTIVE SECTION: CONVERSION & RULES ── */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={5}
        mt={6}
        align="stretch"
      >
        {/* Left: Simple Conversion Panel */}
        <Box
          flex="1"
          p={5}
          bg="blue.50/30"
          borderRadius="2xl"
          border="1.5px solid"
          borderColor="blue.100"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            <Flex justify="space-between" align="center" mb={2}>
              <HStack gap={2}>
                <Box p={1.5} bg="blue.100" borderRadius="lg" color="primaryColor">
                  <FiZap size={16} />
                </Box>
                <Heading size="xs" color="gray.900" fontWeight="800">
                  Convert Points to Naira Credit
                </Heading>
              </HStack>
              <Badge colorPalette="blue" size="xs" variant="subtle" fontWeight="bold">
                100 Pts = ₦1,000
              </Badge>
            </Flex>
            <Text fontSize="xs" color="gray.600" mb={4}>
              Pick an amount or type in points (multiples of 100) to instantly redeem store credit.
            </Text>

            {/* Quick Preset Buttons */}
            <HStack gap={2} mb={3.5} flexWrap="wrap">
              {[100, 200, 500, 1000].map((preset) => (
                <Button
                  key={preset}
                  size="xs"
                  variant={convertInput === preset ? "solid" : "outline"}
                  bg={convertInput === preset ? "#206CE1" : "white"}
                  color={convertInput === preset ? "white" : "gray.700"}
                  borderColor={convertInput === preset ? "#206CE1" : "gray.200"}
                  _hover={{ bg: convertInput === preset ? "#1852B2" : "gray.50" }}
                  borderRadius="xl"
                  fontWeight="bold"
                  px={3}
                  onClick={() => setConvertInput(preset)}
                >
                  {preset} Pts (₦{(preset * 10).toLocaleString()})
                </Button>
              ))}
            </HStack>

            <form onSubmit={handleConversionSubmit}>
              <Box mb={3}>
                <Text fontSize="11px" fontWeight="700" color="gray.700" mb={1}>
                  Points to Convert:
                </Text>
                <Input
                  type="number"
                  step={100}
                  min={100}
                  value={convertInput}
                  onChange={(e) => setConvertInput(Math.max(100, Number(e.target.value)))}
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "primaryColor", boxShadow: "0 0 0 1px #206CE1" }}
                  borderRadius="xl"
                  size="sm"
                  fontWeight="bold"
                />
              </Box>

              <Box p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="blue.100" mb={4}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.600">
                    You will receive:
                  </Text>
                  <Text fontSize="md" fontWeight="900" color="emerald.600">
                    +₦{(convertInput * 10).toLocaleString()} Store Credit
                  </Text>
                </Flex>
              </Box>

              <Button
                type="submit"
                w="full"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                borderRadius="xl"
                size="sm"
                fontWeight="bold"
                loading={actionLoading}
                disabled={pointsBalance < convertInput || actionLoading}
              >
                Convert {convertInput} Points Now
              </Button>
            </form>
          </Box>

          <Text fontSize="10px" color="gray.400" textAlign="center" mt={3}>
            Instant redemption. Converted credit never expires and applies to your next checkout.
          </Text>
        </Box>

        {/* Right: How to Earn Points Clean Card */}
        <Box flex="1" p={5} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="xs" color="gray.900" fontWeight="800">
              🎯 How You Earn Points
            </Heading>
            <Badge colorPalette={dailyEarned >= 100 ? "green" : "blue"} size="xs" variant="solid" borderRadius="full">
              {dailyEarned}/100 Pts Today
            </Badge>
          </Flex>

          <Progress.Root value={Math.min(100, dailyEarned)} size="xs" colorPalette="blue" mb={4}>
            <Progress.Track borderRadius="full" bg="gray.200">
              <Progress.Range borderRadius="full" bg="#206CE1" />
            </Progress.Track>
          </Progress.Root>

          <Stack gap={2.5}>
            <HStack justify="space-between" p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
              <HStack gap={2.5}>
                <FiCheckCircle color="#206CE1" size={17} />
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="gray.800">
                    Daily Login
                  </Text>
                  <Text fontSize="10px" color="gray.500">
                    Log in once every 24 hours
                  </Text>
                </Box>
              </HStack>
              <Badge bg="blue.50" color="primaryColor" fontWeight="bold" size="sm" borderRadius="md">
                +5 Pts
              </Badge>
            </HStack>

            <HStack justify="space-between" p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
              <HStack gap={2.5}>
                <FiCheckCircle color="#206CE1" size={17} />
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="gray.800">
                    Quiz Completion
                  </Text>
                  <Text fontSize="10px" color="gray.500">
                    Score ≥80%: +30 Pts | 50–79%: +20 Pts
                  </Text>
                </Box>
              </HStack>
              <Badge bg="blue.50" color="primaryColor" fontWeight="bold" size="sm" borderRadius="md">
                Up to +30 Pts
              </Badge>
            </HStack>

            <HStack justify="space-between" p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
              <HStack gap={2.5}>
                <FiGift color="#D97706" size={17} />
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="gray.800">
                    Streak Milestones
                  </Text>
                  <Text fontSize="10px" color="gray.500">
                    7 Days: +50 Pts | 30 Days: +250 Pts
                  </Text>
                </Box>
              </HStack>
              <Badge bg="amber.100" color="amber.900" fontWeight="bold" size="sm" borderRadius="md">
                Bonus Perks
              </Badge>
            </HStack>
          </Stack>
        </Box>
      </Flex>

      {/* ── CLEAN TABBED LEDGER HISTORY ── */}
      <Box mt={6} pt={5} borderTop="1px solid" borderColor="gray.100">
        <Flex justify="space-between" align="center" mb={3.5} flexWrap="wrap" gap={2}>
          <Heading size="xs" color="gray.900" fontWeight="800">
            Recent Activity Ledger
          </Heading>
          <HStack gap={1.5} bg="gray.100" p={1} borderRadius="xl">
            <Button
              size="xs"
              variant={activeLedgerTab === "points" ? "solid" : "ghost"}
              bg={activeLedgerTab === "points" ? "white" : "transparent"}
              color={activeLedgerTab === "points" ? "gray.900" : "gray.500"}
              shadow={activeLedgerTab === "points" ? "xs" : "none"}
              borderRadius="lg"
              fontWeight="bold"
              onClick={() => setActiveLedgerTab("points")}
            >
              Points History ({pointsHistory.length})
            </Button>
            <Button
              size="xs"
              variant={activeLedgerTab === "credit" ? "solid" : "ghost"}
              bg={activeLedgerTab === "credit" ? "white" : "transparent"}
              color={activeLedgerTab === "credit" ? "gray.900" : "gray.500"}
              shadow={activeLedgerTab === "credit" ? "xs" : "none"}
              borderRadius="lg"
              fontWeight="bold"
              onClick={() => setActiveLedgerTab("credit")}
            >
              Credit History ({creditHistory.length})
            </Button>
          </HStack>
        </Flex>

        {activeLedgerTab === "points" ? (
          <Box bg="gray.50" p={3} borderRadius="2xl" border="1px solid" borderColor="gray.100">
            {pointsHistory.length === 0 ? (
              <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                No points history recorded yet. Complete quizzes & log in daily to earn points!
              </Text>
            ) : (
              <Stack gap={1.5} maxH="220px" overflowY="auto">
                {pointsHistory.map((pt) => (
                  <Flex
                    key={pt.id}
                    justify="space-between"
                    align="center"
                    p={2.5}
                    bg="white"
                    borderRadius="xl"
                    fontSize="xs"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box>
                      <Text fontWeight="700" color="gray.800" textTransform="capitalize">
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
                      fontWeight="bold"
                    >
                      {pt.points > 0 ? `+${pt.points}` : pt.points} Pts
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        ) : (
          <Box bg="gray.50" p={3} borderRadius="2xl" border="1px solid" borderColor="gray.100">
            {creditHistory.length === 0 ? (
              <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                No credit history recorded yet. Convert points to see store credit here!
              </Text>
            ) : (
              <Stack gap={1.5} maxH="220px" overflowY="auto">
                {creditHistory.map((cr) => (
                  <Flex
                    key={cr.id}
                    justify="space-between"
                    align="center"
                    p={2.5}
                    bg="white"
                    borderRadius="xl"
                    fontSize="xs"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box>
                      <Text fontWeight="700" color="gray.800" textTransform="capitalize">
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
                      fontWeight="bold"
                    >
                      {cr.amount_naira > 0 ? `+₦${cr.amount_naira.toLocaleString()}` : `-₦${Math.abs(cr.amount_naira).toLocaleString()}`}
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
