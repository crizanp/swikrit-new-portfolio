import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
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

    let { data, error } = await supabase
      .from("social_posts")
      .insert(payload)
      .select("*")
      .single();

    if (error && payload.display_order !== undefined && error.message.includes("display_order")) {
      const fallbackPayload = { ...payload };
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

    const { id, ...updatePayload } = payload;
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete social post." }, { status: 500 });
  }
}
