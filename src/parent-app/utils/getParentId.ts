import { supabase } from '../../lib/supabaseClient';

export const getParentId = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    if (!sessionUser) return null;
    return getParentIdForUser(sessionUser);
  }

  return getParentIdForUser(user);
};

async function getParentIdForUser(user: { id: string; email?: string }): Promise<string | null> {
  // 1. Try finding by user_id
  const { data: parentByUserId } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (parentByUserId?.id) return parentByUserId.id;

  // 2. Fallback to matching by email
  if (user.email) {
    const { data: parentByEmail } = await supabase
      .from("parents")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (parentByEmail?.id) return parentByEmail.id;
  }

  // 3. Fallback to cached parent in localStorage
  try {
    const cached = localStorage.getItem("authdParent");
    if (cached) {
      const parsed = JSON.parse(cached);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (first?.id) return first.id;
    }
  } catch {
    // ignore
  }

  // 4. Default to user's auth UID (which is used as parent id in iGrades)
  return user.id;
}
