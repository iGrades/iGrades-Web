import { memo, useState } from "react";
import { Box, Text, HStack, VStack, Badge, IconButton } from "@chakra-ui/react";
import { FiX, FiVideo, FiMic, FiMonitor, FiShield } from "react-icons/fi";
import type { AIProctoringStatus } from "@/hooks/useAIProctoring";

interface MonitoringViewProps {
  hasWebcamAccess: boolean;
  hasScreenAccess: boolean;
  hasAudioAccess: boolean;
  showMonitoring: boolean;
  setWebcamNode: (node: HTMLVideoElement | null) => void;
  setScreenNode: (node: HTMLVideoElement | null) => void;
  toggleMonitoring?: () => void;
  handleManualPlay?: () => void;
  cheatingScore?: number;
  reportInfraction?: (type: any, message?: string) => void;
  proctorStatus?: AIProctoringStatus;
  effectivePlan?: string;
  isScreenShareSupported?: boolean;
  bypassedScreenShare?: boolean;
}

export const MonitoringView = memo(({
  hasWebcamAccess,
  hasScreenAccess,
  hasAudioAccess,
  showMonitoring,
  setWebcamNode,
  setScreenNode,
  proctorStatus,
  effectivePlan,
  isScreenShareSupported = true,
  bypassedScreenShare = false,
}: MonitoringViewProps) => {
  const [showDetailsPopover, setShowDetailsPopover] = useState(false);

  const getProctorBadge = () => {
    if (!proctorStatus || !proctorStatus.isModelReady) {
      return {
        label: "AI Readying...",
        shortLabel: "Readying",
        color: "#475569",
        bg: "#F1F5F9",
        dot: "#94A3B8",
      };
    }
    if (proctorStatus.detectedObjects.length > 0) {
      return {
        label: proctorStatus.detectedObjects[0],
        shortLabel: proctorStatus.detectedObjects[0],
        color: "#B91C1C",
        bg: "#FEF2F2",
        dot: "#EF4444",
      };
    }
    switch (proctorStatus.faceStatus) {
      case "centered":
        return {
          label: "Face Centered",
          shortLabel: "Centered",
          color: "#047857",
          bg: "#ECFDF5",
          dot: "#10B981",
        };
      case "turned":
        return {
          label: "Head Shifted",
          shortLabel: "Shifted",
          color: "#B45309",
          bg: "#FFFBEB",
          dot: "#F59E0B",
        };
      case "multiple":
        return {
          label: "2+ People Detected",
          shortLabel: "Multiple",
          color: "#B91C1C",
          bg: "#FEF2F2",
          dot: "#EF4444",
        };
      case "missing":
        return {
          label: "No Face Detected",
          shortLabel: "No Face",
          color: "#B91C1C",
          bg: "#FEF2F2",
          dot: "#EF4444",
        };
      default:
        return {
          label: "AI Active",
          shortLabel: "Active",
          color: "#047857",
          bg: "#ECFDF5",
          dot: "#10B981",
        };
    }
  };

  const proctorBadge = getProctorBadge();

  const borderColor =
    proctorStatus?.faceStatus === "turned"
      ? "#F59E0B"
      : proctorStatus?.faceStatus === "multiple" ||
        proctorStatus?.faceStatus === "missing" ||
        (proctorStatus?.detectedObjects.length ?? 0) > 0
      ? "#EF4444"
      : "#10B981";

  return (
    <>
      {/* Background Screen Share (Active in DOM but invisible) */}
      <video
        ref={setScreenNode}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {showMonitoring && (
        <HStack
          position="relative"
          align="center"
          gap={{ base: 1.5, sm: 2 }}
          py={0.5}
        >
          {/* Mini Live Webcam Stream in Topbar */}
          {hasWebcamAccess && (
            <Box
              w={{ base: "48px", sm: "58px", md: "68px" }}
              h={{ base: "30px", sm: "36px", md: "40px" }}
              bg="black"
              borderRadius="md"
              overflow="hidden"
              border="2px solid"
              borderColor={borderColor}
              position="relative"
              cursor="pointer"
              onClick={() => setShowDetailsPopover((prev) => !prev)}
              title="Click to view AI Proctoring details"
              flexShrink={0}
              boxShadow="xs"
              transition="transform 0.15s ease"
              _hover={{ transform: "scale(1.04)" }}
            >
              <video
                ref={setWebcamNode}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />

              {/* Mini Top Overlay Tag */}
              <Box
                position="absolute"
                top="1px"
                left="2px"
                bg="blackAlpha.800"
                px="3px"
                py="0.5px"
                borderRadius="xs"
                display="flex"
                alignItems="center"
                gap="2px"
              >
                <Box
                  boxSize="4px"
                  borderRadius="full"
                  bg="red.500"
                />
                <Text
                  fontSize="7px"
                  fontWeight="800"
                  color="white"
                  letterSpacing="0.03em"
                >
                  LIVE
                </Text>
              </Box>

              {/* Warning tag if head shifted or face missing */}
              {(proctorStatus?.faceStatus === "turned" ||
                proctorStatus?.faceStatus === "multiple" ||
                proctorStatus?.faceStatus === "missing" ||
                (proctorStatus?.detectedObjects.length ?? 0) > 0) && (
                <Box
                  position="absolute"
                  bottom="0"
                  width="100%"
                  bg="blackAlpha.800"
                  px={0.5}
                  textAlign="center"
                >
                  <Text
                    fontSize="6.5px"
                    fontWeight="800"
                    color={
                      proctorStatus?.faceStatus === "turned"
                        ? "orange.300"
                        : "red.300"
                    }
                    noOfLines={1}
                  >
                    ⚠️ {proctorBadge.shortLabel}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Compact Proctor Status Pill Button */}
          <Box
            as="button"
            onClick={() => setShowDetailsPopover((prev) => !prev)}
            px={{ base: 1.5, sm: 2 }}
            py={1}
            borderRadius="full"
            bg={proctorBadge.bg}
            color={proctorBadge.color}
            border="1px solid"
            borderColor={borderColor}
            cursor="pointer"
            display="flex"
            alignItems="center"
            gap={1}
            transition="all 0.15s ease"
            _hover={{ opacity: 0.85 }}
            title="Click to view sensor diagnostics"
          >
            <Box boxSize="6px" borderRadius="full" bg={proctorBadge.dot} flexShrink={0} />
            <Text
              fontSize={{ base: "9px", sm: "10.5px", md: "11px" }}
              fontWeight="700"
              lineHeight="1"
              whiteSpace="nowrap"
            >
              <Text as="span" display={{ base: "none", md: "inline" }}>
                AI Proctor:{" "}
              </Text>
              <Text as="span" display={{ base: "inline", sm: "none" }}>
                {proctorBadge.shortLabel}
              </Text>
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                {proctorBadge.label}
              </Text>
            </Text>
          </Box>

          {/* Expandable Diagnostic Popover Card */}
          {showDetailsPopover && (
            <>
              {/* Invisible click-away backdrop */}
              <Box
                position="fixed"
                inset="0"
                zIndex={1200}
                onClick={() => setShowDetailsPopover(false)}
              />

              <Box
                position="absolute"
                top="calc(100% + 6px)"
                left={{ base: "-30px", sm: "0" }}
                zIndex={1201}
                w={{ base: "230px", sm: "260px" }}
                bg="white"
                borderRadius="xl"
                p={3}
                boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                border="1px solid"
                borderColor="gray.200"
                fontSize="11px"
              >
                <Flex justify="space-between" align="center" pb={2} mb={2} borderBottom="1px solid" borderColor="gray.100">
                  <HStack gap={1.5} align="center">
                    <FiShield color="#206CE1" size={14} />
                    <Text fontWeight="800" color="gray.800" fontSize="12px">
                      AI Proctoring Live Status
                    </Text>
                  </HStack>
                  <IconButton
                    aria-label="Close"
                    size="xs"
                    variant="ghost"
                    h="20px"
                    w="20px"
                    minW="20px"
                    onClick={() => setShowDetailsPopover(false)}
                  >
                    <FiX size={12} />
                  </IconButton>
                </Flex>

                <VStack align="stretch" gap={1.5}>
                  <HStack justify="space-between" align="center">
                    <HStack gap={1.5}>
                      <FiVideo size={13} color={hasWebcamAccess ? "#10B981" : "#EF4444"} />
                      <Text color="gray.600" fontWeight="600">Front Camera</Text>
                    </HStack>
                    <Badge colorPalette={hasWebcamAccess ? "green" : "red"} size="xs">
                      {hasWebcamAccess ? "ACTIVE" : "OFF"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <HStack gap={1.5}>
                      <FiMonitor size={13} color={hasScreenAccess || !isScreenShareSupported || bypassedScreenShare ? "#10B981" : "#EF4444"} />
                      <Text color="gray.600" fontWeight="600">Focus & Screen</Text>
                    </HStack>
                    <Badge
                      colorPalette={hasScreenAccess ? "green" : !isScreenShareSupported || bypassedScreenShare ? "blue" : "red"}
                      size="xs"
                    >
                      {hasScreenAccess ? "SHARED" : !isScreenShareSupported || bypassedScreenShare ? "TAB FOCUS" : "OFF"}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <HStack gap={1.5}>
                      <FiMic size={13} color={hasAudioAccess ? "#10B981" : "#EF4444"} />
                      <Text color="gray.600" fontWeight="600">Microphone</Text>
                    </HStack>
                    <Badge colorPalette={hasAudioAccess ? "green" : "red"} size="xs">
                      {hasAudioAccess ? "ACTIVE" : "OFF"}
                    </Badge>
                  </HStack>

                  <Box pt={1.5} borderTop="1px solid" borderColor="gray.100">
                    <HStack justify="space-between" align="center">
                      <Text color="gray.600" fontWeight="700">Head Pose / Gaze:</Text>
                      <Badge
                        size="xs"
                        colorPalette={
                          proctorBadge.color.includes("047857")
                            ? "green"
                            : proctorBadge.color.includes("B45309")
                            ? "orange"
                            : "red"
                        }
                      >
                        {proctorBadge.label}
                      </Badge>
                    </HStack>
                  </Box>

                  {effectivePlan && (
                    <HStack justify="space-between" align="center" pt={1}>
                      <Text color="gray.500" fontSize="10px">Plan Level:</Text>
                      <Badge size="xs" colorPalette={effectivePlan === "premium" ? "purple" : "blue"} variant="subtle">
                        {effectivePlan === "premium" ? "Premium Live Vision" : "Standard Monitoring"}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </>
          )}
        </HStack>
      )}
    </>
  );
});

MonitoringView.displayName = "MonitoringView";
