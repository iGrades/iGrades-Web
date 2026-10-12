import React from "react";
import { Box } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";

type Props = {
  renderPage: () => React.ReactNode;
};

const Dashboard = ({ renderPage }: Props) => {
  const { currentStudentPage } = useNavigationStore();
  const isChat = currentStudentPage === "chat";
  const isSettings = currentStudentPage === "settings";
  const isLearn = currentStudentPage === "learn";

  return (
    <Box
      as="main"
      w="full"
      minH="100%"
      h={isChat ? "100dvh" : "auto"}
      p={isChat || isSettings || isLearn ? 0 : { base: "2", sm: "3", md: "4" }}
      pb={isChat ? 0 : { base: "20", md: "6" }}
      bg={isChat ? "white" : isSettings ? "white" : isLearn ? "white" : "textFieldColor"}
    >
      {renderPage()}
    </Box>
  );
};

export default Dashboard;
