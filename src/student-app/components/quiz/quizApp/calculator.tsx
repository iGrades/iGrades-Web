import {
  Button,
  Grid,
  GridItem,
  Input,
  VStack,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { useState } from "react";
import { BsFillCalculatorFill } from "react-icons/bs";


export const Calculator = () => {
  const [display, setDisplay] = useState("");

  const handleClick = (val: string) => {
    if (val === "=") {
      try {
        // Simple eval-free math logic
        const result = Function(`"use strict"; return (${display})`)();
        setDisplay(result.toString());
      } catch {
        setDisplay("Error");
      }
    } else if (val === "C") {
      setDisplay("");
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "C",
    "+",
    "=",
  ];

  return (
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger asChild>
        <Button size="md" bg='blue.50' color='primaryColor' rounded='lg' p={2}>
          <BsFillCalculatorFill />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width="220px" bg="white" shadow="xl">
            <Popover.Arrow />
            <Popover.Body p={3}>
              <VStack gap={2}>
                <Input
                  value={display}
                  readOnly
                  textAlign="right"
                  mb={2}
                  fontSize="lg"
                  fontWeight="bold"
                />
                <Grid templateColumns="repeat(4, 1fr)" gap={1} w="full">
                  {buttons.map((btn) => (
                    <GridItem key={btn} colSpan={btn === "=" ? 4 : 1}>
                      <Button
                        size="sm"
                        w="full"
                        colorPalette={btn === "=" ? "blue" : "gray"}
                        variant={btn === "=" ? "solid" : "outline"}
                        onClick={() => handleClick(btn)}
                      >
                        {btn}
                      </Button>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
