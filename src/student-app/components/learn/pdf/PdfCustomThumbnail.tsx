import React from "react";
import { Box, Text, Flex, Badge } from "@chakra-ui/react";
import { LuBookOpen, LuGraduationCap, LuFileText } from "react-icons/lu";

interface Props {
  title: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface ThemeConfig {
  category: string;
  bgGradient: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
  symbol: string;
  watermark: string;
}

export function getTopicTheme(title: string): ThemeConfig {
  const t = title.toLowerCase();

  if (
    t.includes("base") ||
    t.includes("modular") ||
    t.includes("indice") ||
    t.includes("logarithm") ||
    t.includes("sequence") ||
    t.includes("standard form") ||
    t.includes("approximation")
  ) {
    return {
      category: "NUMBER & NUMERATION",
      bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
      accentColor: "#60a5fa",
      badgeBg: "rgba(96, 165, 250, 0.2)",
      badgeColor: "#bfdbfe",
      symbol: "∑ 101₂",
      watermark: "bⁿ",
    };
  }

  if (
    t.includes("algeb") ||
    t.includes("equation") ||
    t.includes("subject of formula") ||
    t.includes("variation") ||
    t.includes("quadratic")
  ) {
    return {
      category: "ALGEBRAIC PROCESSES",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)",
      accentColor: "#c084fc",
      badgeBg: "rgba(192, 132, 252, 0.2)",
      badgeColor: "#e9d5ff",
      symbol: "ax² + bx",
      watermark: "f(x)",
    };
  }

  if (
    t.includes("set") ||
    t.includes("logic") ||
    t.includes("reasoning")
  ) {
    return {
      category: "SETS & LOGIC",
      bgGradient: "linear-gradient(135deg, #022c22 0%, #065f46 50%, #059669 100%)",
      accentColor: "#34d399",
      badgeBg: "rgba(52, 211, 153, 0.2)",
      badgeColor: "#a7f3d0",
      symbol: "A ∩ B",
      watermark: "∪ ⊂",
    };
  }

  if (
    t.includes("pythagoras") ||
    t.includes("trigonomet") ||
    t.includes("elevation") ||
    t.includes("depression")
  ) {
    return {
      category: "TRIGONOMETRY",
      bgGradient: "linear-gradient(135deg, #450a0a 0%, #881337 50%, #be123c 100%)",
      accentColor: "#fb7185",
      badgeBg: "rgba(251, 113, 133, 0.2)",
      badgeColor: "#fecdd3",
      symbol: "sin θ",
      watermark: "a²+b²=c²",
    };
  }

  if (
    t.includes("angle") ||
    t.includes("polygon") ||
    t.includes("geometric") ||
    t.includes("construction") ||
    t.includes("locus") ||
    t.includes("proof") ||
    t.includes("perimeter") ||
    t.includes("surface") ||
    t.includes("volume")
  ) {
    return {
      category: "GEOMETRY & MENSURATION",
      bgGradient: "linear-gradient(135deg, #2e1065 0%, #78350f 50%, #b45309 100%)",
      accentColor: "#fbbf24",
      badgeBg: "rgba(251, 191, 36, 0.2)",
      badgeColor: "#fde68a",
      symbol: "∠ 90°",
      watermark: "V=πr²h",
    };
  }

  if (
    t.includes("data") ||
    t.includes("central tendency") ||
    t.includes("mean") ||
    t.includes("median") ||
    t.includes("interpretation") ||
    t.includes("statist")
  ) {
    return {
      category: "STATISTICS & DATA",
      bgGradient: "linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)",
      accentColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.2)",
      badgeColor: "#bae6fd",
      symbol: "x̄  ∑f",
      watermark: "📊",
    };
  }

  return {
    category: "CURRICULUM GUIDE",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)",
    accentColor: "#60a5fa",
    badgeBg: "rgba(96, 165, 250, 0.2)",
    badgeColor: "#bfdbfe",
    symbol: "iGrades",
    watermark: "PDF",
  };
}

/**
 * Returns an inline SVG Data URL for situations requiring a standard image URL
 */
