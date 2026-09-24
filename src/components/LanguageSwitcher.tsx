import React, { useState, useEffect } from "react";
import { Box, HStack, Text, Button } from "@chakra-ui/react";
import { LuGlobe, LuCheck, LuChevronDown } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, setGlobalLanguage } from "@/services/autoTranslation";
import type { LanguageOption } from "@/services/autoTranslation";

interface LanguageSwitcherProps {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "solid";
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  size = "sm",
  variant = "outline",
  showLabel = true,
}) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(
    localStorage.getItem("appLanguage") || i18n.language || "en"
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang) {
        setCurrentLang(e.detail.lang);
      }
    };
    window.addEventListener("appLanguageChanged", handleLangChange);
    return () => window.removeEventListener("appLanguageChanged", handleLangChange);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    setCurrentLang(lang.code);
    i18n.changeLanguage(lang.code);
    setGlobalLanguage(lang.code);
    setIsOpen(false);
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <Box position="relative" display="inline-block" zIndex={100}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        display="flex"
        alignItems="center"
        gap={1.5}
        px={2.5}
        py={1}
        borderRadius="lg"
        borderColor="gray.300"
        _hover={{ borderColor: "primaryColor", bg: "gray.50" }}
        fontWeight="medium"
        fontSize="xs"
      >
        <LuGlobe size={14} className="text-primary" />
        {showLabel && (
          <Text fontWeight="semibold" fontSize="xs">
            {activeLangObj.name}
          </Text>
        )}
        <LuChevronDown size={12} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </Button>

      {isOpen && (
        <>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={98}
            onClick={() => setIsOpen(false)}
          />
          <Box
            position="absolute"
            top="100%"
            right="0"
            mt={1.5}
            w="190px"
            bg="white"
            borderRadius="xl"
            boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="gray.200"
            py={1.5}
            zIndex={99}
            maxH="320px"
            overflowY="auto"
          >
            <Box px={3} py={1.5} borderBottom="1px solid" borderColor="gray.100" mb={1}>
              <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" color="gray.400" letterSpacing="wider">
                Select Language
              </Text>
            </Box>

            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <Box
                  key={lang.code}
                  as="button"
                  w="100%"
                  textAlign="left"
                  px={3}
                  py={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  _hover={{ bg: "blue.50" }}
                  bg={isSelected ? "blue.50" : "transparent"}
                  cursor="pointer"
                  transition="all 0.15s"
                  onClick={() => handleSelect(lang)}
                >
                  <Box>
                    <Text fontSize="xs" fontWeight={isSelected ? "bold" : "medium"} color={isSelected ? "blue.700" : "gray.800"}>
                      {lang.name}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                      {lang.nativeName}
                    </Text>
                  </Box>
                  {isSelected && <LuCheck size={14} color="#2563EB" />}
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};

export const FloatingLanguageWidget: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>(
    localStorage.getItem("appLanguage") || i18n.language || "en"
  );

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang) {
        setCurrentLang(e.detail.lang);
      }
    };
    window.addEventListener("appLanguageChanged", handleLangChange);
    return () => window.removeEventListener("appLanguageChanged", handleLangChange);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    setCurrentLang(lang.code);
    i18n.changeLanguage(lang.code);
    setGlobalLanguage(lang.code);
    setIsOpen(false);
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={9990}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        bg="white"
        color="gray.800"
        boxShadow="0 4px 14px rgba(0,0,0,0.15)"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="full"
        px={3.5}
        py={2}
        h="auto"
        display="flex"
        alignItems="center"
        gap={2}
        _hover={{ bg: "gray.50", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}
        transition="all 0.2s ease"
        aria-label="Change Application Language"
      >
        <LuGlobe size={18} color="#2563EB" />
        <Text fontSize="xs" fontWeight="bold">
          {activeLangObj.nativeName.split(" ")[0]}
        </Text>
        <LuChevronDown
          size={14}
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </Button>

      {isOpen && (
        <>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={9991}
            onClick={() => setIsOpen(false)}
          />
          <Box
            position="absolute"
            bottom="100%"
            right="0"
            mb={2}
            w="210px"
            bg="white"
            borderRadius="2xl"
            boxShadow="0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="gray.200"
            py={2}
            zIndex={9992}
            maxH="340px"
            overflowY="auto"
          >
            <Box px={3.5} py={1.5} borderBottom="1px solid" borderColor="gray.100" mb={1}>
              <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                Translate Whole App
              </Text>
              <Text fontSize="10px" color="gray.400">
                Translates every word & page
              </Text>
            </Box>

            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <Box
                  key={lang.code}
                  as="button"
                  w="100%"
                  textAlign="left"
                  px={3.5}
                  py={2.5}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  _hover={{ bg: "blue.50" }}
                  bg={isSelected ? "blue.50" : "transparent"}
                  cursor="pointer"
                  transition="all 0.15s"
                  onClick={() => handleSelect(lang)}
                >
                  <Box>
                    <HStack gap={1.5}>
                      <Text
                        fontSize="xs"
                        fontWeight={isSelected ? "bold" : "semibold"}
                        color={isSelected ? "blue.700" : "gray.800"}
                      >
                        {lang.name}
                      </Text>
                    </HStack>
                    <Text fontSize="10px" color="gray.500">
                      {lang.nativeName}
                    </Text>
                  </Box>
                  {isSelected && <LuCheck size={16} color="#2563EB" />}
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};
