import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseAnonKey: string =
  process.env.SUPABASE_ANON_KEY as string;

const supabaseServiceRoleKey: string =
  process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Normal Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Admin Supabase client
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);