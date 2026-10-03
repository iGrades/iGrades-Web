import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Box, VStack, Alert, Flex, Button } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useUser } from "@/parent-app/context/parentDataContext";
import { recordActivity } from "@/lib/authSessionManager";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>("Authentication");
  const { setAuthdStudent } = useAuthdStudentData();
  const { getParentData } = useUser();

  const isProcessingRef = useRef<boolean>(false);
  const activeUserRef = useRef<any>(null);

  const processUser = useCallback(async (user: any) => {
    if (!user || !user.id) {
      setErrorMsg("No authenticated user profile was returned by the provider.");
      return;
    }

    activeUserRef.current = user;

    // Detect OAuth Provider (Google vs Apple)
    const rawProvider = (
      user.app_metadata?.provider ||
      user.identities?.[0]?.provider ||
      "google"
    ).toLowerCase();
    const providerLabel = rawProvider === "apple" ? "Apple" : "Google";
    setProviderName(providerLabel);

    // Parse role and intent from URL params (search & hash) and localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash
    );

    const urlRole = (
      searchParams.get("role") ||
      searchParams.get("type") ||
      hashParams.get("role") ||
      hashParams.get("type") ||
      ""
    ).toLowerCase();

    const urlIntent = (
      searchParams.get("intent") ||
      hashParams.get("intent") ||
      ""
    ).toLowerCase();

    const userMeta = user.user_metadata || {};
    const effectiveRole = (
      urlRole ||
      localStorage.getItem("oauth_role") ||
      userMeta.role ||
      userMeta.account_type ||
      "parent"
    ).toLowerCase();

    const effectiveIntent = (
      urlIntent ||
      localStorage.getItem("oauth_intent") ||
      "login"
    ).toLowerCase();

    const userEmail = user.email ? user.email.trim().toLowerCase() : "";

    // Extract user's name attributes (handles Google, Apple, and fallback)
    const fullName =
      userMeta.full_name ||
      userMeta.name ||
      [userMeta.given_name, userMeta.family_name].filter(Boolean).join(" ") ||
      (userEmail ? userEmail.split("@")[0] : "Parent");

    const nameParts = fullName.trim().split(" ");
    const firstName = userMeta.given_name || nameParts[0] || (userEmail ? userEmail.split("@")[0] : "Parent");
    const lastName = userMeta.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
    const avatar = userMeta.avatar_url || userMeta.picture || "";

    // Helper: complete student login, link avatar if available, store in session
    const completeStudentLogin = async (student: any) => {
      try {
        const updates: any = {};
        if (!student.profile_image && avatar) {
          updates.profile_image = avatar;
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from("students").update(updates).eq("id", student.id);
          student = { ...student, ...updates };
        }
      } catch (linkErr) {
        console.warn("Notice updating student profile image:", linkErr);
      }

      localStorage.removeItem("oauth_role");
      localStorage.removeItem("oauth_intent");
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
      localStorage.removeItem("oauth_intent");
      localStorage.removeItem("authdStudent");
      localStorage.setItem("authdParent", JSON.stringify([parent]));
      recordActivity(true);
      try {
        await getParentData();
      } catch (pErr) {
        console.warn("Notice refreshing parent state:", pErr);
      }
      const parentName = parent.firstname || firstName || "Parent";
      navigate(parentName ? `/parent-dashboard/${parentName}` : "/parent-dashboard", { replace: true });
    };

    // Helper: find student by ID or email
    const findStudent = async () => {
      try {
        const { data: byId } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .limit(1);
        if (byId && byId.length > 0) return byId[0];

        if (userEmail) {
          const { data: byEmail } = await supabase
            .from("students")
            .select("*")
            .ilike("email", userEmail)
            .limit(1);
          if (byEmail && byEmail.length > 0) return byEmail[0];
        }
      } catch (err) {
        console.warn("Notice finding student:", err);
      }
      return null;
    };

    // Helper: find parent by user_id or email
    const findParent = async () => {
      try {
        const { data: byId } = await supabase
          .from("parents")
          .select("*")
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .limit(1);
        if (byId && byId.length > 0) return byId[0];

        if (userEmail) {
          const { data: byEmail } = await supabase
            .from("parents")
            .select("*")
            .ilike("email", userEmail)
            .limit(1);
          if (byEmail && byEmail.length > 0) return byEmail[0];
        }
      } catch (err) {
        console.warn("Notice finding parent:", err);
      }
      return null;
    };

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: CHECK FOR EXISTING DATABASE PROFILE FIRST (IDEMPOTENCY)
    // ─────────────────────────────────────────────────────────────────
    const existingParent = await findParent();
    if (existingParent) {
      // Existing parent logging in or page refreshed: continue with existing profile
      await completeParentLogin(existingParent);
      return;
    }

    const existingStudent = await findStudent();
    if (existingStudent) {
      // If user is already a student in database, route them to student dashboard
      // unless they are explicitly registering as a new parent with a separate role
      if (effectiveRole !== "parent" || effectiveIntent !== "signup") {
        await completeStudentLogin(existingStudent);
        return;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: HANDLE NEW USER / PROFILE CREATION BASED ON ESTABLISHED ROLE
    // ─────────────────────────────────────────────────────────────────

    // --- CASE A: STUDENT REGISTRATION (Must NEVER create a parent record) ---
    if (effectiveRole === "children" || effectiveRole === "student") {
      const studentProfile = {
        id: user.id,
        email: userEmail || user.email || "",
        firstname: firstName,
        lastname: lastName || "",
        profile_image: avatar || "",
        grade_level: "General",
        school: "Online Learner",
        class: "JSS 1",
        is_child: false,
        subscription: "Basic",
        subscription_status: "active",
        last_payment_ref: null,
        created_at: new Date().toISOString(),
      };

      const { data: createdStudent, error: insertErr } = await supabase
        .from("students")
        .upsert(studentProfile, { onConflict: "id" })
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error("Error creating student record:", insertErr);
        setErrorMsg(`Failed to initialize student profile (${insertErr.message}). Please retry.`);
        isProcessingRef.current = false;
        return;
      }

      const activeStudent = createdStudent || studentProfile;
      await completeStudentLogin(activeStudent);
      return;
    }

    // --- CASE B: PARENT REGISTRATION OR RETURNING PARENT MISSING RECORD ---
    // (effectiveRole === "parent" or default brand new OAuth user)
    const aboutUsText = `${providerLabel} Sign-In`;

    // Only populate existing columns of the parents table:
    // ['id', 'user_id', 'email', 'firstname', 'lastname', 'phone', 'about_us', 'profile_image', 'created_at']
    const parentPayload = {
      user_id: user.id,
      email: userEmail || user.email || "",
      firstname: firstName || "Parent",
      lastname: lastName || "",
      phone: user.phone || null,
      about_us: aboutUsText,
      profile_image: avatar || null,
    };

    // Idempotent upsert on user_id (the unique constraint on parents.user_id)
    const { error: insertErr } = await supabase
      .from("parents")
      .upsert(parentPayload, { onConflict: "user_id" });

    if (insertErr) {
      console.error("Error creating parent profile in parents table:", insertErr);
      setErrorMsg(`Failed to create your parent profile (${insertErr.message}). Please retry.`);
      isProcessingRef.current = false;
      return;
    }

    // Explicitly verify and fetch the created parent row from the database
    const { data: verifiedParent, error: fetchErr } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr || !verifiedParent) {
      console.error("Failed to verify newly created parent row in database:", fetchErr);
      setErrorMsg("Could not verify your parent profile in database. Please click retry.");
      isProcessingRef.current = false;
      return;
    }

    // Database record confirmed: complete login and navigate to parent dashboard
    await completeParentLogin(verifiedParent);
  }, [navigate, setAuthdStudent, getParentData]);

  const handleOAuthCallback = useCallback(async () => {
    // Check if provider returned an error in the query/hash params
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash
    );

    const authError =
      searchParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error_description") ||
      hashParams.get("error");

    if (authError) {
      setErrorMsg(authError);
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session || !session.user) {
        // Listen for session state change if PKCE code or hash is being processed
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, currentSession) => {
            if (currentSession?.user) {
              authListener.subscription.unsubscribe();
              if (!isProcessingRef.current) {
                isProcessingRef.current = true;
                await processUser(currentSession.user);
              }
            }
          }
        );
        return;
      }

      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        await processUser(session.user);
      }
    } catch (err: any) {
      console.error("Auth callback session error:", err);
      setErrorMsg(err.message || "Failed to complete authentication session.");
      isProcessingRef.current = false;
    }
  }, [processUser]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMsg(null);
    isProcessingRef.current = false;

    try {
      if (activeUserRef.current) {
        isProcessingRef.current = true;
        await processUser(activeUserRef.current);
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          isProcessingRef.current = true;
          await processUser(session.user);
        } else {
          setErrorMsg("Authentication session expired. Please sign in again.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Retry failed. Please return to login.");
      isProcessingRef.current = false;
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#F8FAFC" p={6}>
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        textAlign="center"
        maxW="420px"
        w="full"
      >
        {errorMsg ? (
          <VStack gap={4}>
            <Alert.Root status="error" borderRadius="xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title fontSize="sm" fontWeight="700">Account Setup Error</Alert.Title>
                <Alert.Description fontSize="xs">{errorMsg}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Flex gap={3} justify="center" w="full" mt={2}>
              <Button
                size="sm"
                bg="primaryColor"
                color="white"
                borderRadius="xl"
                loading={isRetrying}
                onClick={handleRetry}
              >
                Retry Account Setup
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                onClick={() => navigate("/login")}
              >
                Return to Login
              </Button>
            </Flex>
          </VStack>
        ) : (
          <VStack gap={3}>
            <DancingLogoLoader
              size="lg"
              text={`Completing ${providerName} Authentication...`}
              subtext="Please wait while we verify and set up your iGrade profile."
              minH="120px"
            />
          </VStack>
        )}
      </Box>
    </Flex>
  );
}
