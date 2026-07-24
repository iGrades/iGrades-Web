import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Box, Spinner, Text, VStack, Alert, Flex } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useUser } from "@/parent-app/context/parentDataContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { setAuthdStudent } = useAuthdStudentData();
  const { getParentData } = useUser();

  useEffect(() => {
    let isMounted = true;

    const handleOAuthCallback = async () => {
      try {
        // Retrieve current session after Google redirect
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          // Listen for session state change if hash fragment is still being processed
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
              if (currentSession?.user) {
                authListener.subscription.unsubscribe();
                await processUser(currentSession.user);
              }
            }
          );
          return;
        }

        await processUser(session.user);
      } catch (err: any) {
        if (isMounted) {
          console.error("Auth callback error:", err);
          setErrorMsg(err.message || "Failed to complete Google authentication.");
        }
      }
    };

    const processUser = async (user: any) => {
      const storedRole = localStorage.getItem("oauth_role") || "parent";

      // 1. Check if user already exists in 'parents' table
      const { data: existingParents } = await supabase
        .from("parents")
        .select("*")
        .eq("user_id", user.id);

      if (existingParents && existingParents.length > 0) {
        const p = existingParents[0];
        localStorage.removeItem("oauth_role");
        await getParentData();
        navigate(p.firstname ? `/parent-dashboard/${p.firstname}` : "/parent-dashboard");
        return;
      }

      // 2. Check if user already exists in 'students' table
      const { data: existingStudents } = await supabase
        .from("students")
        .select("*")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (existingStudents && existingStudents.length > 0) {
        const s = existingStudents[0];
        localStorage.removeItem("oauth_role");
        setAuthdStudent(s);
        localStorage.setItem("authdStudent", JSON.stringify(s));
        navigate(s.firstname ? `/student-dashboard/${s.firstname}` : "/student-dashboard");
        return;
      }

      // 3. User is new - create profile based on stored role or metadata
      const userMeta = user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || user.email?.split("@")[0] || "User";
      const nameParts = fullName.trim().split(" ");
      const firstName = userMeta.given_name || nameParts[0] || "User";
      const lastName = userMeta.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User");
      const avatar = userMeta.avatar_url || userMeta.picture || "";

      if (storedRole === "children" || storedRole === "student") {
        const newStudent = {
          id: user.id,
          user_id: user.id,
          email: user.email || "",
          firstname: firstName,
          lastname: lastName,
          profile_image: avatar,
          grade_level: "",
          school: "",
          class: "",
          is_child: false,
          subscription: "free",
          subscription_status: "inactive",
          last_payment_ref: null,
        };

        const { error: insertErr } = await supabase.from("students").upsert(newStudent);
        if (insertErr) {
          console.error("Error creating student record:", insertErr);
        }

        localStorage.removeItem("oauth_role");
        setAuthdStudent(newStudent);
        localStorage.setItem("authdStudent", JSON.stringify(newStudent));
        navigate(`/student-dashboard/${firstName}`);
      } else {
        // Parent role
        const newParent = {
          user_id: user.id,
          email: user.email,
          firstname: firstName,
          lastname: lastName,
          profile_image: avatar,
          about_us: "Google OAuth",
        };

        const { error: insertErr } = await supabase.from("parents").upsert(newParent);
        if (insertErr) {
          console.error("Error creating parent record:", insertErr);
        }

        localStorage.removeItem("oauth_role");
        await getParentData();
        navigate(`/parent-dashboard/${firstName}`);
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, setAuthdStudent, getParentData]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#F8FAFC" p={6}>
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        textAlign="center"
        maxW="400px"
        w="full"
      >
        {errorMsg ? (
          <VStack gap={4}>
            <Alert.Root status="error" borderRadius="xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title fontSize="sm" fontWeight="700">Authentication Error</Alert.Title>
                <Alert.Description fontSize="xs">{errorMsg}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="primaryColor"
              cursor="pointer"
              onClick={() => navigate("/login")}
            >
              Return to Login
            </Text>
          </VStack>
        ) : (
          <VStack gap={4}>
            <Spinner size="lg" color="primaryColor" />
            <Text fontSize="md" fontWeight="700" color="#1E293B">
              Completing Google Authentication...
            </Text>
            <Text fontSize="xs" color="#64748B">
              Please wait while we log you into your iGrade account.
            </Text>
          </VStack>
        )}
      </Box>
    </Flex>
  );
}
