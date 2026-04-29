import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore Supabase sign-out errors so custom session cookie is still cleared.
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAdminSessionCookie(response);
  return response;
}
