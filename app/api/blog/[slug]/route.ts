import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const publishedOnly = request.nextUrl.searchParams.get("published") !== "false";
    const supabase = createClient();

    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .limit(1);

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch blog post." }, { status: 500 });
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
      slug?: string;
      excerpt?: string;
      content?: string;
      cover_image?: string;
      tags?: string[];
      is_published?: boolean;
      published_at?: string;
      meta_title?: string;
      meta_description?: string;
      read_time?: number;
    };

    const { data, error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("slug", params.slug)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update blog post." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const { error } = await supabase.from("blog_posts").delete().eq("slug", params.slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete blog post." }, { status: 500 });
  }
}
