// EmailConfirmed.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Box, Text, Spinner } from "@chakra-ui/react";

export default function Verify() {
  const [status, setStatus] = useState<"checking" | "done" | "error">("checking");
  const navigate = useNavigate();


  
  useEffect(() => {
    const checkAndInsert = async () => {
      // Wait a bit to allow Supabase to process the access_token from URL
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData?.user) {
        setStatus("error");
        return;
      }

      const stored = localStorage.getItem("formData");
      if (!stored) {
        setStatus("error");
        return;
      }

      const { firstName, lastName, phone, aboutUs } = JSON.parse(stored);

      const { error: insertError } = await supabase.from("parents").upsert({
        user_id: userData.user.id,
        email: userData.user.email,
        firstname: firstName,
        lastname: lastName,
        phone,
        about_us: aboutUs,
      });

      if (insertError) {
        console.error("Error inserting profile:", insertError.message);
        setStatus("error");
        return;
      }

      localStorage.removeItem("formData");
      navigate("/");
    };

    checkAndInsert();
  }, []);
  

  return (
    <Box textAlign="center" p={10}>
      {status === "checking" ? (
        <>
          <Spinner />
          <Text mt={4}>
            Confirming your email and setting up your account...
          </Text>
        </>
      ) : (
        <Text>Something went wrong or you're already logged in.</Text>
      )}
    </Box>
  );
}
