// CheatingProgressBar.tsx (new component for the progress bar)
import { Progress, Text, Box} from "@chakra-ui/react";

interface CheatingProgressBarProps {
  cheatingScore: number;
}

export const CheatingProgressBar = ({
  cheatingScore,
}: CheatingProgressBarProps) => {
  return (
    <Box mt={4}>
      <Text fontSize="xs"  mb={1}>
        Cheating Score: {cheatingScore}/100
      </Text>
      <Progress.Root
        value={cheatingScore}
        max={100}
        colorPalette={
          cheatingScore < 50 ? "green" : cheatingScore < 80 ? "yellow" : "red"
        }
        size="sm"
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
        <Progress.Label />
        <Progress.ValueText />
      </Progress.Root>
    </Box>
  );
};
