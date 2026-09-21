import { createContext, useContext, useState } from "react";

// Only digits 1–9, skip 0
const DIGITS = "123456789";
export const encKey = (import.meta.env.ENC_KEY as string) || "";

function generateNumericPasskey(length = 6) {
  return Array.from(
    { length },
    () => DIGITS[Math.floor(Math.random() * DIGITS.length)]
  ).join("");
}

// encryption helpers
function letterToNumber(char: string) {
  return parseInt(char, 10);
}

function numberToLetter(num: number) {
  return num.toString();
}

export function encrypt(passkey: string, key?: string) {
  if (!passkey) return "";
  const safeKey = key || encKey;
  if (!safeKey || safeKey.length === 0) return passkey;
  return passkey
    .split("")
    .map((char, i) => {
      const p = letterToNumber(char);
      const k = letterToNumber(safeKey[i % safeKey.length]);
      if (isNaN(p) || isNaN(k)) return char;
      const encryptedNum = ((p + k - 1) % 9) + 1;
      return numberToLetter(encryptedNum);
    })
    .join("");
}

export function decrypt(cipher: string, key?: string) {
  if (!cipher) return "";
  const safeKey = key || encKey;
  if (!safeKey || safeKey.length === 0) return cipher;
  return cipher
    .split("")
    .map((char, i) => {
      const c = letterToNumber(char);
      const k = letterToNumber(safeKey[i % safeKey.length]);
      if (isNaN(c) || isNaN(k)) return char;
      const decryptedNum = ((c - k + 9 - 1) % 9) + 1;
      return numberToLetter(decryptedNum);
    })
    .join("");
}

type GeneratePassKey = {
  passkey: string;
  encrypted: string;
}

type PassKeyContextType = {
  plainPasskey: string;
  setPlainPasskey: React.Dispatch<React.SetStateAction<string>>;
  encryptedPasskey: string;
  setEncryptedPasskey: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isMatch: boolean | null;
  handleGeneratePassKey: () => GeneratePassKey
  handlePassKeyCheck: () => void;
  decrypt: (cipher: string, key: string) => string;
  encrypt: (passkey: string, key: string) => string;
};

const PassKeyContext = createContext<PassKeyContextType>({
  plainPasskey: "",
  setPlainPasskey: () => {},
  encryptedPasskey: "",
  setEncryptedPasskey: () => {},
  input: "",
  setInput: () => {},
  isMatch: null,
  handleGeneratePassKey: () => ({ passkey: "", encrypted: "" }),
  handlePassKeyCheck: () => {},
  decrypt: () => "",
  encrypt: () => "",
});

export const PasskeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [plainPasskey, setPlainPasskey] = useState("");
  const [encryptedPasskey, setEncryptedPasskey] = useState("");
  const [input, setInput] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  function handleGeneratePassKey() {
    const passkey = generateNumericPasskey();
    const encrypted = encrypt(passkey, encKey);

    setPlainPasskey(passkey);
    setEncryptedPasskey(encrypted);
    setInput("");
    setIsMatch(null);
    return { passkey, encrypted };
  }

  function handlePassKeyCheck() {
    const decrypted = decrypt(encryptedPasskey, encKey);
    setIsMatch(input === decrypted);
  }

  return (
    <PassKeyContext.Provider
      value={{
        plainPasskey,
        setPlainPasskey,
        encryptedPasskey,
        setEncryptedPasskey,
        decrypt,
        encrypt,
        input,
        setInput,
        isMatch,
        handleGeneratePassKey,
        handlePassKeyCheck,
      }}
    >
      {children}
    </PassKeyContext.Provider>
  );
};

export function usePassKey() {
  return useContext(PassKeyContext);
}
