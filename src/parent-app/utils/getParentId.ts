import { supabase } from '../../lib/supabaseClient';

export const getParentId = async (): Promise<string | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) return null;

  const { data: parent, error } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !parent) return null;

  return parent.id;
};
