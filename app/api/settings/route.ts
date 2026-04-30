import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

type ProfileSettings = {
  display_name?: string;
  bio?: string;
};

type SocialStatsSettings = {
  instagram_handle?: string;
  instagram_followers?: string;
  tiktok_handle?: string;
  tiktok_followers?: string;
  linkedin_handle?: string;
  linkedin_followers?: string;
  total_views_label?: string;
};

const defaultProfile: ProfileSettings = {
  display_name: "Swikrit Pokhrel",
  bio: "",
};

const defaultSocial: SocialStatsSettings = {
  instagram_handle: "@swikritpokhrel",
  instagram_followers: "24K+",
  tiktok_handle: "@swikritpokhrel",
  tiktok_followers: "18K+",
  linkedin_handle: "swikrit-pokhrel",
  linkedin_followers: "6K+",
  total_views_label: "12M+",
};

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
              profile: defaultProfile,
              social: defaultSocial,
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

    return NextResponse.json(
      {
        data: {
          profile: (profileRow?.setting_value ?? {
            ...defaultProfile,
          }) as ProfileSettings,
          social: (socialRow?.setting_value ?? {
            ...defaultSocial,
          }) as SocialStatsSettings,
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
      profile?: ProfileSettings;
      social?: SocialStatsSettings;
    };

    const profile = {
      display_name: payload.profile?.display_name?.trim() || "Swikrit Pokhrel",
      bio: payload.profile?.bio?.trim() || "",
    };

    const social = {
      instagram_handle: payload.social?.instagram_handle?.trim() || "@swikritpokhrel",
      instagram_followers: payload.social?.instagram_followers?.trim() || "24K+",
      tiktok_handle: payload.social?.tiktok_handle?.trim() || "@swikritpokhrel",
      tiktok_followers: payload.social?.tiktok_followers?.trim() || "18K+",
      linkedin_handle: payload.social?.linkedin_handle?.trim() || "swikrit-pokhrel",
      linkedin_followers: payload.social?.linkedin_followers?.trim() || "6K+",
      total_views_label: payload.social?.total_views_label?.trim() || "12M+",
    };

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
