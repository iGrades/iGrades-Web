import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  HStack,
  Heading,
  Text,
  Dialog,
  Portal,
  Grid,
} from "@chakra-ui/react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { LuX } from "react-icons/lu";
import { IoGridOutline } from "react-icons/io5";
import type { QuizNavigationProps } from "./types";

export const QuizNavigation = ({
  questions,
  currentQuestionIndex,
  answers,
  isSubjectCompleted,
  onQuestionSelect,
  onPrevious,
  onNext,
}: QuizNavigationProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const isLastQuestionInSubject = currentQuestionIndex === questions.length - 1;

  // Calculate answered count for current subject
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== ""
  ).length;

  const renderQuestionButtons = (isModal: boolean = false) => {
    return questions.map((_, index) => {
      const isAnswered =
        answers[questions[index].id] !== undefined &&
        answers[questions[index].id] !== "";
      const isCurrent = index === currentQuestionIndex;

      let bg = "white";
      let color = "on_backgroundColor";
      let border = "1px solid #E2E8F0";

      if (isAnswered && isCurrent) {
        bg = "primaryColor";
        color = "white";
        border = "2px solid #134DB3";
      } else if (isCurrent) {
        bg = "white";
        color = "primaryColor";
        border = "2px solid #206CE1";
      } else if (isAnswered) {
        bg = "blue.50";
        color = "primaryColor";
        border = "1px solid #93C5FD";
      }

      return (
        <Button
          key={index}
          size={isModal ? "md" : "sm"}
          bg={bg}
          color={color}
          border={border}
          onClick={() => {
            onQuestionSelect(index);
            if (isModal) setIsPaletteOpen(false);
          }}
          fontWeight={isCurrent || isAnswered ? "bold" : "normal"}
          minW={isModal ? "44px" : "32px"}
          h={isModal ? "44px" : "32px"}
          p={0}
          borderRadius={isModal ? "xl" : "md"}
          _hover={{ opacity: 0.85 }}
          _active={{ transform: "scale(0.95)" }}
          position="relative"
        >
          <Heading fontSize={isModal ? "sm" : "xs"}>{index + 1}</Heading>
          {isAnswered && isModal && (
            <Box
              position="absolute"
              top="3px"
              right="3px"
              w="6px"
              h="6px"
              borderRadius="full"
              bg="primaryColor"
            />
          )}
        </Button>
      );
    });
  };

  return (
    <Box m="auto" mt={{ base: 4, md: 6 }} w="full" maxW="5xl">
      {/* ── Desktop Question Number Ribbon ── */}
      <Box display={{ base: "none", md: "block" }} mb={4}>
        <HStack gap={2} wrap="wrap" justify="start">
          {renderQuestionButtons(false)}
        </HStack>
      </Box>

      {/* ── Navigation Controls Container ── */}
      {/* On mobile: Fixed sticky bottom bar with safe area */}
      <Box
        position={{ base: "fixed", md: "static" }}
        bottom={0}
        left={0}
        right={0}
        bg={{ base: "rgba(255, 255, 255, 0.95)", md: "transparent" }}
        backdropFilter={{ base: "blur(12px)", md: "none" }}
        borderTop={{ base: "1px solid #E2E8F0", md: "none" }}
        boxShadow={{ base: "0 -4px 16px rgba(0,0,0,0.06)", md: "none" }}
        p={{ base: 3, md: 0 }}
        pb={{ base: "max(env(safe-area-inset-bottom, 12px), 12px)", md: 0 }}
        zIndex={1100}
      >
        <Flex
          maxW="5xl"
          mx="auto"
          justify="space-between"
          align="center"
          gap={{ base: 2, sm: 3 }}
        >
          {/* Previous Button */}
          <Button
            variant="outline"
            border="1.5px solid"
            borderColor="primaryColor"
            rounded="xl"
            flex={{ base: 1, md: "initial" }}
            minW={{ md: "120px" }}
            h={{ base: "48px", md: "40px" }}
            color="primaryColor"
            fontWeight={600}
            fontSize="sm"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            _active={{ transform: "scale(0.97)" }}
          >
            <GoArrowLeft size={16} />
            <Text ml={1}>Prev</Text>
          </Button>

          {/* Mobile Question Palette Trigger */}
          <Button
            display={{ base: "flex", md: "none" }}
            variant="subtle"
            colorPalette="blue"
            h="48px"
            px={3}
            rounded="xl"
            alignItems="center"
            gap={1.5}
            onClick={() => setIsPaletteOpen(true)}
            _active={{ transform: "scale(0.97)" }}
          >
            <IoGridOutline size={18} />
            <Text fontSize="xs" fontWeight="bold">
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </Button>

          {/* Next / Completed Button */}
          <Button
            bg="primaryColor"
            color="white"
            _hover={{ bg: "#1852B2" }}
            rounded="xl"
            flex={{ base: 1, md: "initial" }}
            minW={{ md: "120px" }}
            h={{ base: "48px", md: "40px" }}
            fontWeight={600}
            fontSize="sm"
            onClick={onNext}
            disabled={isSubjectCompleted}
            _active={{ transform: "scale(0.97)" }}
          >
            <Text mr={1}>{isLastQuestionInSubject ? "Finish Subject" : "Next"}</Text>
            <GoArrowRight size={16} />
          </Button>
        </Flex>
      </Box>

      {/* ── Mobile Question Palette Bottom Sheet / Modal ── */}
      <Dialog.Root open={isPaletteOpen} onOpenChange={(e) => setIsPaletteOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="black/50" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              position={{ base: "fixed", md: "relative" }}
              bottom={{ base: 0, md: "auto" }}
              left={{ base: 0, md: "auto" }}
              right={{ base: 0, md: "auto" }}
              m={{ base: 0, md: "auto" }}
              maxW={{ base: "full", sm: "440px" }}
              borderRadius={{ base: "24px 24px 0 0", md: "2xl" }}
              bg="white"
              shadow="2xl"
              overflow="hidden"
              p={4}
              pb="max(env(safe-area-inset-bottom, 16px), 16px)"
            >
              {/* Grab handle for touch ergonomics */}
              <Box
                display={{ base: "block", md: "none" }}
                w="40px"
                h="4px"
                borderRadius="full"
                bg="gray.300"
                mx="auto"
                mb={3}
              />

              <Flex justify="space-between" align="center" mb={3}>
                <Box>
                  <Dialog.Title fontSize="md" fontWeight="bold" color="gray.900">
                    Question Palette
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500">
                    {answeredCount} of {questions.length} questions answered
                  </Text>
                </Box>
                <Button
                  size="sm"
                  variant="ghost"
                  p={1}
                  minW="32px"
                  h="32px"
                  borderRadius="full"
                  onClick={() => setIsPaletteOpen(false)}
                >
                  <LuX size={18} />
                </Button>
              </Flex>

              {/* Status Legend */}
              <HStack gap={3} mb={3.5} p={2} bg="gray.50" borderRadius="lg" fontSize="11px">
                <HStack gap={1}>
                  <Box w="10px" h="10px" borderRadius="sm" bg="blue.100" border="1px solid #93C5FD" />
                  <Text color="gray.600">Answered</Text>
                </HStack>
                <HStack gap={1}>
                  <Box w="10px" h="10px" borderRadius="sm" bg="white" border="2px solid #206CE1" />
                  <Text color="gray.600">Current</Text>
                </HStack>
                <HStack gap={1}>
                  <Box w="10px" h="10px" borderRadius="sm" bg="white" border="1px solid #E2E8F0" />
                  <Text color="gray.600">Unanswered</Text>
                </HStack>
              </HStack>

              {/* Responsive Question Grid */}
              <Box maxH="55vh" overflowY="auto" pr={1} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
                <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                  {renderQuestionButtons(true)}
                </Grid>
              </Box>

              <Button
                w="full"
                mt={4}
                h="44px"
                bg="primaryColor"
                color="white"
                borderRadius="xl"
                fontWeight="bold"
                onClick={() => setIsPaletteOpen(false)}
              >
                Return to Question {currentQuestionIndex + 1}
              </Button>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};
