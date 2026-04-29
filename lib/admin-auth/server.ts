import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
  isValidAdminSessionToken,
} from "@/lib/admin-auth/shared";

type SupabaseAuthLikeClient = {
  auth: {
    getUser: () => Promise<{ data: { user: unknown | null } }>;
  };
};

async function hasSupabaseUser(supabase: SupabaseAuthLikeClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function isAdminRequestAuthorized(
  request: NextRequest,
  supabase?: SupabaseAuthLikeClient
) {
  if (supabase && (await hasSupabaseUser(supabase))) {
    return true;
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(sessionToken);
}

export async function requireAdminAuth(
  request: NextRequest,
  supabase?: SupabaseAuthLikeClient
) {
  if (await isAdminRequestAuthorized(request, supabase)) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    ...cookieBase,
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionToken(),
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    ...cookieBase,
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
  });
}
