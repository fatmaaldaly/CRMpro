// first layer of authentication

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";


export async function proxy(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname === "/";

  // every matched path except "/" is protected
  if (!user.user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // logged in users skip the login page, same role redirect as the login form
  if (user.user && isLoginPage) {
    const { data: profile } = await supabase
      .from("Profile")
      .select("role")
      .eq("id", user.user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "MANAGER" ? "/report" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });

}


export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/leads/:path*",
    "/reminders/:path*",
    "/report/:path*",
    "/admin/:path*",
  ],
};
