import { memo } from "react";
import { Box, Text, HStack, VStack, Badge } from "@chakra-ui/react";
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
}

export const MonitoringView = memo(({
  hasWebcamAccess,
  hasScreenAccess,
  hasAudioAccess,
  showMonitoring,
  setWebcamNode,
  setScreenNode,
  proctorStatus,
}: MonitoringViewProps) => {
  const getProctorBadge = () => {
    if (!proctorStatus || !proctorStatus.isModelReady) {
      return { label: "AI Readying...", color: "gray.500", bg: "gray.100" };
    }
    if (proctorStatus.detectedObjects.length > 0) {
      return {
        label: proctorStatus.detectedObjects[0],
        color: "red.600",
        bg: "red.50",
      };
    }
    switch (proctorStatus.faceStatus) {
      case "centered":
        return { label: "Face Centered", color: "green.600", bg: "green.50" };
      case "turned":
        return { label: "Head Shifted", color: "orange.600", bg: "orange.50" };
      case "multiple":
        return { label: "2+ People Detected", color: "red.600", bg: "red.50" };
      case "missing":
        return { label: "No Face Detected", color: "red.600", bg: "red.50" };
      default:
        return { label: "AI Active", color: "green.600", bg: "green.50" };
    }
  };

  const proctorBadge = getProctorBadge();

  return (
    <>
      {/* Background Screen Share (Invisible but active) */}
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
        <VStack
          position="fixed"
          left="10px"
          top="80px"
          zIndex={1000}
          align="stretch"
          gap={2}
          width="150px"
        >
          {/* Webcam Feed */}
          {hasWebcamAccess && (
            <Box
              width="150px"
              height="95px"
              bg="black"
              borderRadius="lg"
              boxShadow="xl"
              overflow="hidden"
              border="2px solid"
              borderColor={
                proctorStatus?.faceStatus === "turned"
                  ? "orange.400"
                  : proctorStatus?.faceStatus === "multiple" ||
                    proctorStatus?.faceStatus === "missing" ||
                    (proctorStatus?.detectedObjects.length ?? 0) > 0
                  ? "red.500"
                  : "blue.500"
              }
              userSelect="none"
              position="relative"
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

              {/* Top Overlay Indicator */}
              <Box
                position="absolute"
                top="0"
                width="100%"
                height="22px"
                bgGradient="to-b"
                gradientFrom="blackAlpha.800"
                gradientTo="transparent"
                px={2}
                pt={1}
              >
                <HStack justify="space-between" align="center">
                  <HStack gap={1}>
                    <Box boxSize="5px" borderRadius="full" bg="red.500" />
                    <Text
                      fontSize="9px"
                      color="white"
                      fontWeight="bold"
                      letterSpacing="wider"
                    >
                      LIVE PROCTOR
                    </Text>
                  </HStack>
                </HStack>
              </Box>

              {/* Bottom Alert Overlay (if warning) */}
              {(proctorStatus?.faceStatus === "turned" ||
                proctorStatus?.faceStatus === "multiple" ||
                proctorStatus?.faceStatus === "missing" ||
                (proctorStatus?.detectedObjects.length ?? 0) > 0) && (
                <Box
                  position="absolute"
                  bottom="0"
                  width="100%"
                  bg="blackAlpha.800"
                  py="2px"
                  px={1}
                  textAlign="center"
                >
                  <Text
                    fontSize="8px"
                    fontWeight="bold"
                    color={
                      proctorStatus?.faceStatus === "turned"
                        ? "orange.300"
                        : "red.300"
                    }
                    lineClamp={1}
                  >
                    ⚠️ {proctorBadge.label}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Compact Status List (Under Webcam) */}
          <VStack
            align="stretch"
            gap={1}
            p={2}
            bg="whiteAlpha.950"
            borderRadius="md"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between">
              <HStack gap={1.5}>
                <Box
                  boxSize="6px"
                  borderRadius="full"
                  bg={hasWebcamAccess ? "green.500" : "red.500"}
                />
                <Text fontSize="10px" fontWeight="semibold" color="gray.700">
                  Camera
                </Text>
              </HStack>
              <Text fontSize="9px" color={hasWebcamAccess ? "green.600" : "red.500"}>
                {hasWebcamAccess ? "ON" : "OFF"}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <HStack gap={1.5}>
                <Box
                  boxSize="6px"
                  borderRadius="full"
                  bg={hasScreenAccess ? "green.500" : "red.500"}
                />
                <Text fontSize="10px" fontWeight="semibold" color="gray.700">
                  Screen
                </Text>
              </HStack>
              <Text fontSize="9px" color={hasScreenAccess ? "green.600" : "red.500"}>
                {hasScreenAccess ? "SHARED" : "OFF"}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <HStack gap={1.5}>
                <Box
                  boxSize="6px"
                  borderRadius="full"
                  bg={hasAudioAccess ? "green.500" : "red.500"}
                />
                <Text fontSize="10px" fontWeight="semibold" color="gray.700">
                  Microphone
                </Text>
              </HStack>
              <Text fontSize="9px" color={hasAudioAccess ? "green.600" : "red.500"}>
                {hasAudioAccess ? "ACTIVE" : "OFF"}
              </Text>
            </HStack>

            {/* AI Vision & Head Pose Status */}
            <Box pt={1} borderTop="1px solid" borderColor="gray.100">
              <HStack justify="space-between" align="center">
                <Text fontSize="9px" fontWeight="bold" color="gray.600">
                  AI Proctor:
                </Text>
                <Badge
                  size="xs"
                  fontSize="8px"
                  px={1}
                  py={0.5}
                  colorPalette={
                    proctorBadge.color.startsWith("green")
                      ? "green"
                      : proctorBadge.color.startsWith("orange")
                      ? "orange"
                      : "red"
                  }
                >
                  {proctorBadge.label}
                </Badge>
              </HStack>
            </Box>
          </VStack>
        </VStack>
      )}
    </>
  );
});

MonitoringView.displayName = "MonitoringView";
