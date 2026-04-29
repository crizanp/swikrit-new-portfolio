import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const unauthorized = await requireAdminAuth(request, supabase);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}
