import { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "../config/supabase";

export interface PublicUser {
  id: string;
  email: string | undefined;
  username: string;
  fullName: string;
}

export const getPublicUser = async (user: User): Promise<PublicUser | null> => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, full_name")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: profile.username,
    fullName: profile.full_name,
  };
};

export const revokeSession = async (accessToken: string) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

  if (error) {
    console.error("LOGOUT REVOKE ERROR:", error.message);
  }
};
