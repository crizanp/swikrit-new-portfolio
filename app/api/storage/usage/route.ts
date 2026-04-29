import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

const buckets = ["portfolio-images", "portfolio-videos", "blog-images", "avatars"];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const usage = await Promise.all(
      buckets.map(async (bucket) => {
        const { data } = await supabase.storage.from(bucket).list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "updated_at", order: "desc" },
        });

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
        };
      })
    );

    return NextResponse.json({ data: usage }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch storage usage." }, { status: 500 });
  }
}
