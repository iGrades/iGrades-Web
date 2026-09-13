import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import favIco from "@/assets/fav_ico.png";

export interface DancingLogoLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  minH?: string | number;
  compact?: boolean;
  isCard?: boolean;
  color?: string;
  showIcon?: boolean;
}

const sizeConfig = {
  xs: {
    iconH: "13px",
    fontSize: "13px",
    cursorH: "11px",
    cursorW: "1.5px",
    textPt: "10px",
    gap: 1,
  },
  sm: {
    iconH: "16px",
    fontSize: "16px",
    cursorH: "13px",
    cursorW: "2px",
    textPt: "11px",
    gap: 1.5,
  },
  md: {
    iconH: "20px",
    fontSize: "19px",
    cursorH: "15px",
    cursorW: "2px",
    textPt: "12px",
    gap: 2,
  },
  lg: {
    iconH: "26px",
    fontSize: "24px",
    cursorH: "19px",
    cursorW: "2.5px",
    textPt: "13px",
    gap: 2.5,
  },
  xl: {
    iconH: "32px",
    fontSize: "30px",
    cursorH: "23px",
    cursorW: "3px",
    textPt: "14px",
    gap: 3,
  },
};

const FULL_LOGO_TEXT = "iGrades";

export const DancingLogoLoader: React.FC<DancingLogoLoaderProps> = ({
  size = "md",
  text,
  subtext,
  fullScreen = false,
  minH = "110px",
  compact = false,
  isCard = false,
  color = "primaryColor",
  showIcon = true,
}) => {
  const config = sizeConfig[size] || sizeConfig.md;
  const [typedCount, setTypedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && typedCount < FULL_LOGO_TEXT.length) {
      // Typing forward letter by letter
      timer = setTimeout(() => {
        setTypedCount((prev) => prev + 1);
      }, 140);
    } else if (!isDeleting && typedCount === FULL_LOGO_TEXT.length) {
      // Pause at fully typed logo letters
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1200);
    } else if (isDeleting && typedCount > 0) {
      // Backspace letters
      timer = setTimeout(() => {
        setTypedCount((prev) => prev - 1);
      }, 60);
    } else if (isDeleting && typedCount === 0) {
      // Pause briefly before typing again
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [typedCount, isDeleting]);

  const currentTypedText = FULL_LOGO_TEXT.slice(0, typedCount);
  const isComplete = typedCount === FULL_LOGO_TEXT.length;
  const letterColor = color === "primaryColor" ? "#206CE1" : color;

  const content = (
    <VStack gap={config.gap} align="center" justify="center" py={compact ? 1 : 2.5}>
      {/* Logo Letters Typing Container */}
      <HStack
        gap={{ base: 1.5, md: 2 }}
        align="center"
        justify="center"
        className={isComplete ? "animate-logo-letters-complete" : ""}
      >
        {/* Logo Emblem Icon */}
        {showIcon && (
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            transition="transform 0.3s ease"
            _hover={{ transform: "scale(1.05)" }}
          >
            <img
              src={favIco}
              alt="iGrades Icon"
              style={{
                height: config.iconH,
                width: "auto",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
              referrerPolicy="no-referrer"
            />
          </Box>
        )}

        {/* Typing Letters with invisible spacer to prevent jitter */}
        <Box position="relative" display="inline-flex" alignItems="center">
          {/* Ghost element reserving exact width & height */}
          <Text
            fontFamily="'Lexend', 'Plus Jakarta Sans', sans-serif"
            fontSize={config.fontSize}
            fontWeight="800"
            letterSpacing="-0.025em"
            lineHeight="1"
            visibility="hidden"
            aria-hidden="true"
            userSelect="none"
          >
            {FULL_LOGO_TEXT}
          </Text>

          {/* Rendered Typed Letters (Unified Color for all letters) */}
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            display="flex"
            alignItems="center"
          >
            <Text
              fontFamily="'Lexend', 'Plus Jakarta Sans', sans-serif"
              fontSize={config.fontSize}
              fontWeight="800"
              letterSpacing="-0.025em"
              lineHeight="1"
              color={letterColor}
              userSelect="none"
              display="inline-flex"
              alignItems="baseline"
            >
              {currentTypedText}
            </Text>

            {/* Blinking typing caret */}
            <Box
              w={config.cursorW}
              h={config.cursorH}
              bg={letterColor}
              ml="2px"
              borderRadius="full"
              className="animate-typing-cursor"
            />
          </Box>
        </Box>
      </HStack>

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
        bg="rgba(255, 255, 255, 0.92)"
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

export const TypingLogoLoader = DancingLogoLoader;
export default DancingLogoLoader;

