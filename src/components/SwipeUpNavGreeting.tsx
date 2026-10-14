import React, { useState, useEffect } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface SwipeUpNavGreetingProps {
  firstName?: string;
  pageTitle: string;
  subtitleGreeting?: string;
  subtitlePage?: string;
  minW?: any;
}

export const SwipeUpNavGreeting: React.FC<SwipeUpNavGreetingProps> = ({
  firstName,
  pageTitle,
  subtitleGreeting,
  subtitlePage,
  minW = { base: "110px", sm: "160px" },
}) => {
  const [mode, setMode] = useState<"greeting" | "page">("greeting");
  const [cycle, setCycle] = useState(0);
  const [prevView, setPrevView] = useState<{ mode: "greeting" | "page"; cycle: number } | null>(null);

  // Capitalize first name cleanly
  const cleanFirstName = firstName
    ? firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1)
    : "";

  const greetingHeadline = cleanFirstName ? `Hello ${cleanFirstName}` : "Hello";

  useEffect(() => {
    // 5 seconds for greeting, 10 seconds for current page title
    const duration = mode === "greeting" ? 5000 : 10000;

    const timer = setTimeout(() => {
      setPrevView({ mode, cycle });
      setMode((prev) => (prev === "greeting" ? "page" : "greeting"));
      setCycle((c) => c + 1);
    }, duration);

    return () => clearTimeout(timer);
  }, [mode, cycle]);

  // Clean up previous view after swipe-up exit animation finishes (450ms)
  useEffect(() => {
    if (!prevView) return;
    const cleanupTimer = setTimeout(() => {
      setPrevView(null);
    }, 450);
    return () => clearTimeout(cleanupTimer);
  }, [prevView]);

  return (
    <Box minW={minW}>
      {/* Viewport container with fixed height for headline swipe up */}
      <Box position="relative" h={{ base: "20px", sm: "24px" }} overflow="hidden">
        {/* Exiting View (slides up and out) */}
        {prevView && (
          <Box
            key={`prev-${prevView.mode}-${prevView.cycle}`}
            position="absolute"
            inset={0}
            w="full"
            className="animate-swipe-up-exit"
            display="flex"
            alignItems="center"
          >
            <Heading
              as="h1"
              fontSize={{ base: "sm", sm: "md" }}
              fontWeight="bold"
              color="gray.800"
              lineHeight="1.2"
              whiteSpace="nowrap"
            >
              {prevView.mode === "greeting" ? (
                <>
                  {greetingHeadline}{" "}
                  <span className="animate-wave-hand-once" role="img" aria-label="waving hand">
                    👋
                  </span>
                </>
              ) : (
                pageTitle
              )}
            </Heading>
          </Box>
        )}

        {/* Entering / Current View (slides up from bottom) */}
        <Box
          key={`current-${mode}-${cycle}`}
          position={prevView ? "absolute" : "relative"}
          inset={0}
          w="full"
          className={prevView ? "animate-swipe-up-enter" : ""}
          display="flex"
          alignItems="center"
        >
          <Heading
            as="h1"
            fontSize={{ base: "sm", sm: "md" }}
            fontWeight="bold"
            color="gray.800"
            lineHeight="1.2"
            whiteSpace="nowrap"
          >
            {mode === "greeting" ? (
              <>
                {greetingHeadline}{" "}
                <span className="animate-wave-hand-once" role="img" aria-label="waving hand">
                  👋
                </span>
              </>
            ) : (
              pageTitle
            )}
          </Heading>
        </Box>
      </Box>

      {/* Subtitle */}
      {(subtitleGreeting || subtitlePage) && (
        <Text
          fontSize="11px"
          color="gray.500"
          display={{ base: "none", sm: "block" }}
          whiteSpace="nowrap"
          transition="opacity 0.3s ease"
        >
          {mode === "greeting" ? subtitleGreeting : subtitlePage}
        </Text>
      )}
    </Box>
  );
};

export default SwipeUpNavGreeting;
