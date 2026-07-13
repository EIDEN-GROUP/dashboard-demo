import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anon = import.meta.env.VITE_SUPABASE_ANON ?? "";

if (!url || !anon) {
  console.warn("[supabase-browser] VITE_SUPABASE_URL or VITE_SUPABASE_ANON missing");
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "gestio_auth",
  },
});
