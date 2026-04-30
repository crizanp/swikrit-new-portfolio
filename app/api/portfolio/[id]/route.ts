import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackPortfolio } from "@/lib/constants";
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

        return NextResponse.json({ data: fallback }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
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
      thumbnail_url?: string;
      video_url?: string;
      video_embed?: string;
      tags?: string[];
      is_featured?: boolean;
      display_order?: number;
    };

    const { data, error } = await supabase
      .from("portfolio_items")
      .update(payload)
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

    return NextResponse.json({ data }, { status: 200 });
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
