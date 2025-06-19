import React from "react";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Charts from "@/parent-app/components/charts";
import { Button, HStack } from "@chakra-ui/react";
import AddGrader from "../components/addGrader";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <div>

      <p className="text-4xl">This is the dashboard page</p>
      <Charts />

      <AddGrader />

     
    </div>
  );
};

export default Dashboard;
