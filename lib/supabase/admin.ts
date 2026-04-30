import { createClient } from "@supabase/supabase-js";

function readJwtRole(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      role?: unknown;
    };

    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function resolvePrivilegedApiKey(rawValue: string) {
  const key = rawValue.trim();

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is set to a publishable key. Use a Supabase secret key (sb_secret_...) or legacy service_role key."
    );
  }

  const role = readJwtRole(key);
  if (role === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is set to an anon key. Use a Supabase secret key (sb_secret_...) or legacy service_role key."
    );
  }

  return key;
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local to enable server-side storage operations."
    );
  }

  const privilegedKey = resolvePrivilegedApiKey(serviceRoleKey);

  return createClient(url, privilegedKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