export function getPdfCustomThumbnailDataUrl(title: string): string {
  const theme = getTopicTheme(title);
  const cleanTitle = title.replace(/[<>&"]/g, "");
  
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#grad)" rx="12"/>
    <rect width="100%" height="100%" fill="url(#grid)" rx="12"/>
    
    <!-- Mathematical Watermark -->
    <text x="320" y="80" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="rgba(255,255,255,0.08)" text-anchor="middle">
      ${theme.watermark}
    </text>

    <!-- Top Badge -->
    <rect x="20" y="20" width="160" height="24" rx="6" fill="rgba(255,255,255,0.15)"/>
    <text x="30" y="36" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff" letter-spacing="1">
      ${theme.category}
    </text>

    <!-- Title -->
    <text x="20" y="115" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#ffffff">
      ${cleanTitle.length > 25 ? cleanTitle.substring(0, 24) + "..." : cleanTitle}
    </text>
    
    <!-- Subtitle -->
    <text x="20" y="145" font-family="system-ui, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">
      SSS 1 • WAEC / JAMB Syllabus
    </text>

    <!-- Bottom Bar -->
    <line x1="20" y1="175" x2="380" y2="175" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    
    <!-- Verified Badge -->
    <text x="20" y="200" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#38bdf8">
      ✓ Verified Curriculum Notes
    </text>
    
    <rect x="300" y="185" width="80" height="22" rx="4" fill="#38bdf8"/>
    <text x="340" y="200" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">
      PDF
    </text>
  </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const PdfCustomThumbnail: React.FC<Props> = ({ title, description }) => {
  const theme = getTopicTheme(title);

  return (
    <Box
      w="100%"
      h="100%"
      minH="110px"
      borderRadius="xl"
      position="relative"
      overflow="hidden"
      background={theme.bgGradient}
      p={3}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      userSelect="none"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ transform: "scale(1.02)", boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}
    >
      {/* Background Subtle Math Watermark */}
      <Box
        position="absolute"
        right="8px"
        top="50%"
        transform="translateY(-50%)"
        fontSize={{ base: "32px", md: "42px" }}
        fontWeight="900"
        color="white"
        opacity={0.08}
        lineHeight={1}
        pointerEvents="none"
      >
        {theme.watermark}
      </Box>

      {/* Top Meta Bar */}
      <Flex justify="space-between" align="center" zIndex={1}>
        <Badge
          bg={theme.badgeBg}
          color={theme.badgeColor}
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="md"
          fontWeight="bold"
          letterSpacing="0.5px"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          {theme.category}
        </Badge>
        <Flex align="center" gap={1} color="whiteAlpha.700" fontSize="10px">
          <LuBookOpen size={12} />
          <Text fontWeight="medium">SSS 1</Text>
        </Flex>
      </Flex>

      {/* Center Topic Title */}
      <Box zIndex={1} my={1}>
        <Text
          color="white"
          fontWeight="bold"
          fontSize={{ base: "13px", md: "14px" }}
          lineHeight="1.25"
          noOfLines={2}
          textShadow="0 1px 3px rgba(0,0,0,0.4)"
        >
          {title}
        </Text>
        {description && (
          <Text
            color="whiteAlpha.700"
            fontSize="10px"
            noOfLines={1}
            mt={0.5}
          >
            {description.replace(/^Covers\s+/i, "")}
          </Text>
        )}
      </Box>

      {/* Bottom Footer Details */}
      <Flex justify="space-between" align="center" zIndex={1} pt={1} borderTop="1px solid" borderColor="whiteAlpha.200">
        <Flex align="center" gap={1}>
          <LuGraduationCap size={12} color={theme.accentColor} />
          <Text fontSize="10px" color="whiteAlpha.900" fontWeight="semibold">
            WAEC • JAMB
          </Text>
        </Flex>

        <Flex
          align="center"
          gap={1}
          bg="whiteAlpha.300"
          px={1.5}
          py={0.5}
          borderRadius="sm"
          color="white"
          fontSize="9px"
          fontWeight="bold"
        >
          <LuFileText size={10} />
          <Text>PDF</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PdfCustomThumbnail;
