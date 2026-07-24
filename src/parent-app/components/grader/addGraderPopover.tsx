import { Box, Button, Icon } from "@chakra-ui/react";
import { LiaUserTimesSolid } from "react-icons/lia";
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
      zIndex={2000} 
      display="flex"
      justifyContent="center"
      alignItems={{ base: "flex-start", md: "center" }} 
      p={{ base: "0", md: "4" }}
    >
      <Box
        position="relative"
        width={{ base: "100%", md: "90%", lg: "60%" }}
        maxH={{ base: "100vh", md: "90vh" }}
        rounded={{ base: "none", md: "3xl" }}
        overflowY="auto"
        bg="white" 
        pb={{ base: "120px", md: "0" }} 
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-MsOverflowStyle": "none",
          "scrollbarWidth": "none",
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

        {/* Close/Cancel Button */}
        <Button
          position={{ base: "fixed", md: "absolute" }} 
          bottom={{ base: "20px", md: "auto" }}
          top={{ base: "auto", md: "30px" }}
          right={{ base: "50%", md: "10px" }}
          transform={{ base: "translateX(50%)", md: "none" }} 
          bg="white"
          color="red.600"
          border="1px solid"
          borderColor="red.600"
          borderRadius="3xl"
          boxShadow="xl"
          p={6}
          w={{ base: "90%", md: "120px" }}
          fontSize={"xs"}
          fontWeight="bold"
          zIndex={2001}
          onClick={onClose}
          _active={{ transform: { base: "translateX(50%) scale(0.95)", md: "scale(0.95)" } }}
        >
          <Icon as={LiaUserTimesSolid} mr={2} />
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddGraderPopup;