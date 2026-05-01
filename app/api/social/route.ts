import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackSocialPosts } from "@/lib/constants";
import {
  normalizeOptionalUrl,
  resolvePortfolioThumbnailUrl,
  resolvePortfolioThumbnailUrlFromRemote,
} from "@/lib/portfolio-media";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

function hasOwn(payload: object, key: string) {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function normalizeEmbedCode(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function resolveSocialThumbnail(input: {
  thumbnail_url: string | null | undefined;
  post_url: string | null | undefined;
  embed_code: string | null | undefined;
}) {
  const resolvedThumbnail = resolvePortfolioThumbnailUrl({
    thumbnail_url: normalizeOptionalUrl(input.thumbnail_url),
    video_url: normalizeOptionalUrl(input.post_url),
    video_embed: normalizeEmbedCode(input.embed_code),
  });

  if (resolvedThumbnail) {
    return resolvedThumbnail;
  }

  return resolvePortfolioThumbnailUrlFromRemote({
    thumbnail_url: null,
    video_url: normalizeOptionalUrl(input.post_url),
    video_embed: normalizeEmbedCode(input.embed_code),
  });
}

export async function GET() {
  try {
    const supabase = createClient();
    const orderedQuery = await supabase
      .from("social_posts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("posted_at", { ascending: false });

    if (!orderedQuery.error) {
      return NextResponse.json({ data: orderedQuery.data ?? [] }, { status: 200 });
    }

    if (isSchemaNotReadyError(orderedQuery.error)) {
      return NextResponse.json({ data: fallbackSocialPosts }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ data: fallbackSocialPosts }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch social posts." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      platform?: string;
      post_url?: string;
      embed_code?: string;
      caption?: string;
      thumbnail_url?: string;
      likes_count?: number;
      is_featured?: boolean;
      posted_at?: string;
      display_order?: number;
    };

    if (!payload.platform) {
      return NextResponse.json({ error: "Platform is required." }, { status: 400 });
    }

    const insertPayload = { ...payload };

    if (hasOwn(insertPayload, "post_url")) {
      insertPayload.post_url = normalizeOptionalUrl(insertPayload.post_url) ?? undefined;
    }

    if (hasOwn(insertPayload, "embed_code")) {
      insertPayload.embed_code = normalizeEmbedCode(insertPayload.embed_code) ?? undefined;
    }

    if (hasOwn(insertPayload, "thumbnail_url")) {
      insertPayload.thumbnail_url = normalizeOptionalUrl(insertPayload.thumbnail_url) ?? undefined;
    }

    if (!insertPayload.thumbnail_url) {
      const generatedThumbnail = await resolveSocialThumbnail({
        thumbnail_url: null,
        post_url: insertPayload.post_url ?? null,
        embed_code: insertPayload.embed_code ?? null,
      });

      if (generatedThumbnail) {
        insertPayload.thumbnail_url = generatedThumbnail;
      }
    }

    let { data, error } = await supabase
      .from("social_posts")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error && insertPayload.display_order !== undefined && error.message.includes("display_order")) {
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.display_order;
      const fallbackInsert = await supabase
        .from("social_posts")
        .insert(fallbackPayload)
        .select("*")
        .single();

      data = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("social posts");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create social post." }, { status: 500 });
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
      id?: string;
      platform?: string;
      post_url?: string;
      embed_code?: string;
      caption?: string;
      thumbnail_url?: string;
      likes_count?: number;
      is_featured?: boolean;
      posted_at?: string;
      display_order?: number;
    };

    if (!payload.id) {
      return NextResponse.json({ error: "Social post id is required." }, { status: 400 });
    }

    const needsMediaResolution =
      hasOwn(payload, "post_url") || hasOwn(payload, "embed_code") || hasOwn(payload, "thumbnail_url");

    const { id, ...updatePayload } = payload;

    if (hasOwn(updatePayload, "post_url")) {
      updatePayload.post_url = normalizeOptionalUrl(updatePayload.post_url) ?? undefined;
    }

    if (hasOwn(updatePayload, "embed_code")) {
      updatePayload.embed_code = normalizeEmbedCode(updatePayload.embed_code) ?? undefined;
    }

    if (hasOwn(updatePayload, "thumbnail_url")) {
      updatePayload.thumbnail_url = normalizeOptionalUrl(updatePayload.thumbnail_url) ?? undefined;
    }

    if (needsMediaResolution) {
      const { data: existing, error: existingError } = await supabase
        .from("social_posts")
        .select("thumbnail_url, post_url, embed_code")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        if (isSchemaNotReadyError(existingError)) {
          return schemaNotReadyWriteResponse("social posts");
        }

        return NextResponse.json({ error: existingError.message }, { status: 500 });
      }

      if (!existing) {
        return NextResponse.json({ error: "Social post not found." }, { status: 404 });
      }

      const mergedThumbnailInput = {
        thumbnail_url: hasOwn(updatePayload, "thumbnail_url")
          ? updatePayload.thumbnail_url ?? null
          : normalizeOptionalUrl(existing.thumbnail_url),
        post_url: hasOwn(updatePayload, "post_url")
          ? updatePayload.post_url ?? null
          : normalizeOptionalUrl(existing.post_url),
        embed_code: hasOwn(updatePayload, "embed_code")
          ? updatePayload.embed_code ?? null
          : normalizeEmbedCode(existing.embed_code),
      };

      updatePayload.thumbnail_url = await resolveSocialThumbnail(mergedThumbnailInput) ?? undefined;
    }

    let { data, error } = await supabase
      .from("social_posts")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (
      error &&
      updatePayload.display_order !== undefined &&
      error.message.includes("display_order")
    ) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.display_order;
      const fallbackUpdate = await supabase
        .from("social_posts")
        .update(fallbackPayload)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      data = fallbackUpdate.data;
      error = fallbackUpdate.error;
    }

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("social posts");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Social post not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update social post." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as { id?: string };

    if (!payload.id) {
      return NextResponse.json({ error: "Social post id is required." }, { status: 400 });
    }

    const { error } = await supabase.from("social_posts").delete().eq("id", payload.id);

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("social posts");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete social post." }, { status: 500 });
  }
}
