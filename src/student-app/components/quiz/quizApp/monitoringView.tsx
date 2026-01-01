import { memo } from "react";
import { Box, Text, HStack, VStack } from "@chakra-ui/react";

interface MonitoringViewProps {
  hasWebcamAccess: boolean;
  hasScreenAccess: boolean;
  hasAudioAccess: boolean;
  showMonitoring: boolean;
  setWebcamNode: (node: HTMLVideoElement | null) => void;
  setScreenNode: (node: HTMLVideoElement | null) => void;
  toggleMonitoring: () => void;
  handleManualPlay: () => void;
}

export const MonitoringView = memo(({
  hasWebcamAccess,
  hasScreenAccess,
  hasAudioAccess,
  showMonitoring,
  setWebcamNode,
  setScreenNode,
}: MonitoringViewProps) => {

  return (
    <>
      {/* Background Screen Share (Invisible but active) */}
      <video
        ref={setScreenNode}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
      />

      {showMonitoring && (
        <VStack
          position="fixed"
          left="5px"
          top="85px"
          zIndex={1000}
          align="stretch"
          gap={2}
          width="135px"
        >
          {/* Webcam Feed */}
          {hasWebcamAccess && (
            <Box
              width="135px"
              height="85px"
              bg="black"
              borderRadius="lg"
              boxShadow="xl"
              overflow="hidden"
              border="2px solid"
              borderColor="primaryColor"
              userSelect="none"
              position="relative"
            >
              <video
                ref={setWebcamNode}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
              />
              
              {/* Top Overlay Indicator */}
              <Box
                position="absolute"
                top="0"
                width="100%"
                height="20px"
                bgGradient="to-b"
                gradientFrom="blackAlpha.800"
                gradientTo="transparent"
                px={2}
                pt={1}
              >
                <HStack gap={1}>
                  <Box boxSize="4px" borderRadius="full" bg="red.500" />
                  <Text fontSize="8px" color="white" fontWeight="bold" letterSpacing="wider">LIVE</Text>
                </HStack>
              </Box>
            </Box>
          )}

          {/* Compact Status List (Under Webcam) */}
          <VStack 
            align="stretch" 
            gap={1} 
            p={2} 
            bg="whiteAlpha.900" 
            borderRadius="md" 
            boxShadow="xs"
            border="1px solid"
            borderColor="gray.100"
          >
            <HStack gap={2}>
              <Box boxSize="6px" borderRadius="full" bg={hasWebcamAccess ? "green.500" : "red.500"} />
              <Text fontSize="9px" fontWeight="bold" color="gray.700">Webcam</Text>
            </HStack>
            
            <HStack gap={2}>
              <Box boxSize="6px" borderRadius="full" bg={hasScreenAccess ? "green.500" : "red.500"} />
              <Text fontSize="9px" fontWeight="bold" color="gray.700">Screen</Text>
            </HStack>
            
            <HStack gap={2}>
              <Box boxSize="6px" borderRadius="full" bg={hasAudioAccess ? "green.500" : "red.500"} />
              <Text fontSize="9px" fontWeight="bold" color="gray.700">Audio</Text>
            </HStack>
          </VStack>
        </VStack>
      )}
    </>
  );
});

MonitoringView.displayName = "MonitoringView";