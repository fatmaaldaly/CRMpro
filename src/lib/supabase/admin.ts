import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← NOT the anon key
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

export default admin;