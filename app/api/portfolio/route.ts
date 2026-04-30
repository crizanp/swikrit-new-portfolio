import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackPortfolio } from "@/lib/constants";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const featuredOnly = searchParams.get("featured") === "true";
    const category = searchParams
      .get("category")
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
    const limit = Number(searchParams.get("limit") ?? 0);

    let query = supabase
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      if (isSchemaNotReadyError(error)) {
        const fallback = fallbackPortfolio
          .filter((item) => {
            const featuredMatch = featuredOnly ? item.is_featured : true;
            const categoryMatch = category
              ? (item.category ?? "").toLowerCase().trim().replace(/\s+/g, "_") === category
              : true;

            return featuredMatch && categoryMatch;
          })
          .slice(0, Number.isFinite(limit) && limit > 0 ? limit : undefined);

        return NextResponse.json({ data: fallback }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch portfolio items." },
      { status: 500 }
    );
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
      title?: string;
      description?: string;
      category?: string;
      client?: string;
      thumbnail_url?: string;
      video_url?: string;
      video_embed?: string;
      tags?: string[];
      is_featured?: boolean;
      display_order?: number;
    };

    if (!payload.title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("portfolio items");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create portfolio item." },
      { status: 500 }
    );
  }
}
