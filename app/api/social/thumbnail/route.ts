import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import {
  normalizeOptionalUrl,
  resolvePortfolioThumbnailUrl,
  resolvePortfolioThumbnailUrlFromRemote,
} from "@/lib/portfolio-media";
import { createClient } from "@/lib/supabase/server";

function normalizeEmbedCode(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      post_url?: string | null;
      embed_code?: string | null;
      thumbnail_url?: string | null;
    };

    const thumbnailInput = {
      thumbnail_url: normalizeOptionalUrl(payload.thumbnail_url),
      video_url: normalizeOptionalUrl(payload.post_url),
      video_embed: normalizeEmbedCode(payload.embed_code),
    };

    const deterministicThumbnail = resolvePortfolioThumbnailUrl(thumbnailInput);

    if (deterministicThumbnail) {
      return NextResponse.json(
        { data: { thumbnail_url: deterministicThumbnail, source: "deterministic" } },
        { status: 200 }
      );
    }

    const metadataThumbnail = await resolvePortfolioThumbnailUrlFromRemote({
      ...thumbnailInput,
      thumbnail_url: null,
    });

    return NextResponse.json(
      {
        data: {
          thumbnail_url: metadataThumbnail,
          source: metadataThumbnail ? "metadata" : "none",
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to resolve social thumbnail." }, { status: 500 });
  }
}
