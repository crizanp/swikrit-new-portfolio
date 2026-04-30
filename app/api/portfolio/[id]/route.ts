import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackPortfolio } from "@/lib/constants";
import {
  normalizeOptionalUrl,
  resolvePortfolioThumbnailUrl,
  withResolvedPortfolioThumbnail,
} from "@/lib/portfolio-media";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: {
    id: string;
  };
}

function hasOwn(payload: object, key: string) {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        const fallback = fallbackPortfolio.find((item) => item.id === params.id) ?? null;

        if (!fallback) {
          return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
        }

        return NextResponse.json({ data: withResolvedPortfolioThumbnail(fallback) }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    return NextResponse.json({ data: withResolvedPortfolioThumbnail(data) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch portfolio item." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      client?: string;
      thumbnail_url?: string | null;
      video_url?: string | null;
      video_embed?: string | null;
      tags?: string[];
      is_featured?: boolean;
      display_order?: number;
    };

    const { data: existing, error: existingError } = await supabase
      .from("portfolio_items")
      .select("thumbnail_url, video_url, video_embed")
      .eq("id", params.id)
      .maybeSingle();

    if (existingError) {
      if (isSchemaNotReadyError(existingError)) {
        return schemaNotReadyWriteResponse("portfolio items");
      }

      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    const updatePayload = { ...payload };

    if (hasOwn(updatePayload, "thumbnail_url")) {
      updatePayload.thumbnail_url = normalizeOptionalUrl(updatePayload.thumbnail_url);
    }

    if (hasOwn(updatePayload, "video_url")) {
      updatePayload.video_url = normalizeOptionalUrl(updatePayload.video_url);
    }

    if (hasOwn(updatePayload, "video_embed")) {
      updatePayload.video_embed = normalizeOptionalUrl(updatePayload.video_embed);
    }

    if (
      hasOwn(updatePayload, "thumbnail_url") ||
      hasOwn(updatePayload, "video_url") ||
      hasOwn(updatePayload, "video_embed")
    ) {
      updatePayload.thumbnail_url = resolvePortfolioThumbnailUrl({
        thumbnail_url:
          updatePayload.thumbnail_url ?? normalizeOptionalUrl(existing.thumbnail_url),
        video_url: updatePayload.video_url ?? normalizeOptionalUrl(existing.video_url),
        video_embed:
          updatePayload.video_embed ?? normalizeOptionalUrl(existing.video_embed),
      });
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .update(updatePayload)
      .eq("id", params.id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("portfolio items");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    return NextResponse.json({ data: withResolvedPortfolioThumbnail(data) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update portfolio item." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const { error } = await supabase.from("portfolio_items").delete().eq("id", params.id);

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("portfolio items");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete portfolio item." }, { status: 500 });
  }
}
