import { Heading } from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";
import Dashboard from "@/parent-app/layouts/dashboard";
import { Box } from "@chakra-ui/react";
import LogoutBtn from "@/parent-app/components/logoutBtn";

type Props = {};

const {
  data: { user },
} = await supabase.auth.getUser();


// let { data: parents, error } = await supabase.from("parents").select("user_id");

let { data: parents, error } = await supabase
  .from("parents")
  .select("*");


console.log(parents);

console.log(user);


const Home = (props: Props) => {
  const [parent] = parents || [];
  return (
    <Box as="section">
      <Heading as="h1" size="2xl" mb={4}>
        Welcome, {parent?.firstname || "User"}!{" "}
      </Heading>
      <Dashboard />
      <LogoutBtn />
    </Box>
  );
};

export default Home;
