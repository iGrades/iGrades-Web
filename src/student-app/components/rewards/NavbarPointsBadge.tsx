import React, { useState } from "react";
import {
  HStack,
  Text,
  Box,
  Portal,
  Popover,
  Stack,
  Flex,
  Button,
  Progress,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { usePointsSystem } from "@/student-app/hooks/usePointsSystem";
import {
  FiAward,
  FiRefreshCw,
} from "react-icons/fi";
import { IoFlame } from "react-icons/io5";

export const NavbarPointsBadge: React.FC = () => {
  const {
    pointsBalance,
    creditBalance,
    dailyEarned,
    streakInfo,
    convertPoints,
    actionLoading,
    fetchPointsData,
  } = usePointsSystem();

  const [convertAmount, setConvertAmount] = useState<number>(100);

  const currentStreak = streakInfo?.current_streak_days || 1;
  const graceActive = streakInfo?.grace_used_in_window;

  const handleQuickConvert = async (amount: number) => {
    const success = await convertPoints(amount);
    if (success) {
      fetchPointsData();
    }
  };

  return (
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger asChild>
        <HStack
          gap={1.5}
          cursor="pointer"
          px={2.5}
          py={1}
          borderRadius="full"
          bg="gradient-to-r"
          bgGradient="linear(to-r, amber.50, yellow.100)"
          border="1px solid"
          borderColor="amber.300"
          _hover={{ transform: "scale(1.03)", shadow: "sm" }}
          transition="all 0.15s ease"
        >
          {/* Points Pill */}
          <HStack gap={1}>
            <FiAward color="#D97706" size={16} />
            <Text fontSize="xs" fontWeight="bold" color="amber.900">
              {pointsBalance.toLocaleString()} <Text as="span" fontSize="10px" color="amber.700">IGG Pts</Text>
            </Text>
          </HStack>

          <Box h="12px" w="1px" bg="amber.300" mx={0.5} />

          {/* Streak Pill */}
          <HStack gap={0.5}>
            <IoFlame color="#EA580C" size={15} />
            <Text fontSize="xs" fontWeight="bold" color="orange.900">
              {currentStreak}d
            </Text>
          </HStack>
        </HStack>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner zIndex={1600}>
          <Popover.Content
            width={{ base: "310px", sm: "360px" }}
            bg="white"
            shadow="2xl"
            borderRadius="2xl"
            border="1px solid"
            borderColor="amber.200"
            p={0}
            overflow="hidden"
          >
            <Popover.Arrow />
            {/* Header */}
            <Box
              p={3.5}
              bg="primaryColor"
              bgGradient="linear(to-r, #206CE1, #134DB3)"
              color="white"
            >
              <Flex justify="space-between" align="center">
                <HStack gap={2}>
                  <Box p={1.5} bg="white/20" borderRadius="lg">
                    <FiAward size={20} />
                  </Box>
                  <Box>
                    <Heading size="xs" color="white" fontWeight="bold">
                      iGrades Rewards Center
                    </Heading>
                    <Text fontSize="10px" color="blue.100">
                      Earn points, maintain streaks & get subscription credit
                    </Text>
                  </Box>
                </HStack>
                <IconButton
                  aria-label="Refresh Points"
                  variant="ghost"
                  size="xs"
                  color="white"
                  _hover={{ bg: "white/20" }}
                  onClick={() => fetchPointsData()}
                >
                  <FiRefreshCw size={14} />
                </IconButton>
              </Flex>
            </Box>

            {/* Quick Balances Grid */}
            <Box p={3} bg="blue.50/40">
              <GridRow>
                <Box
                  flex="1"
                  p={2.5}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="blue.200"
                  shadow="xs"
                >
                  <Text fontSize="10px" color="gray.500" fontWeight="medium">
                    Active Points
                  </Text>
                  <Text fontSize="lg" fontWeight="extrabold" color="primaryColor">
                    {pointsBalance.toLocaleString()}{" "}
                    <Text as="span" fontSize="xs" fontWeight="normal">
                      IGG
                    </Text>
                  </Text>
                </Box>

                <Box
                  flex="1"
                  p={2.5}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="emerald.200"
                  shadow="xs"
                >
                  <Text fontSize="10px" color="gray.500" fontWeight="medium">
                    Store Credit
                  </Text>
                  <Text fontSize="lg" fontWeight="extrabold" color="emerald.700">
                    ₦{creditBalance.toLocaleString()}
                  </Text>
                </Box>
              </GridRow>

              {/* Daily Earning Cap Progress */}
              <Box mt={2.5} p={2} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                    Today's Earning Cap (WAT)
                  </Text>
                  <Text fontSize="11px" fontWeight="bold" color={dailyEarned >= 100 ? "emerald.600" : "primaryColor"}>
                    {dailyEarned} / 100 Pts
                  </Text>
                </Flex>
                <Progress.Root value={Math.min(100, dailyEarned)} size="xs" colorPalette="blue">
                  <Progress.Track borderRadius="full" bg="gray.100">
                    <Progress.Range borderRadius="full" bg="primaryColor" />
                  </Progress.Track>
                </Progress.Root>
              </Box>

              {/* Streak Info */}
              <HStack
                mt={2}
                justify="space-between"
                p={2}
                bg="amber.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="amber.200"
              >
                <HStack gap={1.5}>
                  <IoFlame color="#D97706" size={16} />
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="amber.900">
                      {currentStreak}-Day Learning Streak
                    </Text>
                    {graceActive ? (
                      <Text fontSize="10px" color="amber.700">
                        🛡️ Grace period active for 1 missed day
                      </Text>
                    ) : (
                      <Text fontSize="10px" color="amber.700">
                        Log in daily to unlock +50 & +250 Pts bonuses!
                      </Text>
                    )}
                  </Box>
                </HStack>
              </HStack>
            </Box>

            {/* Quick Conversion Box */}
            <Stack p={3} gap={2} bg="white" borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs" fontWeight="bold" color="primaryColor">
                ⚡ Quick Points Conversion (100 Pts = ₦1,000)
              </Text>

              <HStack gap={1.5}>
                {[100, 200, 500].map((pts) => (
                  <Button
                    key={pts}
                    size="xs"
                    variant={convertAmount === pts ? "solid" : "outline"}
                    colorPalette="blue"
                    bg={convertAmount === pts ? "primaryColor" : undefined}
                    borderRadius="md"
                    flex="1"
                    onClick={() => setConvertAmount(pts)}
                  >
                    {pts} Pts (₦{(pts * 10).toLocaleString()})
                  </Button>
                ))}
              </HStack>

              <Button
                w="full"
                size="sm"
                bg="primaryColor"
                color="white"
                _hover={{ bg: "#1852B2" }}
                borderRadius="xl"
                loading={actionLoading}
                disabled={pointsBalance < convertAmount || actionLoading}
                onClick={() => handleQuickConvert(convertAmount)}
              >
                Convert {convertAmount} Pts to ₦{(convertAmount * 10).toLocaleString()} Credit
              </Button>

              <Text fontSize="10px" color="gray.400" textAlign="center">
                Rolling 12-month expiry applies to earning transactions. Store credit can be applied on subscription checkout.
              </Text>
            </Stack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const GridRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Flex gap={2}>{children}</Flex>
);
