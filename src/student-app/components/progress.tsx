import { Progress, Stack, HStack, Text } from "@chakra-ui/react";
import { RiCompassesLine } from "react-icons/ri";

type ProgressBarPropType = {
  value: number;
  hasStripe: boolean;
  isAnimated: boolean;
  mb: number;
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "xs" | undefined;
};

const ProgressBar = ({
  value,
  size,
  hasStripe,
  isAnimated,
  mb,
  text,
}: ProgressBarPropType) => {
  return (
    <Progress.Root
      defaultValue={value}
      maxW="sm"
      variant="subtle"
      size={size}
    >
      <HStack gap="5">
        <RiCompassesLine />
        <Progress.Label>{text}</Progress.Label>
        <Progress.Track flex="1">
          <Progress.Range bg="#B2D7FF" />
        </Progress.Track>
        <Progress.ValueText>{value}%</Progress.ValueText>
      </HStack>
    </Progress.Root>
  );
};
export default ProgressBar;
