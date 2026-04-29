import {
  SettingsManager,
  type ProfileSettings,
  type SocialStatsSettings,
  type StorageUsage,
} from "@/components/admin/SettingsManager";
import { getSiteStats } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Settings",
};

async function loadStorageUsage(): Promise<StorageUsage[]> {
  try {
    const supabase = createClient();
    const buckets = ["portfolio-images", "portfolio-videos", "blog-images", "avatars"];

    const bucketRows = await Promise.all(
      buckets.map(async (bucket) => {
        const { data, error } = await supabase.storage.from(bucket).list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "updated_at", order: "desc" },
        });

        if (error) {
          return {
            bucket,
            totalFiles: 0,
            totalSize: 0,
            files: [],
          } satisfies StorageUsage;
        }

        const files = (data ?? [])
          .filter((entry) => typeof entry.metadata?.size === "number")
          .map((entry) => ({
            name: entry.name,
            size: Number(entry.metadata?.size ?? 0),
            updated_at: entry.updated_at ?? null,
          }));

        return {
          bucket,
          totalFiles: files.length,
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
          files,
        } satisfies StorageUsage;
      })
    );

    return bucketRows;
  } catch {
    return [];
  }
}

async function loadProfileSettings(): Promise<ProfileSettings> {
  const supabase = createClient();

  try {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "profile")
      .maybeSingle();

    const profile = (data?.setting_value ?? {}) as Partial<ProfileSettings>;

    return {
      display_name: profile.display_name ?? "Swikrit Pokhrel",
      bio: profile.bio ?? "",
    };
  } catch {
    return {
      display_name: "Swikrit Pokhrel",
      bio: "",
    };
  }
}

async function loadSocialStatsSettings(): Promise<SocialStatsSettings> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "social_stats")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const social = (data?.setting_value ?? {}) as Partial<SocialStatsSettings>;

    return {
      instagram_handle: social.instagram_handle ?? "@swikritpokhrel",
      instagram_followers: social.instagram_followers ?? "24K+",
      tiktok_handle: social.tiktok_handle ?? "@swikritpokhrel",
      tiktok_followers: social.tiktok_followers ?? "18K+",
      linkedin_handle: social.linkedin_handle ?? "swikrit-pokhrel",
      linkedin_followers: social.linkedin_followers ?? "6K+",
      total_views_label: social.total_views_label ?? "12M+",
    };
  } catch {
    return {
      instagram_handle: "@swikritpokhrel",
      instagram_followers: "24K+",
      tiktok_handle: "@swikritpokhrel",
      tiktok_followers: "18K+",
      linkedin_handle: "swikrit-pokhrel",
      linkedin_followers: "6K+",
      total_views_label: "12M+",
    };
  }
}

export default async function AdminSettingsPage() {
  const [stats, profile, social, storageUsage] = await Promise.all([
    getSiteStats(),
    loadProfileSettings(),
    loadSocialStatsSettings(),
    loadStorageUsage(),
  ]);

  return (
    <SettingsManager
      initialStats={stats}
      initialProfile={profile}
      initialSocial={social}
      initialStorageUsage={storageUsage}
    />
  );
}
