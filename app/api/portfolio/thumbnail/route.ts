import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import {
  normalizeOptionalUrl,
  resolvePortfolioThumbnailUrl,
  resolvePortfolioThumbnailUrlFromRemote,
} from "@/lib/portfolio-media";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const rawUrl = normalizeOptionalUrl(request.nextUrl.searchParams.get("url"));

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing required url query parameter." }, { status: 400 });
    }

    const thumbnailInput = {
      thumbnail_url: null,
      video_url: rawUrl,
      video_embed: null,
    };

    const immediateThumbnail = resolvePortfolioThumbnailUrl(thumbnailInput);
    if (immediateThumbnail) {
      return NextResponse.json(
        { data: { thumbnail_url: immediateThumbnail, source: "deterministic" } },
        { status: 200 }
      );
    }

    const metadataThumbnail = await resolvePortfolioThumbnailUrlFromRemote(thumbnailInput);

    return NextResponse.json(
      { data: { thumbnail_url: metadataThumbnail, source: metadataThumbnail ? "metadata" : "none" } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to resolve thumbnail preview." }, { status: 500 });
  }
}
