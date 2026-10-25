import { supabase } from "./supabaseClient";
import { isNativeMobile } from "./apiConfig";
import { Browser } from "@capacitor/browser";

export const initiateGoogleOAuth = async (role: string, intent: "login" | "signup") => {
  localStorage.setItem("oauth_role", role);
  localStorage.setItem("oauth_intent", intent);

  const native = isNativeMobile();

  // On Native Mobile, use the custom scheme deep link; on Web, use window.location.origin
  const redirectTo = native
    ? `com.igrades.app://auth/callback?role=${encodeURIComponent(role)}&intent=${encodeURIComponent(intent)}`
    : `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}&intent=${encodeURIComponent(intent)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: native,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
      data: {
        role,
      },
    },
  });

  if (error) {
    throw error;
  }

  // On native mobile, open Chrome Custom Tabs / SFSafariViewController
  if (native && data?.url) {
    await Browser.open({ url: data.url, windowName: "_system" });
  }

  return data;
};

export const initiateAppleOAuth = async (role: string, intent: "login" | "signup") => {
  localStorage.setItem("oauth_role", role);
  localStorage.setItem("oauth_intent", intent);

  const native = isNativeMobile();

  const redirectTo = native
    ? `com.igrades.app://auth/callback?role=${encodeURIComponent(role)}&intent=${encodeURIComponent(intent)}`
    : `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}&intent=${encodeURIComponent(intent)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo,
      skipBrowserRedirect: native,
      data: {
        role,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (native && data?.url) {
    await Browser.open({ url: data.url, windowName: "_system" });
  }

  return data;
};
