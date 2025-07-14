import { Box, Button } from "@chakra-ui/react";
import { LiaUserTimesSolid } from "react-icons/lia";
// import { IoClose } from "react-icons/io5";
import AddGrader from "./addGrader";
import type { Dispatch, SetStateAction } from "react";

interface AddGraderPopupProps {
  onClose?: () => void;
  showBox: boolean;
  setShowBox: Dispatch<SetStateAction<boolean>>;
}

const AddGraderPopup = ({ onClose, showBox, setShowBox }: AddGraderPopupProps) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex={1000}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={{ base: "2", md: "4" }}
    >
      <Box
        position="relative"
        width={{ base: "100%", md: "90%", lg: "50%" }}
        maxH="90vh"
        rounded='3xl'
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-MsOverflowStyle": "none", // IE and Edge
          "scrollbarWidth": "none", // Firefox
        }}
      >
        <AddGrader
          basePageWidth={100}
          mdPageWidth={100}
          lgPageWidth={100}
          radius="lg"
          showBox={showBox}
          setShowBox={setShowBox}
        />

        {/* Close Button */}
        <Button
          position="absolute"
          top="30px"
          right="10px"
          bg="white"
          color="red.600"
          borderColor="red.600"
          borderRadius="3xl"
          outline="none"
          p={5}
          w={{ base: "50%", md: "25%", lg: "20%" }}
          fontSize={"xs"}
          onClick={onClose}
        >
          <LiaUserTimesSolid fontSize={"xs"} />
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddGraderPopup;
