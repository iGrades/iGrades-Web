import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import igradeWhiteIcon from "@/assets/igrades-icon_white-removebg-preview.png";

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 5000,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    let animTimer: NodeJS.Timeout;

    // Load with discrete ranges and pauses: 0 -> 10% -> 25% -> 55% -> 80% -> 100%
    const stepInterval = 100;
    const intervalId = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const ratio = Math.min(1, elapsed / durationMs);

      let currentRangePct = 0;
      if (ratio >= 0.92) {
        currentRangePct = 100;
      } else if (ratio >= 0.72) {
        currentRangePct = 80;
      } else if (ratio >= 0.48) {
        currentRangePct = 55;
      } else if (ratio >= 0.22) {
        currentRangePct = 25;
      } else if (ratio >= 0.06) {
        currentRangePct = 10;
      } else {
        currentRangePct = 0;
      }

      setProgress(currentRangePct);

      if (ratio >= 1) {
        clearInterval(intervalId);
        // Hold briefly at 100% then fade out
        animTimer = setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            onFinish?.();
          }, 450);
        }, 150);
      }
    }, stepInterval);

    return () => {
      clearInterval(intervalId);
      clearTimeout(animTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={999999}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="linear-gradient(180deg, #1865E8 0%, #155DD6 48%, #0F4EB8 100%)"
      opacity={isFading ? 0 : 1}
      transition="opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
      pointerEvents={isFading ? "none" : "auto"}
      userSelect="none"
    >
      {/* Ambient Radial Glow Behind Logo */}
      <Box
        position="absolute"
        top="46%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={{ base: "320px", sm: "400px" }}
        h={{ base: "320px", sm: "400px" }}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%)"
        pointerEvents="none"
      />

      {/* Decorative Layered Curves at the Bottom */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={{ base: "32%", sm: "36%" }}
        pointerEvents="none"
        overflow="hidden"
      >
        <svg
          viewBox="0 0 500 240"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Back Wave Layer */}
          <path
            d="M-20,120 C120,40 260,200 520,90 L520,260 L-20,260 Z"
            fill="#1044A5"
            opacity="0.45"
          />
          {/* Middle Wave Layer */}
          <path
            d="M-30,170 C140,110 300,220 530,130 L530,260 L-30,260 Z"
            fill="#0D3B92"
            opacity="0.65"
          />
          {/* Foreground Bottom-Right Curve */}
          <path
            d="M80,240 C240,150 380,240 520,170 L520,260 L80,260 Z"
            fill="#092F78"
            opacity="0.55"
          />
        </svg>
      </Box>

      {/* Center Content: 3D iGrades Logo + Horizontal Loading Range */}
      <Box
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        transform="translateY(-14px)"
        px={4}
      >
        {/* Strictly uses src/assets/igrades-icon white.png without any fallback icon */}
        <Box
          w={{ base: "116px", sm: "132px" }}
          h={{ base: "116px", sm: "132px" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="transform 0.4s ease"
        >
          <img
            src={igradeWhiteIcon}
            alt="iGrades"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 14px 32px rgba(10, 40, 110, 0.38))",
              userSelect: "none",
            }}
          />
        </Box>

        {/* Loading Range (Thick horizontal progress bar pill with stepped range loading) */}
        <Box
          mt={{ base: "48px", sm: "56px" }}
          w={{ base: "210px", sm: "240px" }}
          h="7.5px"
          bg="rgba(16, 68, 165, 0.85)"
          borderRadius="full"
          overflow="hidden"
          boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.3)"
          position="relative"
        >
          <Box
            h="full"
            w={`${progress}%`}
            bg="#FFFFFF"
            borderRadius="full"
            boxShadow="0 0 12px rgba(255, 255, 255, 0.85)"
            transition="width 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SplashScreen;
