import { NextRequest, NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/admin-auth/server";
import { matchesAdminCredentials } from "@/lib/admin-auth/shared";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    const email = payload.email?.trim() ?? "";
    const password = payload.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!matchesAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    setAdminSessionCookie(response);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
