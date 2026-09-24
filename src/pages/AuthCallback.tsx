import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Box, Text, VStack, Alert, Flex } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useUser } from "@/parent-app/context/parentDataContext";
import { recordActivity } from "@/lib/authSessionManager";

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
      const storedRole = localStorage.getItem("oauth_role") || "";
      const userEmail = user.email ? user.email.trim().toLowerCase() : "";

      const userMeta = user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || (userEmail ? userEmail.split("@")[0] : "User");
      const nameParts = fullName.trim().split(" ");
      const firstName = userMeta.given_name || nameParts[0] || "User";
      const lastName = userMeta.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      const avatar = userMeta.avatar_url || userMeta.picture || "";

      // Helper: complete student login, link user_id & avatar, store in session
      const completeStudentLogin = async (student: any) => {
        try {
          const updates: any = {};
          if (!student.user_id || student.user_id !== user.id) {
            updates.user_id = user.id;
          }
          if (!student.profile_image && avatar) {
            updates.profile_image = avatar;
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from("students").update(updates).eq("id", student.id);
            student = { ...student, ...updates };
          }
        } catch (linkErr) {
          console.warn("Notice updating student user_id link:", linkErr);
        }

        localStorage.removeItem("oauth_role");
        localStorage.removeItem("authdParent");
        setAuthdStudent(student);
        localStorage.setItem("authdStudent", JSON.stringify(student));
        recordActivity(true);
        const studentName = student.firstname || firstName || "Student";
        navigate(studentName ? `/student-dashboard/${studentName}` : "/student-dashboard", { replace: true });
      };

      // Helper: complete parent login, link user_id & avatar, store in session
      const completeParentLogin = async (parent: any) => {
        try {
          const updates: any = {};
          if (!parent.user_id || parent.user_id !== user.id) {
            updates.user_id = user.id;
          }
          if (!parent.profile_image && avatar) {
            updates.profile_image = avatar;
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from("parents").update(updates).eq("id", parent.id);
            parent = { ...parent, ...updates };
          }
        } catch (linkErr) {
          console.warn("Notice updating parent user_id link:", linkErr);
        }

        localStorage.removeItem("oauth_role");
        localStorage.removeItem("authdStudent");
        recordActivity(true);
        await getParentData();
        const parentName = parent.firstname || firstName || "Parent";
        navigate(parentName ? `/parent-dashboard/${parentName}` : "/parent-dashboard", { replace: true });
      };

      // Helper query: find student by ID or by email
      const findStudent = async () => {
        // 1. By ID / user_id
        const { data: byId } = await supabase
          .from("students")
          .select("*")
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .limit(1);
        if (byId && byId.length > 0) return byId[0];

        // 2. By Email (case-insensitive)
        if (userEmail) {
          const { data: byEmail } = await supabase
            .from("students")
            .select("*")
            .ilike("email", userEmail)
            .limit(1);
          if (byEmail && byEmail.length > 0) return byEmail[0];
        }
        return null;
      };

      // Helper query: find parent by ID or by email
      const findParent = async () => {
        // 1. By user_id
        const { data: byId } = await supabase
          .from("parents")
          .select("*")
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .limit(1);
        if (byId && byId.length > 0) return byId[0];

        // 2. By Email (case-insensitive)
        if (userEmail) {
          const { data: byEmail } = await supabase
            .from("parents")
            .select("*")
            .ilike("email", userEmail)
            .limit(1);
          if (byEmail && byEmail.length > 0) return byEmail[0];
        }
        return null;
      };

      // --- BRANCH A: User explicitly initiated Student login ---
      if (storedRole === "children" || storedRole === "student") {
        const student = await findStudent();
        if (student) {
          await completeStudentLogin(student);
          return;
        }

        // If not in students, check if they exist as a parent
        const parent = await findParent();
        if (parent) {
          await completeParentLogin(parent);
          return;
        }
      }

      // --- BRANCH B: User explicitly initiated Parent login ---
      else if (storedRole === "parent") {
        const parent = await findParent();
        if (parent) {
          await completeParentLogin(parent);
          return;
        }

        // If not in parents, check if they exist as a student
        const student = await findStudent();
        if (student) {
          await completeStudentLogin(student);
          return;
        }
      }

      // --- BRANCH C: No role specified or generic login ---
      else {
        // Check student first
        const student = await findStudent();
        if (student) {
          await completeStudentLogin(student);
          return;
        }

        // Then check parent
        const parent = await findParent();
        if (parent) {
          await completeParentLogin(parent);
          return;
        }
      }

      // --- BRANCH D: Brand new user with no matching email in either table ---
      if (storedRole === "children" || storedRole === "student") {
        const newStudent = {
          id: user.id,
          user_id: user.id,
          email: userEmail || user.email || "",
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
        localStorage.removeItem("authdParent");
        setAuthdStudent(newStudent);
        localStorage.setItem("authdStudent", JSON.stringify(newStudent));
        navigate(`/student-dashboard/${firstName}`, { replace: true });
      } else {
        const newParent = {
          user_id: user.id,
          email: userEmail || user.email,
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
        localStorage.removeItem("authdStudent");
        await getParentData();
        navigate(`/parent-dashboard/${firstName}`, { replace: true });
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
          <VStack gap={3}>
            <DancingLogoLoader
              size="lg"
              text="Completing Google Authentication..."
              subtext="Please wait while we log you into your iGrade account."
              minH="120px"
            />
          </VStack>
        )}
      </Box>
    </Flex>
  );
}
