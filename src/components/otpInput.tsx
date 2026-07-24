import { HStack, Input } from "@chakra-ui/react";
import { useRef } from "react";

type OtpInputProps = {
  length?: number;
  onChangeOtp: (otp: string) => void;
};

const OtpInput = ({ length = 6, onChangeOtp }: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  interface OtpInputEvent extends React.ChangeEvent<HTMLInputElement> {}
  // interface OtpInputKeyEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleChange = (e: OtpInputEvent, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only digits allowed

    const updatedOtp = inputsRef.current
      .map((input, i) => (i === index ? value : input ? input.value : ""))
      .join("");

    onChangeOtp(updatedOtp);

    // Move to next input
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  interface OtpInputKeyDownEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleKeyDown = (e: OtpInputKeyDownEvent, index: number) => {
    if (
      e.key === "Backspace" &&
      !(e.target as HTMLInputElement).value &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <HStack w='full' gap={{base:"2", md:"5", lg:"6"}}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          textAlign="center"
          ref={(el) => { inputsRef.current[index] = el; }}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          width={{base:"3.5rem", md:"3.4rem", lg:"5rem"}}
          height={{base:"3rem", md:"3rem", lg:"4rem"}}
          fontSize="xl"
          border="none"
          outline="none"
          bg="textFieldColor"
          _focus={{ borderColor: "blue.500" }}
          _placeholder={{ color: "gray.400" }}
        
        />
      ))}
    </HStack>
  );
};

export default OtpInput;
