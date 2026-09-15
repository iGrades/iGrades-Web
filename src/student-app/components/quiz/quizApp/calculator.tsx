import {
  Button,
  Grid,
  GridItem,
  HStack,
  Box,
  Text,
  Badge,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { BsFillCalculatorFill } from "react-icons/bs";
import { LuDelete, LuX } from "react-icons/lu";

type AngleMode = "DEG" | "RAD";

/**
 * Robust Scientific Math Evaluator
 * Supports:
 * - Physics & Chemistry calculations (powers, roots, scientific notation, constants π & e)
 * - Trigonometry with DEG/RAD support & inverses (sin, cos, tan, asin, acos, atan)
 * - Logarithms & Exponentials (log10 for pH calculations, ln & e^x for radioactive half-life & chemical kinetics)
 * - Factorials (n!) & Percentages (%) & Reciprocals (1/x)
 * - Scientific notation via EXP (e.g. 6.022e23 for Avogadro, 1.6e-19 for charge)
 */
function evaluateScientificExpression(
  expression: string,
  angleMode: AngleMode = "DEG",
  lastAnswer: number = 0
): { result: number; display: string } | { error: string } {
  if (!expression || expression.trim() === "") {
    return { result: 0, display: "0" };
  }

  try {
    let clean = expression
      .replace(/Ans/gi, `(${lastAnswer})`)
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√\(/g, "sqrt(")
      .replace(/√(\d+(\.\d+)?)/g, "sqrt($1)")
      .replace(/∛\(/g, "cbrt(")
      .replace(/∛(\d+(\.\d+)?)/g, "cbrt($1)")
      .replace(/π/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");

    // Implicit multiplication:
    // e.g. 2( -> 2*(, )3 -> )*3, )sin -> )*sin, 2π -> 2*Math.PI
    clean = clean.replace(/(\d)\s*(\()/g, "$1*$2");
    clean = clean.replace(/(\))\s*(\d|\()/g, "$1*$2");
    clean = clean.replace(/(\))\s*([a-zA-Zπ])/g, "$1*$2");
    clean = clean.replace(/(\d)\s*(π|sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|fact)/g, "$1*$2");
    clean = clean.replace(/(π)\s*(\d|[a-zA-Z\(])/g, "$1*$2");

    // Powers
    clean = clean.replace(/\^/g, "**");

    // Factorials: 5! -> fact(5)
    clean = clean.replace(/(\d+(\.\d+)?)!/g, "fact($1)");

    // Percentage: 50% -> (50*0.01)
    clean = clean.replace(/(\d+(\.\d+)?)%/g, "($1*0.01)");

    // Auto-close open parentheses
    const openParens = (clean.match(/\(/g) || []).length;
    const closeParens = (clean.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      clean += ")".repeat(openParens - closeParens);
    }

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const sin = (x: number) => {
      if (angleMode === "DEG") {
        const norm = ((x % 360) + 360) % 360;
        if (norm === 0 || norm === 180) return 0;
        if (norm === 90) return 1;
        if (norm === 270) return -1;
        return Math.sin(toRad(x));
      }
      return Math.sin(x);
    };

    const cos = (x: number) => {
      if (angleMode === "DEG") {
        const norm = ((x % 360) + 360) % 360;
        if (norm === 90 || norm === 270) return 0;
        if (norm === 0) return 1;
        if (norm === 180) return -1;
        return Math.cos(toRad(x));
      }
      return Math.cos(x);
    };

    const tan = (x: number) => {
      if (angleMode === "DEG") {
        const norm = ((x % 360) + 360) % 360;
        if (norm === 90 || norm === 270) throw new Error("Undefined (tan 90°)");
        if (norm === 0 || norm === 180) return 0;
        if (norm === 45 || norm === 225) return 1;
        return Math.tan(toRad(x));
      }
      return Math.tan(x);
    };

    const asin = (x: number) => {
      if (x < -1 || x > 1) throw new Error("Domain Error: asin requires -1 to 1");
      return angleMode === "DEG" ? toDeg(Math.asin(x)) : Math.asin(x);
    };

    const acos = (x: number) => {
      if (x < -1 || x > 1) throw new Error("Domain Error: acos requires -1 to 1");
      return angleMode === "DEG" ? toDeg(Math.acos(x)) : Math.acos(x);
    };

    const atan = (x: number) => {
      return angleMode === "DEG" ? toDeg(Math.atan(x)) : Math.atan(x);
    };

    const log = (x: number) => {
      if (x <= 0) throw new Error("Domain Error: log(x) requires x > 0");
      return Math.log10(x);
    };

    const ln = (x: number) => {
      if (x <= 0) throw new Error("Domain Error: ln(x) requires x > 0");
      return Math.log(x);
    };

    const sqrt = (x: number) => {
      if (x < 0) throw new Error("Domain Error: sqrt requires non-negative");
      return Math.sqrt(x);
    };

    const cbrt = (x: number) => Math.cbrt(x);
    const abs = (x: number) => Math.abs(x);
    const exp = (x: number) => Math.exp(x);

    const fact = (n: number) => {
      if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error("Invalid factorial");
      if (n === 0 || n === 1) return 1;
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    };

    const scope: Record<string, any> = {
      Math,
      sin,
      cos,
      tan,
      asin,
      acos,
      atan,
      log,
      ln,
      sqrt,
      cbrt,
      abs,
      exp,
      fact,
    };

    const fn = new Function(...Object.keys(scope), `"use strict"; return (${clean});`);
    const raw = fn(...Object.values(scope));

    if (typeof raw !== "number" || isNaN(raw)) {
      return { error: "Math Error" };
    }
    if (!isFinite(raw)) {
      return { result: raw, display: raw > 0 ? "Infinity" : "-Infinity" };
    }

    const absVal = Math.abs(raw);
    let displayStr: string;
    if (absVal !== 0 && (absVal < 1e-6 || absVal >= 1e11)) {
      displayStr = raw.toExponential(6).replace(/e\+?/, "e");
    } else {
      displayStr = parseFloat(raw.toFixed(10)).toString();
    }

    return { result: raw, display: displayStr };
  } catch (err: any) {
    return { error: err?.message || "Syntax Error" };
  }
}

export const Calculator = () => {
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<string>("");
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [isInverse, setIsInverse] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Clear all
  const handleClear = useCallback(() => {
    setExpression("");
    setErrorMessage(null);
    setHasEvaluated(false);
  }, []);

  // Backspace
  const handleBackspace = useCallback(() => {
    setErrorMessage(null);
    if (hasEvaluated) {
      setExpression("");
      setHasEvaluated(false);
      return;
    }
    setExpression((prev) => {
      if (!prev) return "";
      // Check multi-character function tokens to delete as a unit
      const multiTokens = [
        "asin(",
        "acos(",
        "atan(",
        "sqrt(",
        "cbrt(",
        "sin(",
        "cos(",
        "tan(",
        "log(",
        "ln(",
        "Ans",
      ];
      for (const token of multiTokens) {
        if (prev.endsWith(token)) {
          return prev.slice(0, -token.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, [hasEvaluated]);

  // Calculate result
  const handleCalculate = useCallback(() => {
    if (!expression || expression.trim() === "") return;
    const res = evaluateScientificExpression(expression, angleMode, lastAnswer);
    if ("error" in res) {
      setErrorMessage(res.error);
    } else {
      setHistory(`${expression} =`);
      setExpression(res.display);
      setLastAnswer(res.result);
      setErrorMessage(null);
      setHasEvaluated(true);
    }
  }, [expression, angleMode, lastAnswer]);

  // Handle scientific or numeric key input
  const handleInput = useCallback(
    (val: string) => {
      setErrorMessage(null);

      // If an evaluation just happened and the student enters an operator,
      // continue calculation using previous result
      const isOperator = ["+", "-", "×", "÷", "^", "%"].includes(val);
      if (hasEvaluated) {
        setHasEvaluated(false);
        if (isOperator) {
          setExpression((prev) => prev + val);
          return;
        }
        // If entering a new number or function, start a fresh expression
        setExpression(val);
        return;
      }

      setExpression((prev) => prev + val);
    },
    [hasEvaluated]
  );

  // Toggle plus/minus
  const handleToggleSign = useCallback(() => {
    setErrorMessage(null);
    if (!expression) {
      setExpression("-");
      return;
    }
    if (expression.startsWith("-(")) {
      setExpression((prev) => prev.slice(2, -1));
    } else {
      setExpression((prev) => `-(${prev})`);
    }
  }, [expression]);

  // Keyboard shortcut listener when calculator is active
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if student is in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === "+") {
        e.preventDefault();
        handleInput("+");
      } else if (e.key === "-") {
        e.preventDefault();
        handleInput("-");
      } else if (e.key === "*") {
        e.preventDefault();
        handleInput("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleInput("÷");
      } else if (e.key === "." || e.key === ",") {
        e.preventDefault();
        handleInput(".");
      } else if (e.key === "^") {
        e.preventDefault();
        handleInput("^");
      } else if (e.key === "(" || e.key === ")") {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleInput, handleCalculate, handleBackspace, handleClear]);

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ placement: "bottom-end", offset: { mainAxis: 10, crossAxis: 0 } }}
    >
      <Popover.Trigger asChild>
        <Button
          size="md"
          bg="blue.50"
          color="primaryColor"
          _hover={{ bg: "blue.100" }}
          rounded="lg"
          px={3}
          py={2}
          display="flex"
          alignItems="center"
          gap={2}
          title="Calculator"
        >
          <BsFillCalculatorFill size={16} />
          <Text fontSize="xs" fontWeight="bold" display={{ base: "none", sm: "inline" }}>
            Calculator
          </Text>
        </Button>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            width={{ base: "calc(100vw - 24px)", sm: "350px" }}
            maxW="360px"
            bg="#ffffff"
            shadow="2xl"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            p={0}
            zIndex={2000}
          >
            <Box ref={containerRef} p={3.5} bg="#f8fafc">
              {/* Header Bar */}
              <HStack justify="space-between" align="center" mb={2}>
                <HStack gap={1.5}>
                  <BsFillCalculatorFill className="text-blue-600" size={14} />
                  <Text fontSize="xs" fontWeight="700" color="gray.800">
                    Calculator
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  variant="ghost"
                  p={1}
                  minW="24px"
                  h="24px"
                  onClick={() => setIsOpen(false)}
                >
                  <LuX size={14} />
                </Button>
              </HStack>

              {/* LCD Display */}
              <Box
                bg="#090d16"
                color="#f8fafc"
                p={2.5}
                borderRadius="lg"
                mb={3}
                boxShadow="inset 0 2px 4px rgba(0,0,0,0.5)"
              >
                {/* Status Bar inside LCD */}
                <HStack justify="space-between" align="center" mb={1} fontSize="10px">
                  <HStack gap={1.5}>
                    <Badge
                      size="xs"
                      colorPalette={angleMode === "DEG" ? "green" : "gray"}
                      variant="solid"
                      px={1}
                      py={0}
                      fontSize="9px"
                      cursor="pointer"
                      onClick={() => setAngleMode((m) => (m === "DEG" ? "RAD" : "DEG"))}
                    >
                      {angleMode}
                    </Badge>
                    {isInverse && (
                      <Badge size="xs" colorPalette="yellow" variant="solid" px={1} py={0} fontSize="9px">
                        INV
                      </Badge>
                    )}
                  </HStack>
                  <Text color="gray.400" fontSize="10px" truncate maxW="180px">
                    {lastAnswer !== 0 ? `Ans: ${lastAnswer}` : "Ready"}
                  </Text>
                </HStack>

                {/* History Expression Line */}
                <Text
                  fontSize="11px"
                  color="#94a3b8"
                  textAlign="right"
                  minH="16px"
                  fontFamily="mono"
                  truncate
                >
                  {history || "\u00A0"}
                </Text>

                {/* Current Expression / Result Line */}
                <Text
                  fontSize={expression.length > 18 ? "md" : "xl"}
                  fontWeight="bold"
                  color={errorMessage ? "#f87171" : "#ffffff"}
                  textAlign="right"
                  minH="30px"
                  fontFamily="mono"
                  letterSpacing="wider"
                  wordBreak="break-all"
                >
                  {errorMessage || expression || "0"}
                </Text>
              </Box>

              {/* Calculator Keypad */}
              <Grid templateColumns="repeat(5, 1fr)" gap={1.5}>
                {/* ── Row 1: Mode & Trig ── */}
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant={isInverse ? "solid" : "outline"}
                    colorPalette={isInverse ? "yellow" : "gray"}
                    fontWeight="bold"
                    fontSize="11px"
                    onClick={() => setIsInverse(!isInverse)}
                    title="Toggle Inverse Trigonometric & Secondary Functions"
                  >
                    2nd
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="surface"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="10px"
                    onClick={() => setAngleMode((m) => (m === "DEG" ? "RAD" : "DEG"))}
                    title="Toggle Degree or Radian Angle Mode"
                  >
                    {angleMode}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "asin(" : "sin(")}
                    title={isInverse ? "Arcsine (sin⁻¹)" : "Sine"}
                  >
                    {isInverse ? "sin⁻¹" : "sin"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "acos(" : "cos(")}
                    title={isInverse ? "Arccosine (cos⁻¹)" : "Cosine"}
                  >
                    {isInverse ? "cos⁻¹" : "cos"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "atan(" : "tan(")}
                    title={isInverse ? "Arctangent (tan⁻¹)" : "Tangent"}
                  >
                    {isInverse ? "tan⁻¹" : "tan"}
                  </Button>
                </GridItem>

                {/* ── Row 2: Constants, Logs & Reciprocal ── */}
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="12px"
                    onClick={() => handleInput("π")}
                    title="Pi constant (3.14159...)"
                  >
                    π
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="12px"
                    onClick={() => handleInput("e")}
                    title="Euler's number (2.71828...)"
                  >
                    e
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "exp(" : "ln(")}
                    title={isInverse ? "eˣ Exponential" : "Natural Logarithm (ln)"}
                  >
                    {isInverse ? "eˣ" : "ln"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "10^(" : "log(")}
                    title={isInverse ? "10ˣ Power (useful for pH = -log[H+])" : "Logarithm Base 10"}
                  >
                    {isInverse ? "10ˣ" : "log"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => (isInverse ? handleInput("%") : handleInput("^(-1)"))}
                    title={isInverse ? "Percentage (%)" : "Reciprocal (1/x)"}
                  >
                    {isInverse ? "%" : "1/x"}
                  </Button>
                </GridItem>

                {/* ── Row 3: Powers, Roots & Parentheses ── */}
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "!" : "^2")}
                    title={isInverse ? "Factorial (n!)" : "Square (x²)"}
                  >
                    {isInverse ? "n!" : "x²"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput("^")}
                    title="Power (xʸ)"
                  >
                    xʸ
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(isInverse ? "cbrt(" : "sqrt(")}
                    title={isInverse ? "Cube Root (∛)" : "Square Root (√)"}
                  >
                    {isInverse ? "∛" : "√"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput("(")}
                    title="Open Parenthesis"
                  >
                    (
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="32px"
                    w="full"
                    variant="outline"
                    colorPalette="slate"
                    fontSize="11px"
                    onClick={() => handleInput(")")}
                    title="Close Parenthesis"
                  >
                    )
                  </Button>
                </GridItem>

                {/* ── Row 4: 7, 8, 9, ÷, Backspace ── */}
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("7")}
                  >
                    7
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("8")}
                  >
                    8
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("9")}
                  >
                    9
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="subtle"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="16px"
                    onClick={() => handleInput("÷")}
                    title="Divide (/)"
                  >
                    ÷
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="outline"
                    colorPalette="red"
                    fontWeight="bold"
                    onClick={handleBackspace}
                    title="Backspace"
                  >
                    <LuDelete size={14} />
                  </Button>
                </GridItem>

                {/* ── Row 5: 4, 5, 6, ×, Clear ── */}
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("4")}
                  >
                    4
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("5")}
                  >
                    5
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("6")}
                  >
                    6
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="subtle"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="16px"
                    onClick={() => handleInput("×")}
                    title="Multiply (*)"
                  >
                    ×
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="subtle"
                    colorPalette="red"
                    fontWeight="bold"
                    fontSize="12px"
                    onClick={handleClear}
                    title="Clear All (AC)"
                  >
                    C
                  </Button>
                </GridItem>

                {/* ── Row 6: 1, 2, 3, -, Ans ── */}
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("1")}
                  >
                    1
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("2")}
                  >
                    2
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("3")}
                  >
                    3
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="subtle"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="16px"
                    onClick={() => handleInput("-")}
                    title="Subtract (-)"
                  >
                    -
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="surface"
                    colorPalette="purple"
                    fontWeight="bold"
                    fontSize="11px"
                    onClick={() => handleInput("Ans")}
                    title="Previous Answer"
                  >
                    Ans
                  </Button>
                </GridItem>

                {/* ── Row 7: 0, ., EXP, +, = ── */}
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput("0")}
                  >
                    0
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="white"
                    color="gray.800"
                    boxShadow="xs"
                    border="1px solid"
                    borderColor="gray.200"
                    fontWeight="bold"
                    fontSize="14px"
                    onClick={() => handleInput(".")}
                  >
                    .
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="xs"
                    h="34px"
                    w="full"
                    variant={isInverse ? "solid" : "outline"}
                    colorPalette="slate"
                    fontWeight="bold"
                    fontSize="10px"
                    onClick={() => (isInverse ? handleToggleSign() : handleInput("e"))}
                    title={
                      isInverse
                        ? "Change Sign (±)"
                        : "Scientific Notation Exponent (e.g. 6.022e23 or 1.6e-19)"
                    }
                  >
                    {isInverse ? "±" : "EXP"}
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    variant="subtle"
                    colorPalette="blue"
                    fontWeight="bold"
                    fontSize="16px"
                    onClick={() => handleInput("+")}
                    title="Add (+)"
                  >
                    +
                  </Button>
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    h="34px"
                    w="full"
                    bg="primaryColor"
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    boxShadow="sm"
                    fontWeight="bold"
                    fontSize="18px"
                    onClick={handleCalculate}
                    title="Calculate (=)"
                  >
                    =
                  </Button>
                </GridItem>
              </Grid>
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
