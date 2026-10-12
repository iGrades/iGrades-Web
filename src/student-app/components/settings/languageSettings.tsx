import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiCheck } from "react-icons/fi";
import { SUPPORTED_LANGUAGES, setGlobalLanguage, type LanguageOption } from "@/services/autoTranslation";
import { toaster } from "@/components/ui/toaster";

export const LanguageSettings = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(
    localStorage.getItem("appLanguage") || i18n.language || "en"
  );

  useEffect(() => {
    const handleLang = (e: any) => {
      if (e.detail?.lang) {
        setCurrentLang(e.detail.lang);
      }
    };
    window.addEventListener("appLanguageChanged", handleLang);
    return () => window.removeEventListener("appLanguageChanged", handleLang);
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setCurrentLang(lang.code);
    i18n.changeLanguage(lang.code);
    setGlobalLanguage(lang.code);
    toaster.create({
      title: "Language Changed",
      description: `Application language switched to ${lang.name} (${lang.nativeName}).`,
      type: "success",
      duration: 2500,
    });
  };

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <Box bg="white" border="none" outline="none" boxShadow="none" p={{ base: 4, sm: 6 }} mb={20} w="100%">
      {/* Header */}
      <Box mb={6} pb={3}>
        <HStack gap={3} align="center" mb={1}>
          <Box p={2.5} bg="blue.50" color="blue.600" borderRadius="xl">
            <Icon as={FiGlobe} boxSize={5} />
          </Box>
          <Box>
            <Heading as="h3" fontSize={{ base: "lg", md: "xl" }} color="gray.800" fontWeight="bold">
              {t("language") || "Language Preferences"}
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Select your preferred language for courses, quizzes, tutor responses, and navigation.
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Active Language Highlight */}
      <Box
        p={4}
        mb={6}
        bg="blue.50/60"
        border="none"
        outline="none"
        boxShadow="none"
        borderRadius="xl"
      >
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="600" color="blue.800">
              Current Active Language:
            </Text>
            <Badge colorPalette="blue" variant="solid" px={2.5} py={0.5} borderRadius="full" fontSize="xs" border="none">
              {activeLangObj.name} ({activeLangObj.nativeName})
            </Badge>
          </HStack>
          <Text fontSize="11px" color="blue.700">
            Real-time multi-dialect translation enabled
          </Text>
        </HStack>
      </Box>

      {/* Language Selection Grid */}
      <Text fontSize="xs" fontWeight="700" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="wider">
        Choose Language
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3} w="100%">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <Box
              key={lang.code}
              as="button"
              type="button"
              onClick={() => handleSelectLanguage(lang)}
              textAlign="left"
              p={4}
              borderRadius="xl"
              border="none"
              outline="none"
              boxShadow="none"
              bg={isSelected ? "#DBEAFE" : "#F4F7FB"}
              transition="all 0.15s ease"
              _hover={{
                bg: isSelected ? "#BFDBFE" : "#EDF2F7",
              }}
              _active={{ transform: "scale(0.99)" }}
              cursor="pointer"
              position="relative"
              w="100%"
            >
              <HStack justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight={isSelected ? "700" : "600"} color={isSelected ? "blue.700" : "gray.800"}>
                    {lang.name}
                  </Text>
                  <Text fontSize="xs" color={isSelected ? "blue.600" : "gray.500"}>
                    {lang.nativeName}
                  </Text>
                </Box>
                {isSelected && (
                  <Box
                    w={6}
                    h={6}
                    borderRadius="full"
                    bg="blue.600"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiCheck} boxSize={3.5} />
                  </Box>
                )}
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default LanguageSettings;
