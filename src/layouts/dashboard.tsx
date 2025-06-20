import React from "react";
import { Button, HStack } from "@chakra-ui/react";
import { useNavigationStore } from "@/store/usenavigationStore";
import Sidebar from "@/components/sidebar";
import Home from "../parent-app/pages/HomePage";
import Student from "../parent-app/pages/StudentPage";  
import Settings from "../parent-app/pages/SettingsPage";

type Props = {};

const DashboardLayout = (props: Props) => {
  const currentPage = useNavigationStore((state) => state.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "student":
        return <Student />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };
 
  return (
    <div style={{ display: "flex", height: "100vh" }}>
     <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>{renderPage()}</main>
    </div>
  );
};

export default DashboardLayout;
 