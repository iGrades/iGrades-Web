import React from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import logoImg from "@/assets/logo.png";

export interface DancingLogoLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  minH?: string | number;
  compact?: boolean;
  isCard?: boolean;
  color?: string;
}

const sizeConfig = {
  xs: { imgHeight: "22px", shadowWidth: "20px", textPt: "11px", gap: 1 },
  sm: { imgHeight: "34px", shadowWidth: "30px", textPt: "12px", gap: 2 },
  md: { imgHeight: "52px", shadowWidth: "46px", textPt: "14px", gap: 3 },
  lg: { imgHeight: "76px", shadowWidth: "68px", textPt: "16px", gap: 4 },
  xl: { imgHeight: "105px", shadowWidth: "90px", textPt: "18px", gap: 5 },
};

export const DancingLogoLoader: React.FC<DancingLogoLoaderProps> = ({
  size = "md",
  text,
  subtext,
  fullScreen = false,
  minH = "160px",
  compact = false,
  isCard = false,
  color = "blue.600",
}) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <VStack gap={config.gap} align="center" justify="center" py={compact ? 2 : 4}>
      {/* Dancing Logo Container */}
      <Box position="relative" display="inline-flex" flexDirection="column" alignItems="center" pt={4}>
        {/* Animated Dancing Logo */}
        <Box
          className="animate-logo-dance"
          style={{ willChange: "transform, filter" }}
        >
          <img
            src={logoImg}
            alt="iGrade Logo Loading"
            style={{
              height: config.imgHeight,
              width: "auto",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
            }}
            referrerPolicy="no-referrer"
          />
        </Box>

        {/* Dynamic Dancing Shadow underneath */}
        <Box
          className="animate-shadow-dance"
          mt={1.5}
          h="5px"
          w={config.shadowWidth}
          borderRadius="full"
          bg="radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0) 75%)"
          style={{ willChange: "transform, opacity" }}
        />
      </Box>

      {/* Optional Loading Text */}
      {text && (
        <VStack gap={1} align="center" mt={1}>
          <Text
            fontSize={config.textPt}
            fontWeight="600"
            color={color}
            letterSpacing="-0.01em"
            textAlign="center"
          >
            {text}
          </Text>
          {subtext && (
            <Text fontSize="11px" color="gray.500" maxW="280px" textAlign="center">
              {subtext}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Flex
        position="fixed"
        inset={0}
        zIndex={9999}
        bg="rgba(255, 255, 255, 0.88)"
        backdropFilter="blur(8px)"
        align="center"
        justify="center"
        p={4}
      >
        <Box
          p={6}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)"
        >
          {content}
        </Box>
      </Flex>
    );
  }

  if (isCard) {
    return (
      <Flex
        w="full"
        minH={minH}
        align="center"
        justify="center"
        p={6}
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
      >
        {content}
      </Flex>
    );
  }

  return (
    <Flex w="full" minH={minH} align="center" justify="center" p={2}>
      {content}
    </Flex>
  );
};

export default DancingLogoLoader;
