import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import {
  defaultProfileSettings,
  defaultSocialStatsSettings,
  normalizeProfileSettings,
  normalizeSocialStatsSettings,
  type ProfileSettings,
  type SocialStatsSettings,
} from "@/lib/site-settings";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["profile", "social_stats"]);

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json(
          {
            data: {
              profile: defaultProfileSettings,
              social: defaultSocialStatsSettings,
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    const profileRow = rows.find((row) => row.setting_key === "profile");
    const socialRow = rows.find((row) => row.setting_key === "social_stats");
    const profile = normalizeProfileSettings(
      (profileRow?.setting_value ?? {}) as Partial<ProfileSettings>
    );
    const social = normalizeSocialStatsSettings(
      (socialRow?.setting_value ?? {}) as Partial<SocialStatsSettings>
    );

    return NextResponse.json(
      {
        data: {
          profile,
          social,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to fetch settings." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      profile?: Partial<ProfileSettings>;
      social?: Partial<SocialStatsSettings>;
    };
    const profile = normalizeProfileSettings(payload.profile);
    const social = normalizeSocialStatsSettings(payload.social);

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        [
          {
            setting_key: "profile",
            setting_value: profile,
            updated_at: new Date().toISOString(),
          },
          {
            setting_key: "social_stats",
            setting_value: social,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "setting_key" }
      )
      .select("setting_key, setting_value")
      .order("setting_key", { ascending: true });

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("site settings");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update settings." }, { status: 500 });
  }
}
