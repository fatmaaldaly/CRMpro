import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // gets user from session automatically
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // fetch role
  const { data: profile, error: profileError } = await supabase
    .from("Profile") 
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: profile?.role ?? "agent",
  });
}