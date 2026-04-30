import {
  SettingsManager,
  type StorageUsage,
} from "@/components/admin/SettingsManager";
import { getPublicSiteSettings, getSiteStats } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin Settings",
};

async function loadStorageUsage(): Promise<StorageUsage[]> {
  try {
    const supabase = createAdminClient();
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

export default async function AdminSettingsPage() {
  const [stats, publicSettings, storageUsage] = await Promise.all([
    getSiteStats(),
    getPublicSiteSettings(),
    loadStorageUsage(),
  ]);

  return (
    <SettingsManager
      initialStats={stats}
      initialProfile={publicSettings.profile}
      initialSocial={publicSettings.social}
      initialStorageUsage={storageUsage}
    />
  );
}
