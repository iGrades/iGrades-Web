import { useState, useEffect } from "react";
import { Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import bcrypt from "bcryptjs";

const generateNumericPasskey = (length = 6) => {
  const DIGITS = "123456789"; // No zero
  return Array.from(
    { length },
    () => DIGITS[Math.floor(Math.random() * 9)]
  ).join("");
};

const saltRounds = 10;

const HashPasskey = () => {
  const [passkey, setPasskey] = useState(""); // Shown to user
  const [hashed, setHashed] = useState(""); // Stored in "DB"
  const [input, setInput] = useState(""); // User-entered passkey
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const handleGenerate = async () => {
    const newPasskey = generateNumericPasskey();
    const hash = await bcrypt.hash(newPasskey, saltRounds);
    setPasskey(newPasskey);
    setHashed(hash);
    setInput("");
    setIsMatch(null);
  };

  const handleCheck = async () => {
    const match = await bcrypt.compare(input, hashed);
    setIsMatch(match);
  };

  useEffect(() => {
    handleGenerate(); // Run on mount
  }, []);

  return (
    <Flex direction="column" align="center" p={4}>
      <VStack gap={4} maxW="400px" w="100%">
        <Box p={4} border="1px solid #ccc" borderRadius="md" w="100%">
          <Text fontWeight="bold">Passkey (give to user):</Text>
          <Text fontSize="2xl" color="blue.600">
            {passkey}
          </Text>
        </Box>

        <Box p={4} border="1px dashed gray" borderRadius="md" w="100%">
          <Text fontWeight="bold">Hashed (saved to DB):</Text>
          <Text fontSize="xs" wordBreak="break-word">
            {hashed}
          </Text>
        </Box>

        <Input
          type="number"
          placeholder="Enter passkey"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleCheck} colorScheme="teal">
          Check
        </Button>

        {isMatch !== null && (
          <Text fontWeight="bold" color={isMatch ? "green.500" : "red.500"}>
            {isMatch ? "✅ Passkey matched!" : "❌ Invalid passkey"}
          </Text>
        )}

        <Button onClick={handleGenerate} colorScheme="blue" variant="outline">
          🔄 Generate New
        </Button>
      </VStack>
    </Flex>
  );
};

export default HashPasskey;
