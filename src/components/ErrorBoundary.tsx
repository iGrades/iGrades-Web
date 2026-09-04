import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Heading, Text, Button, VStack, HStack, Code } from "@chakra-ui/react";
import { FiRefreshCw, FiHome } from "react-icons/fi";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={6}
        >
          <VStack
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            boxShadow="xl"
            maxW="500px"
            w="full"
            textAlign="center"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box
              w={16}
              h={16}
              borderRadius="full"
              bg="red.50"
              color="red.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="28px"
              fontWeight="bold"
            >
              !
            </Box>

            <Heading size="md" color="gray.800" mt={2}>
              Something went wrong
            </Heading>

            <Text fontSize="sm" color="gray.600" mt={1}>
              The application encountered an unexpected issue while rendering this page.
            </Text>

            {this.state.error && (
              <Box
                w="full"
                maxH="120px"
                overflowY="auto"
                bg="gray.50"
                p={3}
                borderRadius="md"
                textAlign="left"
                border="1px solid"
                borderColor="gray.200"
                mt={2}
              >
                <Code fontSize="xs" colorPalette="red" wordBreak="break-word">
                  {this.state.error.message || String(this.state.error)}
                </Code>
              </Box>
            )}

            <HStack gap={3} mt={6} w="full">
              <Button
                flex={1}
                variant="outline"
                colorPalette="gray"
                onClick={this.handleReload}
                size="sm"
                borderRadius="lg"
              >
                <FiRefreshCw />
                Reload Page
              </Button>
              <Button
                flex={1}
                bg="#206CE1"
                color="white"
                _hover={{ bg: "blue.700" }}
                onClick={this.handleReset}
                size="sm"
                borderRadius="lg"
              >
                <FiHome />
                Go to Home
              </Button>
            </HStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
